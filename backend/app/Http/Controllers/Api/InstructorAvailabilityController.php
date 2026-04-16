<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InstructorAvailability;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class InstructorAvailabilityController extends Controller
{
    /**
     * Convert "HH:MM" or "HH:MM:SS" to integer minutes since midnight.
     */
    private function toMinutes(string $time): int
    {
        $parts = explode(':', $time);
        return (int)$parts[0] * 60 + (int)$parts[1];
    }

    /**
     * Convert integer minutes since midnight to "HH:MM" string.
     */
    private function fromMinutes(int $minutes): string
    {
        return sprintf('%02d:%02d', intdiv($minutes, 60), $minutes % 60);
    }

    /**
     * Subtract a booked interval [bookedStart, bookedEnd] from a list of free segments.
     * All values are in integer minutes since midnight.
     * Returns the remaining free segments after the subtraction.
     */
    private function subtractInterval(array $segments, int $bookedStart, int $bookedEnd): array
    {
        $result = [];
        foreach ($segments as [$segStart, $segEnd]) {
            // No overlap — keep segment as-is
            if ($bookedEnd <= $segStart || $bookedStart >= $segEnd) {
                $result[] = [$segStart, $segEnd];
                continue;
            }
            // Left remainder: segment starts before booking
            if ($segStart < $bookedStart) {
                $result[] = [$segStart, $bookedStart];
            }
            // Right remainder: segment ends after booking
            if ($bookedEnd < $segEnd) {
                $result[] = [$bookedEnd, $segEnd];
            }
        }
        return $result;
    }

    /**
     * Compute the remaining free segments for an instructor given their raw availability
     * ranges and all accepted bookings. Returns array of ['start' => 'HH:MM', 'end' => 'HH:MM'].
     */
    public function computeFreeSegments(int $instructorId): array
    {
        // 1. Raw availability ranges
        $availabilities = InstructorAvailability::where('instructor_id', $instructorId)
            ->where('is_available', true)
            ->orderBy('start_time')
            ->get(['id', 'start_time', 'end_time']);

        // 2. All accepted bookings for this instructor (both custom and regular)
        $acceptedBookings = Booking::where('instructor_id', $instructorId)
            ->where('status', 'accepted')
            ->with(['schedules', 'schedule'])
            ->get();

        // Build list of booked intervals in minutes
        $bookedIntervals = [];
        foreach ($acceptedBookings as $booking) {
            if ($booking->type === 'customization' && $booking->custom_start_time && $booking->custom_end_time) {
                $bs = $this->toMinutes(substr($booking->custom_start_time, 0, 5));
                $be = $this->toMinutes(substr($booking->custom_end_time, 0, 5));
                $bookedIntervals[] = [$bs, $be];
            } elseif ($booking->type === 'regular') {
                $schedules = $booking->schedules && $booking->schedules->isNotEmpty()
                    ? $booking->schedules
                    : collect([$booking->schedule])->filter();
                foreach ($schedules as $s) {
                    $bs = $this->toMinutes(substr($s->start_time, 0, 5));
                    $be = $this->toMinutes(substr($s->end_time, 0, 5));
                    $bookedIntervals[] = [$bs, $be];
                }
            }
        }

        // Sort booked intervals by start time
        usort($bookedIntervals, fn($a, $b) => $a[0] <=> $b[0]);

        $freeSegments = [];

        // 3. For each availability range, subtract all booked intervals
        foreach ($availabilities as $avail) {
            $availStart = $this->toMinutes(substr($avail->start_time, 0, 5));
            $availEnd   = $this->toMinutes(substr($avail->end_time, 0, 5));

            $segments = [[$availStart, $availEnd]];

            foreach ($bookedIntervals as [$bs, $be]) {
                $segments = $this->subtractInterval($segments, $bs, $be);
                if (empty($segments)) break;
            }

            foreach ($segments as [$segStart, $segEnd]) {
                // Only include segments >= 5 minutes (avoid tiny slivers)
                if ($segEnd - $segStart >= 5) {
                    $freeSegments[] = [
                        'availability_id' => $avail->id,
                        'start'           => $this->fromMinutes($segStart),
                        'end'             => $this->fromMinutes($segEnd),
                        'duration_mins'   => $segEnd - $segStart,
                    ];
                }
            }
        }

        // Sort free segments by start time
        usort($freeSegments, fn($a, $b) => $a['start'] <=> $b['start']);

        return $freeSegments;
    }

    public function index($instructor_id)
    {
        $availabilities = InstructorAvailability::where('instructor_id', $instructor_id)->get();
        return response()->json([
            'success' => true,
            'data'    => $availabilities
        ]);
    }

    /**
     * GET /instructor-availabilities/instructor/{id}/free-slots
     * Returns dynamically computed remaining free time segments for an instructor.
     */
    public function freeSlots($instructor_id)
    {
        $freeSegments = $this->computeFreeSegments((int)$instructor_id);

        // Also return raw availabilities for reference
        $rawAvailabilities = InstructorAvailability::where('instructor_id', $instructor_id)
            ->where('is_available', true)
            ->orderBy('start_time')
            ->get(['id', 'start_time', 'end_time'])
            ->map(fn($a) => [
                'id'    => $a->id,
                'start' => substr($a->start_time, 0, 5),
                'end'   => substr($a->end_time, 0, 5),
            ]);

        return response()->json([
            'success'           => true,
            'free_segments'     => $freeSegments,
            'raw_availabilities' => $rawAvailabilities,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'instructor_id' => 'required|exists:instructors,id',
            'day_of_week'   => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time'    => 'required|date_format:H:i',
            'end_time'      => 'required|date_format:H:i|after:start_time',
            'is_available'  => 'nullable|boolean'
        ], [], [
            'start_time' => 'start time',
            'end_time'   => 'end time',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors'  => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        if (!isset($data['day_of_week']) || empty($data['day_of_week'])) {
            $data['day_of_week'] = 'Monday';
        }

        $availability = InstructorAvailability::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Availability added successfully',
            'data'    => $availability
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $availability = InstructorAvailability::find($id);

        if (!$availability) {
            return response()->json([
                'success' => false,
                'message' => 'Availability not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'day_of_week' => 'nullable|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time'  => 'nullable|date_format:H:i',
            'end_time'    => 'nullable|date_format:H:i|after:start_time',
            'is_available'=> 'nullable|boolean'
        ], [], [
            'start_time' => 'start time',
            'end_time'   => 'end time',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors'  => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        if (isset($data['day_of_week']) && empty($data['day_of_week'])) {
            $data['day_of_week'] = 'Monday';
        }

        $availability->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Availability updated successfully',
            'data'    => $availability
        ]);
    }

    public function destroy($id)
    {
        $availability = InstructorAvailability::find($id);

        if (!$availability) {
            return response()->json([
                'success' => false,
                'message' => 'Availability not found'
            ], 404);
        }

        $availability->delete();

        return response()->json([
            'success' => true,
            'message' => 'Availability deleted successfully'
        ]);
    }
}
