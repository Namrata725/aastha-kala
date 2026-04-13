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
        $query = StudentFee::with('student')->latest();

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
     */
    public function studentFeeInfo(Request $request, $studentId)
    {
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        $admissionRecord = StudentFee::where('student_id', $studentId)
            ->where(function($q) {
                $q->where('fee_type', 'admission')
                  ->orWhere('fee_type', 'billing');
            })
            ->first();

        $admissionPaid = $admissionRecord ? ($admissionRecord->status === 'paid') : false;
        $admissionAmount = $admissionRecord ? $admissionRecord->total_amount : null;
        $admissionExists = $admissionRecord ? true : false;

        // Try to get program fees from student's classes field (comma separated titles)
        $programFees = null;
        if ($student->classes) {
            // Normalize class titles by splitting, trimming and removing empties
            $classTitles = array_values(array_filter(array_map('trim', explode(',', $student->classes))));
            
            if (!empty($classTitles)) {
                // Fetch programs matching these titles (case insensitive)
                $matchingPrograms = \App\Models\Program::where(function($query) use ($classTitles) {
                    foreach ($classTitles as $title) {
                        $query->orWhere('title', '=', trim($title));
                    }
                })->get();
                
                if ($matchingPrograms->count() > 0) {
                    $programFees = [
                        'program_titles' => $matchingPrograms->pluck('title')->toArray(),
                        'programs_breakdown' => $matchingPrograms->map(function ($p) {
                            return [
                                'title' => $p->title,
                                'admission_fee' => (float) $p->admission_fee,
                                'program_fee' => (float) $p->program_fee,
                            ];
                        })->toArray(),
                        'enrolled_count' => count($classTitles),
                        'matched_count'  => $matchingPrograms->count(),
                        'admission_fee' => (float) $matchingPrograms->max('admission_fee'),
                        'program_fee' => (float) $matchingPrograms->sum('program_fee'),
                    ];
                }
            }
        }

        return response()->json([
            'message' => 'Student fee info fetched',
            'data' => [
                'student' => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'classes' => $student->classes,
                ],
                'admission_paid' => $admissionPaid,
                'admission_exists' => $admissionExists,
                'admission_amount' => $admissionAmount,
                'program_fees' => $programFees,
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
            // Breakdown fields
            'admission_fee'           => 'nullable|numeric|min:0',
            'admission_discount'      => 'nullable|numeric|min:0',
            'admission_discount_type' => 'nullable|in:cash,percentage',
            'admission_paid'          => 'nullable|boolean',
            'program_fee'             => 'nullable|numeric|min:0',
            'program_discount'        => 'nullable|numeric|min:0',
            'program_discount_type'   => 'nullable|in:cash,percentage',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Check if admission fee already exists for this student
        if ($data['fee_type'] === 'admission' || $data['fee_type'] === 'billing') {
            $exists = StudentFee::where('student_id', $data['student_id'])
                ->where(function($q) {
                    $q->where('fee_type', 'admission')
                      ->orWhere('fee_type', 'billing');
                })
                ->exists();
            if ($exists && !($request->has('allow_duplicate_billing'))) {
                return response()->json(['message' => 'Admission/Billing already recorded for this student.'], 400);
            }
        }

        $data['pending_amount'] = max(0, $data['total_amount'] - $data['paid_amount']);
        $data['status'] = $data['pending_amount'] <= 0 ? 'paid' : 'pending';

        $fee = StudentFee::create($data);

        return response()->json([
            'message' => 'Fee recorded successfully',
            'data' => $fee
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
