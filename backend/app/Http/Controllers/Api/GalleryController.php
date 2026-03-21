<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Gallery;

class GalleryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(
            Gallery::with('category')->orderBy('position')->get()
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:video,images',
            'category_id' => 'required|exists:gallery_categories,id',
            'description' => 'required|string',
            'position' => 'required|integer',
            'video' => 'nullable|mimes:mp4,mov,avi',
            'images.*' => 'nullable|image|mimes:jpg,jpeg,png'
        ]);

        // Upload video
        $videoPath = $request->hasFile('video') ? $request->file('video')->store('videos','public') : null;

        // Upload images array
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $img) {
                $imagePaths[] = $img->store('images','public');
            }
        }

        // Create gallery
        $gallery = Gallery::create([
            'title' => $request->title,
            'type' => $request->type,
            'category_id' => $request->category_id,
            'description' => $request->description,
            'position' => $request->position,
            'video' => $videoPath,
            'images' => $imagePaths
        ]);

        return response()->json($gallery->load('category'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $gallery = Gallery::with('category')->findOrFail($id);
        return response()->json($gallery);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $gallery = Gallery::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:video,images',
            'category_id' => 'required|exists:gallery_categories,id',
            'description' => 'required|string',
            'position' => 'required|integer',
            'video' => 'nullable|mimes:mp4,mov,avi',
            'images.*' => 'nullable|image|mimes:jpg,jpeg,png'
        ]);

        // Upload video if provided
        if ($request->hasFile('video')) {
            $gallery->video = $request->file('video')->store('videos','public');
        }

        // Upload images array if provided (replace)
        if ($request->hasFile('images')) {
            $imagePaths = [];
            foreach ($request->file('images') as $img) {
                $imagePaths[] = $img->store('images','public');
            }
            $gallery->images = $imagePaths;
        }

        // Update other fields
        $gallery->title = $request->title;
        $gallery->type = $request->type;
        $gallery->category_id = $request->category_id;
        $gallery->description = $request->description;
        $gallery->position = $request->position;
        $gallery->save();

        return response()->json($gallery->load('category'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $gallery = Gallery::findOrFail($id);
        $gallery->delete();

        return response()->json([
            'message' => 'Gallery deleted successfully'
        ]);
    }
}
