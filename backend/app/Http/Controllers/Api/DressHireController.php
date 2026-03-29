<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DressHire;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class DressHireController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $dresses=DressHire::orderBy('order')->get();
        $dresses->transform(function($dress){
           if(!empty($dress->images)) {
            $dress->images=array_map(fn($img)=>str_starts_with($img,'http')?$img:asset('storage/'. $img),$dress->images);
           }
           return $dress;
        });

        return response()->json([
            'success'=>true,
            'data'=>$dresses
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator=Validator::make($request->all(),[
            'title'=>'required|string|max:255',
            'order'=>'nullable|integer|min:0',
            'images'=>'nullable|array',
            'images.*'=>'image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);
        if($validator->fails()){
            throw new HttpResponseException(response()->json([
                'success'=>false,
                'message'=>'Validation errors',
                'errors'=>$validator->errors()
            ],422));
        }

        $validated=$validator->validated();

        $imagePaths=[];
        if($request->hasFile('images')){
            foreach($request->file('images') as $image){
                $imagePaths[]=$image->store('dresses', 'public');
            }
        }

        $dress=DressHire::create([
            'title'=>$validated['title'],
            'order'=>$validated['order'] ?? 0,
            'images'=>$imagePaths
        ]);

        if(!empty($dress->images)){
            $dress->images=array_map(fn($img)=>asset('storage/'.$img),$dress->images);
        }
        return response()->json([
            'success'=>true,
            'data'=>$dress
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $dress= DressHire::findOrFail($id);
        if(!empty($dress->images)){
            $dress->images=array_map(fn($img)=>asset('storage/'.$img),$dress->images);
        }
        return response()->json([
            'success'=>true,
            'data'=>$dress
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
        {
            $dress = DressHire::findOrFail($id);

            
            $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'order' => 'nullable|integer|min:0',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'removed_images' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            throw new HttpResponseException(
                response()->json([
                    'success' => false,
                    'message' => 'Validation errors',
                    'errors' => $validator->errors()
                ], 422)
            );
        }

        $validated = $validator->validated();

            $existingImages = $dress->images ?? [];

            
            $removedImages = $validated['removed_images'] ?? [];
            foreach ($removedImages as $removedImage) {
                $filename = basename($removedImage);
                Storage::disk('public')->delete('dresses/' . $filename);
                $existingImages = array_filter($existingImages, fn($img) => basename($img) !== $filename);
            }

            
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $existingImages[] = $image->store('dresses', 'public');
                }
            }

            
            $dress->update([
                'title' => $validated['title'] ?? $dress->title,
                'order' => $validated['order'] ?? $dress->order,
                'images' => array_values($existingImages),
            ]);

            
            if (!empty($dress->images)) {
                $dress->images = array_map(fn($img) => asset('storage/' . $img), $dress->images);
            }

            return response()->json([
                'success' => true,
                'data' => $dress,
            ]);

        }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $dress =DressHire::findOrFail($id);
        if(!empty($dress->images)){
            foreach($dress->images as $image){
                Storage::disk('public')->delete($image);
            }
        }
        $dress->delete();
        return response()->json([
            'success'=>true,
            'message'=>'Dress hire entry deleted successfully'
        ]);
    }

}
