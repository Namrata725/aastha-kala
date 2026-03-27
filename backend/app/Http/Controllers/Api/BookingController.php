<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Program;
use App\Models\ProgramSchedule;
use App\Models\Instructor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    // GET /api/bookings
    public function index()
    {
        $bookings = Booking::with(['program', 'schedules.instructor', 'schedule.instructor', 'instructor'])
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }

    // POST /api/bookings
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'program_id' => 'required|exists:programs,id',
            'schedule_id' => 'nullable|exists:program_schedules,id',
            'schedule_ids' => 'nullable|array',
            'schedule_ids.*' => 'exists:program_schedules,id',
            'instructor_id' => 'nullable|exists:instructors,id',
            'booking_date' => 'required|date',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email',
            'message' => 'nullable|string',
            'class_mode' => 'required|in:online,physical',
            'type' => 'required|in:regular,customization',
            'custom_start_time' => 'nullable|date_format:H:i',
            'custom_end_time' => 'nullable|date_format:H:i',
            'duration_value' => 'nullable|integer|min:1',
            'duration_unit' => 'nullable|in:days,months,years',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $booking = Booking::create($request->all());

        if ($request->has('schedule_ids')) {
            $booking->schedules()->sync($request->schedule_ids);
        }

        $booking->load(['program', 'schedules', 'instructor']);

        return response()->json([
            'success' => true,
            'message' => 'Booking created successfully',
            'data' => $booking
        ], 201);
    }

    // GET /api/bookings/{id}
    public function show($id)
    {
        $booking = Booking::with(['program', 'schedules.instructor', 'schedule.instructor', 'instructor'])->find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $booking
        ]);
    }

    // PUT /api/bookings/{id}
    public function update(Request $request, $id)
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found'
            ], 404);
        }

        
        $validator = Validator::make($request->all(), [
            'program_id' => 'nullable|exists:programs,id',
            'schedule_id' => 'nullable|exists:program_schedules,id',
            'instructor_id' => 'nullable|exists:instructors,id',
            'booking_date' => 'nullable|date',
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'message' => 'nullable|string',
            'class_mode' => 'nullable|in:online,physical',
            'type' => 'nullable|in:regular,customization',
            'custom_start_time' => 'nullable|date_format:H:i',
            'custom_end_time' => 'nullable|date_format:H:i',
            'duration_value' => 'nullable|integer|min:1',
            'duration_unit' => 'nullable|in:days,months,years',
            'status' => 'nullable|in:pending,accepted,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $booking->update($request->all());

        if ($request->has('schedule_ids')) {
            $booking->schedules()->sync($request->schedule_ids);
        }

        $booking->load(['program', 'schedules.instructor', 'schedule.instructor', 'instructor']);

        return response()->json([
            'success' => true,
            'message' => 'Booking updated successfully',
            'data' => $booking
        ]);
    }

    // PATCH /api/bookings/{id}/status
    public function updateStatus(Request $request, $id)
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,accepted,rejected',
            'instructor_id' => 'nullable|exists:instructors,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $booking->status = $request->status;
        if ($request->has('instructor_id')) {
            $booking->instructor_id = $request->instructor_id;
        }
        $booking->save();

        $booking->load(['program', 'schedule.instructor', 'schedules.instructor', 'instructor']);

        return response()->json([
            'success' => true,
            'message' => 'Booking status updated successfully',
            'data' => $booking
        ]);
    }

    // GET /api/bookings/{id}/available-instructors
    public function availableInstructors($id)
    {
        $booking = Booking::with(['program', 'schedules.instructor', 'schedule.instructor'])->find($id);
        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Booking not found'], 404);
        }

        $bookingDate = $booking->booking_date;

        // Get instructor IDs from the program's actual schedules AND the authorized instructor list (pivot table)
        $scheduleInstructorIds = ProgramSchedule::where('program_id', $booking->program_id)
            ->whereNotNull('instructor_id')
            ->pluck('instructor_id');
        
        $pivotInstructorIds = $booking->program->instructors()->pluck('instructors.id');
        
        $linkedInstructorIds = $scheduleInstructorIds->concat($pivotInstructorIds)
            ->unique()
            ->values();

        // We strictly only consider explicitly linked instructors for the program.
        // Fallback to all instructors has been removed as per the day-agnostic business requirement.

        // We'll collect all time slots to check
        $slotsToCheck = [];

        if ($booking->type === 'regular') {
            $schedules = $booking->schedules->isNotEmpty() ? $booking->schedules : collect([$booking->schedule]);
            foreach ($schedules->filter() as $s) {
                $slotsToCheck[] = [
                    'day' => $s->day_of_week,
                    'start' => $s->start_time instanceof \DateTimeInterface ? $s->start_time->format('H:i') : substr($s->start_time, 0, 5),
                    'end' => $s->end_time instanceof \DateTimeInterface ? $s->end_time->format('H:i') : substr($s->end_time, 0, 5),
                ];
            }
        } else {
            $slotsToCheck[] = [
                'day' => date('l', strtotime($bookingDate)),
                'start' => $booking->custom_start_time instanceof \DateTimeInterface ? $booking->custom_start_time->format('H:i') : substr($booking->custom_start_time, 0, 5),
                'end' => $booking->custom_end_time instanceof \DateTimeInterface ? $booking->custom_end_time->format('H:i') : substr($booking->custom_end_time, 0, 5),
            ];
        }

        if (empty($slotsToCheck)) {
            return response()->json(['success' => false, 'message' => 'Booking time information is missing'], 400);
        }

        // Get all candidate instructors
        $instructors = Instructor::whereIn('id', $linkedInstructorIds)
            ->select('id', 'name', 'title', 'image')
            ->get();

        foreach ($instructors as $instructor) {
            $isFullyAvailable = true;
            $freeSlots = [];
            $checkedDays = [];

            foreach ($slotsToCheck as $slot) {
                // Fetch and collect free slots (day-agnostic, query once per instructor)
                if (!in_array('any_day', $checkedDays)) {
                    $dayAvails = \App\Models\InstructorAvailability::where('instructor_id', $instructor->id)
                        ->where('is_available', true)
                        ->orderBy('start_time')
                        ->get(['start_time', 'end_time'])
                        ->unique(function ($item) {
                            return $item->start_time . $item->end_time;
                        });
                    
                    foreach ($dayAvails as $da) {
                        $freeSlots[] = [
                            'day' => 'Daily', // Send Daily to display generically in UI
                            'start' => substr($da->start_time, 0, 5),
                            'end'   => substr($da->end_time, 0, 5),
                        ];
                    }
                    $checkedDays[] = 'any_day'; // Record that we've grabbed generalized free slots
                }

                if ($isFullyAvailable) {
                    // 1. Availability check — use TIME() cast to safely compare HH:MM with HH:MM:SS stored values
                    // Day of week check is removed to be entirely day-agnostic
                    $isWorking = \App\Models\InstructorAvailability::where('instructor_id', $instructor->id)
                        ->where('is_available', true)
                        ->whereRaw('TIME(start_time) <= TIME(?)', [$slot['start']])
                        ->whereRaw('TIME(end_time) >= TIME(?)', [$slot['end']])
                        ->exists();

                    if (!$isWorking) {
                        $isFullyAvailable = false;
                    } else {
                        // 2. Conflict check (accepted bookings at the same time, ignoring day)
                        $hasConflict = Booking::where('instructor_id', $instructor->id)
                            ->where('status', 'accepted')
                            ->where('id', '!=', $booking->id)
                            ->where(function ($q) use ($slot) {
                                // Day-agnostic time overlap check
                                $q->where(function($sq) use ($slot) {
                                    $sq->whereNull('custom_start_time')
                                       ->whereHas('schedules', function($ssq) use ($slot) {
                                           $ssq->whereRaw('TIME(start_time) < TIME(?)', [$slot['end']])
                                               ->whereRaw('TIME(end_time) > TIME(?)', [$slot['start']]);
                                       });
                                })->orWhere(function($sq) use ($slot) {
                                    $sq->whereNotNull('custom_start_time')
                                       ->whereRaw('TIME(custom_start_time) < TIME(?)', [$slot['end']])
                                       ->whereRaw('TIME(custom_end_time) > TIME(?)', [$slot['start']]);
                                });
                            })
                            ->exists();

                        if ($hasConflict) {
                             $isFullyAvailable = false;
                        }
                    }
                }
            }
            
            $instructor->is_available = $isFullyAvailable;
            $instructor->free_slots = $freeSlots;
        }

        // Sort: is_available DESC, then by whether they have any free slots on that day DESC
        $sortedInstructors = $instructors->sortByDesc(function ($inst) {
            if ($inst->is_available) return 2;
            if (count($inst->free_slots) > 0) return 1;
            return 0;
        })->values();

        return response()->json([
            'success' => true,
            'data' => $sortedInstructors,
        ]);
    }

    // DELETE /api/bookings/{id}
    public function destroy($id)
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found'
            ], 404);
        }

        $booking->delete();

        return response()->json([
            'success' => true,
            'message' => 'Booking deleted successfully'
        ]);
    }
}