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
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('students', 'public');
        }

        $student = Student::create($data);

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
