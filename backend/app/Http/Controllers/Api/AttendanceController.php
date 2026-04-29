<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    /**
     * Receive raw logs from ZKT device
     */
    public function fetchFromDevice()
    {
        $zktService = app(\App\Services\ZktDeviceService::class);
        $logs = $zktService->getAttendanceLogs();

        if (empty($logs)) {
            return response()->json(['message' => "No new logs found or device unreachable."], 200);
        }

        $inserted = 0;
        foreach ($logs as $logData) {
            // ZKTeco returns: [ 'id' => '101', 'timestamp' => '2023-01-01 10:00:00', 'state' => 1 ]
            $deviceUserId = (string)$logData['id'];
            
            // Find employee by device_user_id
            $employee = \App\Models\Employee::where('device_user_id', $deviceUserId)->first();

            $log = \App\Models\AttendanceLog::firstOrCreate([
                'device_user_id' => $deviceUserId,
                'timestamp' => \Carbon\Carbon::parse($logData['timestamp']),
            ], [
                'employee_id' => $employee ? $employee->id : null,
                'status' => isset($logData['state']) ? (string)$logData['state'] : null,
            ]);
            
            if ($log->wasRecentlyCreated) {
                $inserted++;
            }
        }

        return response()->json(['message' => "$inserted new logs fetched from device successfully"]);
    }

    /**
     * Process logs for a specific date or today
     */
    public function processLogs(Request $request)
    {
        $date = $request->input('date', date('Y-m-d'));
        $dayOfWeek = \Carbon\Carbon::parse($date)->dayOfWeek; // 0 (Sunday) to 6 (Saturday)

        $employees = \App\Models\Employee::with('instructor')->get();
        $processedCount = 0;

        foreach ($employees as $employee) {
            $shiftsToProcess = [];

            if ($employee->type === 'instructor' && $employee->instructor) {
                // Fetch ProgramSchedules for this instructor
                $schedules = \App\Models\ProgramSchedule::where('instructor_id', $employee->instructor->id)->get();
                foreach ($schedules as $schedule) {
                    $shiftsToProcess[] = [
                        'id' => $schedule->id,
                        'name' => 'Slot (Prog ' . $schedule->program_id . ')',
                        'start_time' => $schedule->start_time,
                        'end_time' => $schedule->end_time,
                        'grace_period_minutes' => 15, // Default grace period for slots
                        'type' => 'program_schedule'
                    ];
                }
            } else {
                // Fetch EmployeeShifts for staff
                $employeeShifts = \App\Models\EmployeeShift::with('shift')
                    ->where('employee_id', $employee->id)
                    ->where('day_of_week', $dayOfWeek)
                    ->get();
                    
                foreach ($employeeShifts as $empShift) {
                    if ($empShift->shift) {
                        $shiftsToProcess[] = [
                            'id' => $empShift->shift->id,
                            'name' => $empShift->shift->name,
                            'start_time' => $empShift->shift->start_time,
                            'end_time' => $empShift->shift->end_time,
                            'grace_period_minutes' => $empShift->shift->grace_period_minutes,
                            'type' => 'shift'
                        ];
                    }
                }
            }

            if (empty($shiftsToProcess)) {
                continue; // No shifts/slots for this employee today
            }

            // Get all logs for this employee on this date
            $logs = \App\Models\AttendanceLog::where('employee_id', $employee->id)
                ->whereDate('timestamp', $date)
                ->orderBy('timestamp', 'asc')
                ->get();

            if ($logs->isEmpty()) {
                foreach ($shiftsToProcess as $shiftObj) {
                    $this->saveAttendance($employee->id, $shiftObj, $date, null, null, 'absent');
                }
                continue;
            }

            foreach ($shiftsToProcess as $shiftObj) {
                $shiftStart = \Carbon\Carbon::parse("$date {$shiftObj['start_time']}");
                $shiftEnd = \Carbon\Carbon::parse("$date {$shiftObj['end_time']}");
                
                // Handle overnight shifts (if end < start)
                if ($shiftEnd->lt($shiftStart)) {
                    $shiftEnd->addDay();
                }

                $durationMinutes = $shiftStart->diffInMinutes($shiftEnd);
                $midPoint = $shiftStart->copy()->addMinutes($durationMinutes / 2);

                $windowStart = $shiftStart->copy()->subMinutes(60); // 1 hour before shift
                $windowEnd = $shiftEnd->copy()->addMinutes(60); // 1 hour after shift

                // Filter logs for this shift's window
                $shiftLogs = $logs->filter(function($log) use ($windowStart, $windowEnd) {
                    $logTime = \Carbon\Carbon::parse($log->timestamp);
                    return $logTime->between($windowStart, $windowEnd);
                });

                if ($shiftLogs->isEmpty()) {
                    $this->saveAttendance($employee->id, $shiftObj, $date, null, null, 'absent');
                    continue;
                }

                // Refined log pairing:
                // 1. Sort logs by time
                $sortedLogs = $shiftLogs->sortBy('timestamp');
                $firstLog = $sortedLogs->first();
                $lastLog = $sortedLogs->last();

                $checkInTime = null;
                $checkOutTime = null;

                if ($firstLog) {
                    $checkInTime = \Carbon\Carbon::parse($firstLog->timestamp);
                    
                    // Only assign check-out if there's a different second log
                    if ($sortedLogs->count() > 1 && $lastLog->id !== $firstLog->id) {
                        $checkOutTime = \Carbon\Carbon::parse($lastLog->timestamp);
                    }
                }

                $status = 'absent';
                $gracePeriod = $shiftObj['grace_period_minutes'] ?? 0;
                $allowedStartTime = $shiftStart->copy()->addMinutes($gracePeriod);

                if ($checkInTime) {
                    if ($checkInTime->lte($allowedStartTime)) {
                        $status = 'ontime';
                    } else {
                        $status = 'late';
                    }
                    
                    if ($checkOutTime && $checkOutTime->lt($shiftEnd)) {
                        $status = 'early';
                    }
                }

                $this->saveAttendance($employee->id, $shiftObj, $date, $checkInTime, $checkOutTime, $status);
                $processedCount++;
            }
        }

        return response()->json(['message' => "Processed $processedCount attendance records for $date"]);
    }

    private function saveAttendance($employeeId, $shiftObj, $date, $checkIn, $checkOut, $status)
    {
        $matchQuery = [
            'employee_id' => $employeeId,
            'date' => $date,
        ];
        
        if ($shiftObj['type'] === 'program_schedule') {
            $matchQuery['program_schedule_id'] = $shiftObj['id'];
        } else {
            $matchQuery['shift_id'] = $shiftObj['id'];
        }

        \App\Models\Attendance::updateOrCreate(
            $matchQuery,
            [
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'status' => $status,
            ]
        );
    }

    /**
     * Get attendance reports
     */
    public function index(Request $request)
    {
        $query = \App\Models\Attendance::with([
            'employee', 
            'shift', 
            'programSchedule.program'
        ]);

        if ($request->has('date')) {
            $query->where('date', $request->date);
        }
        
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        if ($request->has('employee_id') && $request->employee_id !== '') {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderBy('date', 'desc')->get());
    }

    /**
     * Get attendance summary statistics
     */
    public function getSummary(Request $request)
    {
        $query = \App\Models\Attendance::query();

        if ($request->has('date')) {
            $query->where('date', $request->date);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        if ($request->has('employee_id') && $request->employee_id !== '') {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        $attendances = $query->get();

        $totalDays = $attendances->count();
        $presentDays = $attendances->where('status', '!=', 'absent')->count();
        $absentDays = $attendances->where('status', 'absent')->count();
        $onTimeDays = $attendances->where('status', 'ontime')->count();
        $lateDays = $attendances->where('status', 'late')->count();
        $earlyLeaves = $attendances->where('status', 'early')->count();

        $totalSeconds = 0;
        foreach ($attendances as $att) {
            if ($att->check_in && $att->check_out) {
                $seconds = $att->check_out->timestamp - $att->check_in->timestamp;
                // If negative (e.g. night shift without date change in DB), assume it ended next day (+24h)
                if ($seconds < 0) {
                    $seconds += 86400; 
                }
                $totalSeconds += $seconds;
            }
        }

        $totalHours = round($totalSeconds / 3600, 2);
        $avgHours = $presentDays > 0 ? round($totalHours / $presentDays, 2) : 0;

        return response()->json([
            'total_days' => $totalDays,
            'present_days' => $presentDays,
            'absent_days' => $absentDays,
            'ontime_days' => $onTimeDays,
            'late_days' => $lateDays,
            'early_leaves' => $earlyLeaves,
            'total_hours' => $totalHours,
            'avg_hours' => $avgHours,
        ]);
    }
}
