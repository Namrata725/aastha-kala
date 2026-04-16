<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentFee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StudentFeeController extends Controller
{
    public function index(Request $request)
    {
        // Select consolidated records grouped by student and month/period
        $query = StudentFee::with(['student'])
            ->selectRaw('
                MAX(id) as id, 
                student_id, 
                month_year, 
                SUM(total_amount) as total_amount, 
                SUM(paid_amount) as paid_amount, 
                SUM(pending_amount) as pending_amount,
                GROUP_CONCAT(DISTINCT fee_type) as fee_types,
                MAX(remarks) as remarks,
                MAX(payment_method) as payment_method,
                CASE WHEN SUM(pending_amount) <= 0 THEN "paid" ELSE "pending" END as status,
                MAX(created_at) as created_at
            ')
            ->groupBy('student_id', 'month_year')
            ->orderByDesc('created_at');

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->filled('status')) {
            // Because status is calculated, we filter by the SUM of pending_amount
            if ($request->status === 'paid') {
                $query->having('pending_amount', '<=', 0);
            } else {
                $query->having('pending_amount', '>', 0);
            }
        }

        if ($request->filled('fee_type')) {
            $query->where('fee_type', $request->fee_type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // For complex grouped queries with HAVING, paginate handles it better if we explicitly tell it to wrap
        $fees = $query->paginate(10);

        // Accurate summary stats for ALL records matching filters (ignoring pagination)
        $baseStatsQuery = StudentFee::query();
        if ($request->filled('student_id')) $baseStatsQuery->where('student_id', $request->student_id);
        if ($request->filled('fee_type')) $baseStatsQuery->where('fee_type', $request->fee_type);
        if ($request->filled('search')) {
            $search = $request->search;
            $baseStatsQuery->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Summary for dashboard
        $totals = [
            'total_collected' => (float) $baseStatsQuery->sum('paid_amount'),
            'total_pending' => (float) $baseStatsQuery->sum('pending_amount'),
            'paid_count' => (int) StudentFee::where('status', 'paid')->count(), 
            'pending_count' => (int) StudentFee::where('status', 'pending')->count(),
        ];

        return response()->json([
            'message' => 'Fees fetched successfully',
            'data' => $fees,
            'summary' => $totals
        ]);
    }

    /**
     * Check if a student has already paid admission fee and get their program fee info.
     * Admission fee is now a global one-time fee stored in Settings.
     */
    public function studentFeeInfo(Request $request, $studentId)
    {
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        $requestedMonth = $request->query('month_year');

        // Fetch all payment records for this student in this month to get individual program statuses
        $monthRecords = collect();
        if ($requestedMonth) {
            $monthRecords = StudentFee::where('student_id', $studentId)
                ->where('month_year', $requestedMonth)
                ->get();
        }

        // Get global admission fee from settings
        $setting = \App\Models\Setting::first();
        $globalAdmissionFee = $setting ? (float) $setting->admission_fee : null;

        // Find admission record - prioritize the requested month if available, otherwise find any
        $admissionRecord = null;
        if ($requestedMonth) {
            $admissionRecord = StudentFee::where('student_id', $studentId)
                ->where('month_year', $requestedMonth)
                ->where(function ($q) {
                    $q->where('fee_type', 'admission')
                        ->orWhere('fee_type', 'billing');
                })
                ->first();
        }

        if (!$admissionRecord) {
            $admissionRecord = StudentFee::where('student_id', $studentId)
                ->where(function ($q) {
                    $q->where('fee_type', 'admission')
                        ->orWhere('fee_type', 'billing');
                })
                ->orderByRaw("CASE WHEN status = 'paid' THEN 0 ELSE 1 END") // Prioritize paid status
                ->orderByDesc('id') // Then most recent
                ->first();
        }

        // Calculate global admission totals to handle existing historical duplicates
        $globalAdmTotals = StudentFee::where('student_id', $studentId)
            ->where(function ($q) {
                $q->where('fee_type', 'admission')
                    ->orWhere('fee_type', 'billing');
            })
            ->selectRaw('SUM(paid_amount) as total_paid, SUM(total_amount) as net_amount')
            ->first();

        $admissionPaid = $globalAdmTotals && $globalAdmTotals->net_amount > 0 && ($globalAdmTotals->total_paid >= $globalAdmTotals->net_amount);
        $admissionAmount = $admissionRecord ? ($admissionRecord->admission_fee ?? $admissionRecord->total_amount) : $globalAdmissionFee;
        $admissionExists = $admissionRecord ? true : false;
        $admissionPaidAmount = $globalAdmTotals ? (float)$globalAdmTotals->total_paid : 0;

        // Force paid status if cumulative total matches net
        if ($admissionPaid) {
            $admissionPaid = true;
        }

        // Try to get program fees from proper relations first
        $programFees = null;
        $matchingPrograms = collect();
        $classTitles = [];
        $unmatched = [];

        $enrollments = \App\Models\StudentProgram::with('program')
            ->where('student_id', $studentId)
            ->where('status', 'active')
            ->get();

        if ($enrollments->isNotEmpty()) {
            $matchingPrograms = $enrollments->pluck('program')->filter();
            $classTitles = $matchingPrograms->pluck('title')->toArray();
        } else if ($student->classes) {
            // Fallback to legacy comma-separated field
            $classTitles = array_map('trim', array_filter(explode(',', $student->classes)));

            if (!empty($classTitles)) {
                $matchingPrograms = \App\Models\Program::where('is_active', true)
                    ->where(function ($q) use ($classTitles) {
                        foreach ($classTitles as $title) {
                            $q->orWhereRaw('LOWER(title) = ?', [strtolower($title)]);
                        }
                    })
                    ->get();

                if ($matchingPrograms->isEmpty()) {
                    $matchingPrograms = \App\Models\Program::where('is_active', true)
                        ->where(function ($q) use ($classTitles) {
                            foreach ($classTitles as $title) {
                                $q->orWhere('title', 'LIKE', "%{$title}%");
                            }
                        })
                        ->get();
                }
            }
        }

        if ($matchingPrograms->isNotEmpty() || !empty($classTitles)) {
            $breakdown = [];
            $totalFee = 0;
            $totalAdm = 0;
            $matchedTitles = [];

            foreach ($matchingPrograms as $p) {
                $fee = (float) ($p->program_fee ?? 0);
                $adm = (float) ($p->admission_fee ?? 0);

                // Find existing payment for THIS specific program in THIS month
                $existing = $monthRecords->where('program_id', $p->id)->first();

                $totalFee += $fee;
                $totalAdm += $adm;
                $matchedTitles[] = strtolower($p->title);
                $breakdown[] = [
                    'id' => $p->id,
                    'title' => $p->title,
                    'program_fee' => $fee,
                    'admission_fee' => $adm,
                    'paid_amount' => $existing ? (float) $existing->paid_amount : 0,
                    'discount' => $existing ? (float) $existing->program_discount : 0,
                    'discount_type' => $existing ? $existing->program_discount_type : 'cash',
                    'status' => $existing ? $existing->status : 'pending',
                ];
            }

            if ($enrollments->isEmpty() && !empty($classTitles)) {
                foreach ($classTitles as $originalTitle) {
                    if (!in_array(strtolower($originalTitle), $matchedTitles)) {
                        $unmatched[] = $originalTitle;
                    }
                }
            }

            $programFees = [
                'program_titles' => $matchingPrograms->pluck('title')->toArray(),
                'programs_breakdown' => $breakdown,
                'enrolled_count' => count($classTitles),
                'matched_count' => $matchingPrograms->count(),
                'unmatched_titles' => $unmatched,
                'admission_fee' => $totalAdm > 0 ? $totalAdm : $globalAdmissionFee,
                'program_fee' => $totalFee,
            ];
        }

        return response()->json([
            'message' => 'Student fee info fetched',
            'data' => [
                'student' => [
                    'id' => $studentId,
                    'name' => $student->name,
                    'classes' => $student->classes,
                ],
                'admission_paid' => $admissionPaid,
                'admission_exists' => $admissionExists,
                'admission_amount' => $admissionAmount,
                'admission_paid_amount' => $admissionPaidAmount,
                'admission_discount' => $admissionRecord ? $admissionRecord->admission_discount : 0,
                'admission_discount_type' => $admissionRecord ? $admissionRecord->admission_discount_type : 'cash',
                'global_admission_fee' => $globalAdmissionFee,
                'program_fees' => $programFees,
                'period_record' => $monthRecords->first(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:students,id',
            'fee_type' => 'required|in:admission,program,billing',
            'month_year' => 'required|string',
            'payment_method' => 'nullable|string',
            'remarks' => 'nullable|string',
            'selected_programs' => 'nullable|array',
            'program_payments' => 'nullable|array',
            'program_discounts' => 'nullable|array',
            'admission_fee' => 'nullable|numeric|min:0',
            'admission_discount' => 'nullable|numeric|min:0',
            'admission_discount_type' => 'nullable|in:cash,percentage',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $studentId = $request->student_id;
        $monthYear = $request->month_year;

        // Common data for all records in this billing session
        $baseData = [
            'student_id' => $studentId,
            'month_year' => $monthYear,
            'payment_method' => $request->payment_method ?? 'Cash',
            'remarks' => $request->remarks,
        ];

        // 1. Handle Admission Fee Record
        if ($request->fee_type === 'admission' || $request->fee_type === 'billing') {
            // Force pull admission fee from settings to prevent tampering
            $setting = \App\Models\Setting::first();
            $admBase = $setting ? (float) $setting->admission_fee : (float) $request->input('admission_fee', 0);

            if ($admBase > 0) {
                $admDisc = (float) $request->input('admission_discount', 0);
                $admDiscType = $request->input('admission_discount_type', 'cash');

                // Calculate Net
                $admNet = $admBase;
                if ($admDisc > 0) {
                    $admNet = ($admDiscType === 'percentage')
                        ? max(0, $admBase - ($admBase * $admDisc / 100))
                        : max(0, $admBase - $admDisc);
                }

                $admPaid = (float) $request->input('admission_paid_amount', $admNet); // Default to full pay if not specified

                StudentFee::updateOrCreate(
                    ['student_id' => $studentId, 'fee_type' => 'admission'],
                    array_merge($baseData, [
                        'total_amount' => $admNet,
                        'paid_amount' => $admPaid,
                        'pending_amount' => max(0, $admNet - $admPaid),
                        'status' => ($admNet - $admPaid) <= 0 ? 'paid' : 'pending',
                        'admission_fee' => $admBase,
                        'admission_discount' => $admDisc,
                        'admission_discount_type' => $admDiscType,
                        'admission_paid' => ($admNet - $admPaid) <= 0,
                    ])
                );
            }
        }

        // 2. Handle Program-wise Records
        if ($request->fee_type === 'program' || $request->fee_type === 'billing') {
            $selectedIds = $request->selected_programs ?? [];
            $programPayments = $request->program_payments ?? [];
            $programDiscounts = $request->program_discounts ?? [];

            foreach ($selectedIds as $progId) {
                $prog = \App\Models\Program::find($progId);
                if (!$prog)
                    continue;

                $progBase = (float) $prog->program_fee;
                $discInfo = $programDiscounts[$progId] ?? ['amount' => 0, 'type' => 'cash'];
                $progDisc = (float) $discInfo['amount'];
                $progDiscType = $discInfo['type'];

                // Calculate Net
                $progNet = $progBase;
                if ($progDisc > 0) {
                    $progNet = ($progDiscType === 'percentage')
                        ? max(0, $progBase - ($progBase * $progDisc / 100))
                        : max(0, $progBase - $progDisc);
                }

                $progPaid = isset($programPayments[$progId]) ? (float) $programPayments[$progId] : 0;

                StudentFee::updateOrCreate(
                    ['student_id' => $studentId, 'month_year' => $monthYear, 'fee_type' => 'program', 'program_id' => $progId],
                    array_merge($baseData, [
                        'total_amount' => $progNet,
                        'paid_amount' => $progPaid,
                        'pending_amount' => max(0, $progNet - $progPaid),
                        'status' => ($progNet - $progPaid) <= 0 ? 'paid' : 'pending',
                        'program_fee' => $progBase,
                        'program_discount' => $progDisc,
                        'program_discount_type' => $progDiscType,
                    ])
                );
            }
        }

        return response()->json(['message' => 'Fees processed successfully'], 201);
    }

    public function update(Request $request, $id)
    {
        // For consolidated updates, we find the representative record, then update its entire group
        $reproFee = StudentFee::findOrFail($id);

        // We redirect to the store logic but ensuring we use the same student and month
        $request->merge([
            'student_id' => $reproFee->student_id,
            'month_year' => $reproFee->month_year,
        ]);

        return $this->store($request);
    }

    public function destroy($id)
    {
        $fee = StudentFee::findOrFail($id);

        // Delete the entire billing group for this month/period
        StudentFee::where('student_id', $fee->student_id)
            ->where('month_year', $fee->month_year)
            ->delete();

        return response()->json([
            'message' => 'Consolidated billing record deleted successfully'
        ]);
    }
}
