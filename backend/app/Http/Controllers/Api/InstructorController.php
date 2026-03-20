<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instructor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class InstructorController extends Controller
{
    // GET /api/instructors
    public function index()
    {
        $instructors = Instructor::paginate(10);

        return response()->json([
            'success' => true,
            'data' => $instructors
        ]);
    }

    // POST /api/instructors
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'about' => 'required|string',
            'facebook_url' => 'nullable|url',
            'instagram_url' => 'nullable|url',
            'email' => 'required|email|unique:instructors,email',
            'phone' => 'required|string|max:20',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only([
            'name',
            'title',
            'about',
            'facebook_url',
            'instagram_url',
            'email',
            'phone'
        ]);

        $data['about'] = is_string($data['about']) ? $data['about'] : null;
        $data['facebook_url'] = is_string($data['facebook_url']) ? $data['facebook_url'] : null;
        $data['instagram_url'] = is_string($data['instagram_url']) ? $data['instagram_url'] : null;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('instructors', 'public');
            $data['image'] = asset('storage/' . $path);
        }

        $instructor = Instructor::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Instructor created successfully',
            'data' => $instructor
        ], 201);
    }

    // GET /api/instructors/{id}
    public function show($id)
    {
        $instructor = Instructor::find($id);

        if (!$instructor) {
            return response()->json([
                'success' => false,
                'message' => 'Instructor not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $instructor
        ]);
    }

    // PUT/PATCH /api/instructors/{id}
    public function update(Request $request, $id)
    {
        $instructor = Instructor::find($id);

        if (!$instructor) {
            return response()->json([
                'success' => false,
                'message' => 'Instructor not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'about' => 'required|string',
            'facebook_url' => 'nullable|url',
            'instagram_url' => 'nullable|url',
            'email' => 'required|email|unique:instructors,email,' . $id,
            'phone' => 'required|string|max:20',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only([
            'name',
            'title',
            'about',
            'facebook_url',
            'instagram_url',
            'email',
            'phone'
        ]);

        $data['about'] = is_string($data['about']) ? $data['about'] : null;
        $data['facebook_url'] = is_string($data['facebook_url']) ? $data['facebook_url'] : null;
        $data['instagram_url'] = is_string($data['instagram_url']) ? $data['instagram_url'] : null;

        if ($request->hasFile('image')) {
            if ($instructor->image) {
                $oldPath = str_replace(asset('storage/'), '', $instructor->image);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image')->store('instructors', 'public');
            $data['image'] = asset('storage/' . $path);
        }

        $instructor->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Instructor updated successfully',
            'data' => $instructor
        ]);
    }

    // DELETE /api/instructors/{id}
    public function destroy($id)
    {
        $instructor = Instructor::find($id);

        if (!$instructor) {
            return response()->json([
                'success' => false,
                'message' => 'Instructor not found'
            ], 404);
        }

        
        if ($instructor->image) {
            $oldPath = str_replace(asset('storage/'), '', $instructor->image);
            Storage::disk('public')->delete($oldPath);
        }

        $instructor->delete();

        return response()->json([
            'success' => true,
            'message' => 'Instructor deleted successfully'
        ]);
    }
}