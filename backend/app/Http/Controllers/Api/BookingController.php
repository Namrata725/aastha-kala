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
        $bookings = Booking::with(['program', 'schedule', 'instructor'])->paginate(10);

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
            'instructor_id' => 'nullable|exists:instructors,id',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email',
            'message' => 'nullable|string',
            'class_mode' => 'required|in:online,physical',
            'type' => 'required|in:regular,customization',
            'custom_start_time' => 'required_if:type,customization|date_format:H:i',
            'custom_end_time' => 'required_if:type,customization|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $booking = Booking::create($request->all());

        $booking->load(['program', 'schedule', 'instructor']);

        return response()->json([
            'success' => true,
            'message' => 'Booking created successfully',
            'data' => $booking
        ], 201);
    }

    // GET /api/bookings/{id}
    public function show($id)
    {
        $booking = Booking::with(['program', 'schedule', 'instructor'])->find($id);

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
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'message' => 'nullable|string',
            'class_mode' => 'nullable|in:online,physical',
            'type' => 'nullable|in:regular,customization',
            'custom_start_time' => 'required_if:type,customization|date_format:H:i',
            'custom_end_time' => 'required_if:type,customization|date_format:H:i',
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

        $booking->load(['program', 'schedule', 'instructor']);

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
            'status' => 'required|in:pending,accepted,rejected'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $booking->status = $request->status;
        $booking->save();

        $booking->load(['program', 'schedule', 'instructor']);

        return response()->json([
            'success' => true,
            'message' => 'Booking status updated successfully',
            'data' => $booking
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