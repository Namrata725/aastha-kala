<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InstructorAvailability;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class InstructorAvailabilityController extends Controller
{
    public function index($instructor_id)
    {
        $availabilities = InstructorAvailability::where('instructor_id', $instructor_id)->get();
        return response()->json([
            'success' => true,
            'data' => $availabilities
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'instructor_id' => 'required|exists:instructors,id',
            'day_of_week' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'is_available' => 'nullable|boolean'
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        // Since UI is now day-agnostic, we provide a default value to satisfy the database constraint
        if (!isset($data['day_of_week']) || empty($data['day_of_week'])) {
            $data['day_of_week'] = 'Monday';
        }

        $availability = InstructorAvailability::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Availability added successfully',
            'data' => $availability
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
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'is_available' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        // Since UI is day-agnostic, ensure we don't accidentally overwrite with null if not sent
        if (isset($data['day_of_week']) && empty($data['day_of_week'])) {
            $data['day_of_week'] = 'Monday';
        }

        $availability->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Availability updated successfully',
            'data' => $availability
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
