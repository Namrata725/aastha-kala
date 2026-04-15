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
        $query = StudentFee::with(['student', 'program'])->latest();

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
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

        $fees = $query->paginate(15);

        return response()->json([
            'message' => 'Fees fetched successfully',
            'data' => $fees
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

        // Get global admission fee from settings
        $setting = \App\Models\Setting::first();
        $globalAdmissionFee = $setting ? (float) $setting->admission_fee : null;

        $admissionRecord = StudentFee::where('student_id', $studentId)
            ->where(function($q) {
                $q->where('fee_type', 'admission')
                  ->orWhere('fee_type', 'billing');
            })
            ->first();

        $admissionPaid = $admissionRecord ? ($admissionRecord->status === 'paid') : false;
        $admissionAmount = $admissionRecord ? $admissionRecord->total_amount : null;
        $admissionExists = $admissionRecord ? true : false;

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
                    ->where(function($q) use ($classTitles) {
                        foreach ($classTitles as $title) {
                            $q->orWhereRaw('LOWER(title) = ?', [strtolower($title)]);
                        }
                    })
                    ->get();
                
                if ($matchingPrograms->isEmpty()) {
                    $matchingPrograms = \App\Models\Program::where('is_active', true)
                        ->where(function($q) use ($classTitles) {
                            foreach ($classTitles as $title) {
                                $q->orWhere('title', 'LIKE', "%{$title}%");
                            }
                        })
                        ->get();
                }
            }
        }

        if ($matchingPrograms->isNotEmpty() || !empty($classTitles)) {
            $totalFee = 0;
            $totalAdm = 0;
            $breakdown = [];
            $matchedTitles = [];
            
            foreach ($matchingPrograms as $p) {
                // If it's the new relation flow, we can use the actual fee. If legacy flow, it works the same.
                $fee = (float) ($p->program_fee ?? 0);
                $adm = (float) ($p->admission_fee ?? 0);
                $totalFee += $fee;
                $totalAdm += $adm;
                $matchedTitles[] = strtolower($p->title);
                $breakdown[] = [
                    'id'          => $p->id,
                    'title'       => $p->title,
                    'program_fee' => $fee,
                    'admission_fee' => $adm,
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
                'program_titles'     => $matchingPrograms->pluck('title')->toArray(),
                'programs_breakdown' => $breakdown,
                'enrolled_count'     => count($classTitles),
                'matched_count'      => $matchingPrograms->count(),
                'unmatched_titles'   => $unmatched,
                'admission_fee'      => $totalAdm > 0 ? $totalAdm : $globalAdmissionFee,
                'program_fee'        => $totalFee,
            ];
        }

        $requestedMonth = $request->query('month_year');
        $periodRecord = null;
        if ($requestedMonth) {
            $periodRecord = StudentFee::where('student_id', $studentId)
                ->where('month_year', $requestedMonth)
                ->where('fee_type', '!=', 'admission')
                ->first();
        }

        return response()->json([
            'message' => 'Student fee info fetched',
            'data'    => [
                'student' => [
                    'id'      => $studentId,
                    'name'    => $student->name,
                    'classes' => $student->classes,
                ],
                'admission_paid'       => $admissionPaid,
                'admission_exists'     => $admissionExists,
                'admission_amount'     => $admissionAmount,
                'global_admission_fee' => $globalAdmissionFee,
                'program_fees'         => $programFees,
                'period_record'        => $periodRecord,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id'              => 'required|exists:students,id',
            'fee_type'                => 'required|in:admission,program,billing',
            'month_year'              => 'nullable|string|required_if:fee_type,program|required_if:fee_type,billing',
            'total_amount'            => 'required|numeric|min:0',
            'paid_amount'             => 'required|numeric|min:0',
            'payment_method'          => 'nullable|string',
            'remarks'                 => 'nullable|string',
            'admission_fee'           => 'nullable|numeric|min:0',
            'admission_discount'      => 'nullable|numeric|min:0',
            'admission_discount_type' => 'nullable|in:cash,percentage',
            'admission_paid'          => 'nullable|boolean',
            'program_fee'             => 'nullable|numeric|min:0',
            'program_discount'        => 'nullable|numeric|min:0',
            'program_discount_type'   => 'nullable|in:cash,percentage',
            'selected_programs'       => 'nullable|array',
            'selected_programs.*'     => 'exists:programs,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $selectedPrograms = $request->input('selected_programs', []);
        
        // Single record logic (Admission only or no programs selected)
        if (empty($selectedPrograms) || $data['fee_type'] === 'admission') {
            $data['pending_amount'] = max(0, $data['total_amount'] - $data['paid_amount']);
            $data['status'] = $data['pending_amount'] <= 0 ? 'paid' : 'pending';
            $fee = StudentFee::create($data);
            return response()->json([
                'message' => 'Fee recorded successfully',
                'data' => $fee
            ], 201);
        }

        // Program-wise creation logic
        $totalPaidRemaining = (float) $data['paid_amount'];
        
        // Find programs to get their individual fees
        $programs = \App\Models\Program::whereIn('id', $selectedPrograms)->get();
        // Admission fee is processed first if billing includes admission
        if ($data['fee_type'] === 'billing' && isset($data['admission_fee'])) {
            $admFee = (float) $data['admission_fee'];
            $admDisc = (float) ($data['admission_discount'] ?? 0);
            if (($data['admission_discount_type'] ?? 'cash') === 'percentage') {
                $admDisc = $admFee * ($admDisc / 100);
            }
            $admNet = max(0, $admFee - $admDisc);
            $admPaid = min($admNet, $totalPaidRemaining);
            $totalPaidRemaining -= $admPaid;

            StudentFee::create(array_merge($data, [
                'fee_type' => 'admission',
                'total_amount' => $admNet,
                'paid_amount' => $admPaid,
                'pending_amount' => max(0, $admNet - $admPaid),
                'status' => ($admNet - $admPaid) <= 0 ? 'paid' : 'pending',
                'program_id' => null
            ]));
        }

        // Now distribute precisely what was paid for each program based on frontend inputs
        $programPayments = $request->input('program_payments', []);
        $programDiscountsInput = $request->input('program_discounts', []);

        foreach ($programs as $prog) {
            $progFee = (float) $prog->program_fee;
            $progNet = $progFee; 

            // Check if individual discount is provided
            if (isset($programDiscountsInput[$prog->id])) {
                $discAmt = (float) ($programDiscountsInput[$prog->id]['amount'] ?? 0);
                $discType = $programDiscountsInput[$prog->id]['type'] ?? 'cash';
                if ($discType === 'percentage') {
                    $progNet = max(0, $progFee - ($progFee * ($discAmt / 100)));
                } else {
                    $progNet = max(0, $progFee - $discAmt);
                }
            } 
            // Fallback to global proportional discount (legacy/simplified support)
            else if (isset($data['program_discount']) && $data['program_discount'] > 0) {
               $totalBase = $programs->sum('program_fee');
               if ($totalBase > 0) {
                   $ratio = $progFee / $totalBase;
                   $allocatedDisc = (float)$data['program_discount'];
                   if (($data['program_discount_type'] ?? 'cash') === 'percentage') {
                       $allocatedDisc = $totalBase * ($allocatedDisc / 100);
                   }
                   $progNet = max(0, $progFee - ($allocatedDisc * $ratio));
               }
            }

            // EXACT tracking of what user entered in the individual Box:
            $progPaid = isset($programPayments[$prog->id]) ? (float) $programPayments[$prog->id] : 0;

            StudentFee::create(array_merge($data, [
                'fee_type' => 'program',
                'program_id' => $prog->id,
                'total_amount' => $progNet,
                'paid_amount' => $progPaid,
                'pending_amount' => max(0, $progNet - $progPaid),
                'status' => ($progNet - $progPaid) <= 0 ? 'paid' : 'pending',
                // Store individual discount info if needed (assuming model supports it or just use remarks)
                'program_discount' => isset($programDiscountsInput[$prog->id]) ? $programDiscountsInput[$prog->id]['amount'] : null,
                'program_discount_type' => isset($programDiscountsInput[$prog->id]) ? $programDiscountsInput[$prog->id]['type'] : null,
            ]));
        }

        return response()->json([
            'message' => 'Program-wise fees recorded successfully',
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $fee = StudentFee::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'paid_amount'             => 'sometimes|required|numeric|min:0',
            'total_amount'            => 'sometimes|required|numeric|min:0',
            'payment_method'          => 'nullable|string',
            'remarks'                 => 'nullable|string',
            'month_year'              => 'nullable|string',
            'admission_discount'      => 'nullable|numeric|min:0',
            'admission_discount_type' => 'nullable|in:cash,percentage',
            'program_discount'        => 'nullable|numeric|min:0',
            'program_discount_type'   => 'nullable|in:cash,percentage',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $total = $request->input('total_amount', $fee->total_amount);
        $paid  = $request->input('paid_amount', $fee->paid_amount);

        $updateData = array_filter([
            'total_amount'            => $total,
            'paid_amount'             => $paid,
            'pending_amount'          => max(0, $total - $paid),
            'status'                  => ($total - $paid) <= 0 ? 'paid' : 'pending',
            'payment_method'          => $request->input('payment_method'),
            'remarks'                 => $request->input('remarks'),
            'month_year'              => $request->input('month_year'),
            'admission_discount'      => $request->input('admission_discount'),
            'admission_discount_type' => $request->input('admission_discount_type'),
            'program_discount'        => $request->input('program_discount'),
            'program_discount_type'   => $request->input('program_discount_type'),
        ], fn($val) => !is_null($val));

        $fee->update($updateData);

        return response()->json([
            'message' => 'Fee updated successfully',
            'data' => $fee
        ]);
    }

    public function destroy($id)
    {
        $fee = StudentFee::findOrFail($id);
        $fee->delete();

        return response()->json([
            'message' => 'Fee record deleted successfully'
        ]);
    }
}
