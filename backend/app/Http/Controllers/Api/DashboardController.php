<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Instructor;
use App\Models\Program;
use App\Models\Event;
use App\Models\Message;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_bookings' => Booking::count(),
            'pending_bookings' => Booking::where('status', 'pending')->count(),
            'approved_bookings' => Booking::where('status', 'approved')->count(),
            'cancelled_bookings' => Booking::where('status', 'cancelled')->count(),
            'total_events' => Event::count(),
            'total_messages' => Message::count(),
            'total_students' => \App\Models\Student::count(),
            'total_revenue' => \App\Models\StudentFee::sum('paid_amount'),
        ];

        $recent_bookings = Booking::with(['program', 'instructor'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recent_messages = Message::orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'stats' => $stats,
                'recent_bookings' => $recent_bookings,
                'recent_messages' => $recent_messages,
            ]
        ]);
    }
}
