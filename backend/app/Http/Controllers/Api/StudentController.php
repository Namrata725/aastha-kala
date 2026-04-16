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

        // 1. Handle Admission Fee Record
        $setting = \App\Models\Setting::first();
        $admissionFee = $setting ? (float) ($setting->admission_fee ?? 0) : 0;
        
        if ($admissionFee > 0) {
            \App\Models\StudentFee::create([
                'student_id'     => $student->id,
                'fee_type'       => 'admission',
                'total_amount'   => $admissionFee,
                'paid_amount'    => 0,
                'pending_amount' => $admissionFee,
                'status'         => 'pending',
                'admission_fee'  => $admissionFee,
                'month_year'     => date('j F Y'),
                'payment_method' => 'Cash',
                'remarks'        => 'Auto-generated admission fee on enrollment',
            ]);
        }

        // 2. Handle Program Enrollments & Fees
        $this->syncProgramsAndFees($student);

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
        
        // If classes were updated, sync enrollments and generate missing fees
        if (isset($data['classes'])) {
            $this->syncProgramsAndFees($student);
        }

        return response()->json([
            'message' => 'Student updated successfully',
            'data' => $student
        ]);
    }

    /**
     * Syncs student_programs table and auto-generates student_fees records
     * for any active enrollment that doesn't have a record for the current month.
     */
    private function syncProgramsAndFees($student)
    {
        if (empty($student->classes)) {
            \App\Models\StudentProgram::where('student_id', $student->id)->delete();
            return;
        }

        $classTitles = array_map('trim', array_filter(explode(',', $student->classes)));
        
        // 1. Identify valid matching programs
        $programs = \App\Models\Program::where('is_active', true)
            ->where(function ($q) use ($classTitles) {
                foreach ($classTitles as $title) {
                    $q->orWhereRaw('LOWER(title) = ?', [strtolower($title)]);
                }
            })
            ->get();
            
        $programIds = $programs->pluck('id')->toArray();
        $currentMonth = date('j F Y');

        // 2. Sync StudentProgram (enrollments table)
        // Remove programs no longer in the CSV classes string
        \App\Models\StudentProgram::where('student_id', $student->id)
            ->whereNotIn('program_id', $programIds)
            ->delete();

        // Add new programs to enrollment table
        foreach ($programs as $prog) {
            $exists = \App\Models\StudentProgram::where('student_id', $student->id)
                ->where('program_id', $prog->id)
                ->exists();

            if (!$exists) {
                \App\Models\StudentProgram::create([
                    'student_id' => $student->id,
                    'program_id' => $prog->id,
                    'status' => 'active',
                    'enrolled_at' => now(),
                ]);
            }

            // 3. Auto-generate Fee Record if missing for this month
            // This ensures that even if a student has paid all previous fees,
            // adding a new program creates a new 'Pending' entry in Fees & Billing.
            $feeExists = \App\Models\StudentFee::where('student_id', $student->id)
                ->where('program_id', $prog->id)
                ->where('month_year', $currentMonth)
                ->exists();

            if (!$feeExists) {
                $feeAmount = (float) ($prog->program_fee ?? 0);

                \App\Models\StudentFee::create([
                    'student_id'     => $student->id,
                    'program_id'     => $prog->id,
                    'fee_type'       => 'program',
                    'total_amount'   => $feeAmount,
                    'paid_amount'    => 0,
                    'pending_amount' => $feeAmount,
                    'status'         => 'pending',
                    'program_fee'    => $feeAmount,
                    'month_year'     => $currentMonth,
                    'payment_method' => 'Cash',
                    'remarks'        => 'Auto-generated for program enrollment',
                ]);
            }
        }
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
