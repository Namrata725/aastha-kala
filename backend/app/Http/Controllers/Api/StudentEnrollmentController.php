<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\StudentProgram;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentEnrollmentController extends Controller
{
    /**
     * Display a paginated listing of student enrollments.
     */
    public function index(Request $request)
    {
        $query = StudentProgram::with([
            'student',
            'program',
            'booking.instructor',
            'booking.schedules'
        ])->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('student', function($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('program', function($pq) use ($search) {
                      $pq->where('title', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $enrollments = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $enrollments
        ]);
    }

    /**
     * Update the status of a specific enrollment.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:active,inactive,graduated'
        ]);

        try {
            DB::beginTransaction();

            $enrollment = StudentProgram::findOrFail($id);
            $enrollment->status = $request->status;
            $enrollment->save();

            // Sync with Shadow Booking to manage instructor availability
            if ($enrollment->booking_id) {
                $booking = Booking::find($enrollment->booking_id);
                if ($booking) {
                    // Map enrollment status to booking status
                    // active -> accepted (blocks time)
                    // inactive/graduated -> completed (frees time)
                    $booking->status = ($request->status === 'active' ? 'accepted' : 'completed');
                    $booking->save();
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Status updated and instructor availability synced',
                'data' => $enrollment->load(['student', 'booking.instructor'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status: ' . $e->getMessage()
            ], 500);
        }
    }
}
