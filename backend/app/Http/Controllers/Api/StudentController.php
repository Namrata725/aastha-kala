<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('phone', 'like', '%' . $request->search . '%');
        }

        $students = $query->paginate(10);

        foreach ($students as $student) {
            $student->image_url = $student->image ? asset('storage/' . $student->image) : null;
        }

        return response()->json([
            'message' => 'Students fetched successfully',
            'data' => $students
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'dob' => 'nullable|date',
            'address' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'time' => 'nullable|string',
            'offer_enroll_reference' => 'nullable|string',
            'gender' => 'nullable|string',
            'classes' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,graduated',
            'enrollment_date' => 'nullable|date',
            'duration_value' => 'nullable|numeric|min:0',
            'duration_unit' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('students', 'public');
        }

        $student = Student::create($data);

        // Auto-create an initial fee record for every new student.
        // Uses the global admission_fee from Settings and matches program fees from classes.
        $setting = \App\Models\Setting::first();
        $admissionFee = $setting ? (float) ($setting->admission_fee ?? 0) : 0;
        
        $programFeeTotal = 0;
        $classTitles = [];
        if (!empty($student->classes)) {
            $classTitles = array_map('trim', array_filter(explode(',', $student->classes)));
            if (!empty($classTitles)) {
                $programFeeTotal = \App\Models\Program::where('is_active', true)
                    ->where(function($q) use ($classTitles) {
                        foreach ($classTitles as $title) {
                            $q->orWhereRaw('LOWER(title) = ?', [strtolower($title)]);
                        }
                    })
                    ->sum('program_fee');
            }
        }

        $totalInitialAmount = $admissionFee + $programFeeTotal;
        $feeType = ($admissionFee > 0 && $programFeeTotal > 0) ? 'billing' : ($programFeeTotal > 0 ? 'program' : 'admission');

        \App\Models\StudentFee::create([
            'student_id'     => $student->id,
            'fee_type'       => $feeType,
            'total_amount'   => $totalInitialAmount,
            'paid_amount'    => 0,
            'pending_amount' => $totalInitialAmount,
            'status'         => $totalInitialAmount > 0 ? 'pending' : 'paid',
            'admission_fee'  => $admissionFee > 0 ? $admissionFee : null,
            'program_fee'    => $programFeeTotal > 0 ? $programFeeTotal : null,
            'month_year'     => date('F Y'), // Default to current month for initial record
            'payment_method' => 'Cash',
            'remarks'        => 'Auto-generated billing record on enrollment',
        ]);

        return response()->json([
            'message' => 'Student created successfully',
            'data' => $student
        ], 201);
    }

    public function show($id)
    {
        $student = Student::with('fees')->findOrFail($id);
        $student->image_url = $student->image ? asset('storage/' . $student->image) : null;

        return response()->json([
            'data' => $student
        ]);
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'dob' => 'nullable|date',
            'address' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'time' => 'nullable|string',
            'offer_enroll_reference' => 'nullable|string',
            'gender' => 'nullable|string',
            'classes' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,graduated',
            'enrollment_date' => 'nullable|date',
            'duration_value' => 'nullable|numeric|min:0',
            'duration_unit' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if ($request->hasFile('image')) {
            if ($student->image) {
                Storage::disk('public')->delete($student->image);
            }
            $data['image'] = $request->file('image')->store('students', 'public');
        }

        $student->update($data);
        
        // If classes were updated, re-calculate and match program fees for pending records
        if (isset($data['classes'])) {
            $classTitles = array_map('trim', array_filter(explode(',', $student->classes)));
            $newProgramFeeTotal = 0;
            if (!empty($classTitles)) {
                $newProgramFeeTotal = \App\Models\Program::where('is_active', true)
                    ->where(function($q) use ($classTitles) {
                        foreach ($classTitles as $title) {
                            $q->orWhereRaw('LOWER(title) = ?', [strtolower($title)]);
                        }
                    })
                    ->sum('program_fee');
            }

            // Find the most recent pending fee record and update its program_fee and total_amount
            $pendingRecord = \App\Models\StudentFee::where('student_id', $student->id)
                ->where('status', 'pending')
                ->latest()
                ->first();

            if ($pendingRecord) {
                // Keep the existing admission_fee if it exists on that record
                $adm = (float) ($pendingRecord->admission_fee ?? 0);
                $newTotal = $adm + $newProgramFeeTotal;
                
                $pendingRecord->update([
                    'program_fee'    => $newProgramFeeTotal > 0 ? $newProgramFeeTotal : null,
                    'total_amount'   => $newTotal,
                    'pending_amount' => max(0, $newTotal - (float)$pendingRecord->paid_amount),
                    'status'         => ($newTotal - (float)$pendingRecord->paid_amount) <= 0 ? 'paid' : 'pending',
                ]);
            }
        }

        return response()->json([
            'message' => 'Student updated successfully',
            'data' => $student
        ]);
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);
        if ($student->image) {
            Storage::disk('public')->delete($student->image);
        }
        $student->delete();

        return response()->json([
            'message' => 'Student deleted successfully'
        ]);
    }
}
