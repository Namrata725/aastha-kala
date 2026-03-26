<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\Instructor;
use App\Models\InstructorAvailability;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ProgramController extends Controller
{
    // GET /api/programs
    public function index()
    {
        $programs = Program::with(['schedules', 'instructors'])->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $programs
        ]);
    }

    // GET /api/programs/latest
    public function latest()
    {
        $programs = Program::where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $programs
        ]);
    }

    // POST /api/programs
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'speciality' => 'nullable|array',
            'speciality.*' => 'string|max:255',
            'is_active' => 'nullable|boolean',
            'instructor_ids' => 'nullable|array',
            'instructor_ids.*' => 'exists:instructors,id',
            'schedules' => 'nullable|array',
            'schedules.*.instructor_id' => 'nullable|exists:instructors,id',
            'schedules.*.day_of_week' => 'required_with:schedules|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'schedules.*.start_time' => 'required_with:schedules|date_format:H:i',
            'schedules.*.end_time' => 'required_with:schedules|date_format:H:i',
            'schedules.*.max_capacity' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only(['title', 'description', 'speciality', 'is_active']);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('programs', 'public');
            $data['image'] = asset('storage/' . $path);
        }

        $program = Program::create($data);

        // Attach instructors if any
        if ($request->has('instructor_ids')) {
            $program->instructors()->sync($request->instructor_ids);
        }

        // Create schedules if provided
        if ($request->has('schedules')) {
            foreach ($request->schedules as $schedule) {
                $program->schedules()->create([
                    'instructor_id' => $schedule['instructor_id'] ?? null,
                    'day_of_week' => $schedule['day_of_week'],
                    'start_time' => $schedule['start_time'],
                    'end_time' => $schedule['end_time'],
                    'max_capacity' => $schedule['max_capacity'] ?? null,
                ]);
            }
        }

        $program->load(['schedules', 'instructors']);

        return response()->json([
            'success' => true,
            'message' => 'Program created successfully',
            'data' => $program
        ], 201);
    }

    // GET /api/programs/{id}
    public function show($id)
    {
        $program = Program::with(['schedules', 'instructors'])->find($id);

        if (!$program) {
            return response()->json([
                'success' => false,
                'message' => 'Program not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $program
        ]);
    }

    // PUT/PATCH /api/programs/{id}
    public function update(Request $request, $id)
    {
        $program = Program::find($id);

        if (!$program) {
            return response()->json([
                'success' => false,
                'message' => 'Program not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'remove_image' => 'nullable|in:1',
            'speciality' => 'nullable|array',
            'speciality.*' => 'string|max:255',
            'is_active' => 'nullable|boolean',
            'instructor_ids' => 'nullable|array',
            'instructor_ids.*' => 'exists:instructors,id',
            'schedules' => 'nullable|array',
            'schedules.*.instructor_id' => 'nullable|exists:instructors,id',
            'schedules.*.day_of_week' => 'required_with:schedules|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'schedules.*.start_time' => 'required_with:schedules|date_format:H:i',
            'schedules.*.end_time' => 'required_with:schedules|date_format:H:i',
            'schedules.*.max_capacity' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only(['title', 'description', 'speciality', 'is_active']);

        // Handle image removal
        if ($request->has('remove_image') && $request->remove_image == '1' && $program->image) {
            $oldPath = str_replace(asset('storage/'), '', $program->image);
            Storage::disk('public')->delete($oldPath);
            $data['image'] = null;
        }

        // Handle image replacement
        if ($request->hasFile('image')) {
            if ($program->image) {
                $oldPath = str_replace(asset('storage/'), '', $program->image);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('programs', 'public');
            $data['image'] = asset('storage/' . $path);
        }

        $program->update($data);

        // Sync instructors
        if ($request->has('instructor_ids')) {
            $program->instructors()->sync($request->instructor_ids);
        }

        // Update schedules (simple way: delete all and re-create)
        if ($request->has('schedules')) {
            $program->schedules()->delete();
            foreach ($request->schedules as $schedule) {
                $program->schedules()->create([
                    'instructor_id' => $schedule['instructor_id'] ?? null,
                    'day_of_week' => $schedule['day_of_week'],
                    'start_time' => $schedule['start_time'],
                    'end_time' => $schedule['end_time'],
                    'max_capacity' => $schedule['max_capacity'] ?? null,
                ]);
            }
        }

        $program->load(['schedules', 'instructors']);

        return response()->json([
            'success' => true,
            'message' => 'Program updated successfully',
            'data' => $program
        ]);
    }

    // DELETE /api/programs/{id}
    public function destroy($id)
    {
        $program = Program::find($id);

        if (!$program) {
            return response()->json([
                'success' => false,
                'message' => 'Program not found'
            ], 404);
        }

        // Delete image
        if ($program->image) {
            $oldPath = str_replace(asset('storage/'), '', $program->image);
            Storage::disk('public')->delete($oldPath);
        }

        $program->delete();

        return response()->json([
            'success' => true,
            'message' => 'Program deleted successfully'
        ]);
    }

    // GET /api/programs/{id}/available-instructors?day_of_week=Monday&start_time=09:00&end_time=10:00&booking_date=2026-03-26
    public function availableInstructors(Request $request, $id)
    {
        $program = Program::find($id);
        if (!$program) {
            return response()->json(['success' => false, 'message' => 'Program not found'], 404);
        }

        $dayOfWeek = $request->day_of_week; // e.g. "Monday"
        $startTime = $request->start_time; // e.g. "09:00"
        $endTime = $request->end_time; // e.g. "10:00"
        $bookingDate = $request->booking_date; // e.g. "2026-03-26" (for conflict check)

        // Step 1: get instructor IDs linked to this program
        $linkedInstructorIds = $program->instructors()->pluck('instructors.id');

        if ($linkedInstructorIds->isEmpty()) {
            return response()->json(['success' => true, 'data' => [], 'message' => 'No instructors assigned to this program']);
        }

        // Step 2: filter to those whose availability covers the requested day+time
        $availableInstructorIds = InstructorAvailability::whereIn('instructor_id', $linkedInstructorIds)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->where('start_time', '<=', $startTime)
            ->where('end_time', '>=', $endTime)
            ->pluck('instructor_id');

        // Step 3: exclude any instructor who already has an accepted booking on this date at an overlapping time
        if ($bookingDate && $availableInstructorIds->isNotEmpty()) {
            $conflictedIds = Booking::whereIn('instructor_id', $availableInstructorIds)
                ->where('booking_date', $bookingDate)
                ->where('status', 'accepted')
                ->where(function ($q) use ($startTime, $endTime) {
                $q->whereRaw('custom_start_time < ?', [$endTime])
                    ->whereRaw('custom_end_time > ?', [$startTime]);
            })
                ->pluck('instructor_id');

            $availableInstructorIds = $availableInstructorIds->diff($conflictedIds)->values();
        }

        $instructors = Instructor::whereIn('id', $availableInstructorIds)
            ->select('id', 'name', 'title', 'image')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $instructors,
        ]);
    }
}