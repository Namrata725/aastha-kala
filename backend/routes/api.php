<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\InstructorController;
use App\Http\Controllers\Api\GalleryCategoryController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\TestimonialController;
use App\Http\Controllers\Api\MessageController;

// Public Routes

// Auth
Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/login', [AuthController::class, 'login'])->name('login');

/// Public Settings
Route::get('/settings', [SettingController::class, 'show']);
Route::get('/instructors', [InstructorController::class, 'index']);
Route::post('/messages', [MessageController::class, 'store']);

// Galleries
Route::get('/galleries/position/{position}', [GalleryController::class, 'getByPosition']);

// Gallery Categories 
Route::get('/gallery-categories', [GalleryCategoryController::class, 'index']);
Route::get('/gallery-categories/{id}', [GalleryCategoryController::class, 'show']);

Route::get('/galleries', [GalleryController::class, 'index']);

// Protected Routes (Admin)
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);

    // Settings Management
    Route::prefix('settings')->group(function () {
        Route::get('/', [SettingController::class, 'show']);           
        Route::post('/', [SettingController::class, 'storeOrUpdate']); 
        Route::put('/', [SettingController::class, 'update']);
    });

    // Instructor Management
    Route::prefix('instructors')->group(function () {
        Route::get('/', [InstructorController::class, 'index']);
        Route::post('/', [InstructorController::class, 'store']);
        Route::get('/{id}', [InstructorController::class, 'show']);
        Route::put('/{id}', [InstructorController::class, 'update']);
        Route::delete('/{id}', [InstructorController::class, 'destroy']);
    });

    //gallery-categories
    Route::prefix('gallery-categories')->group(function () {
        Route::get('/', [GalleryCategoryController::class, 'index']);
        Route::get('/{id}', [GalleryCategoryController::class, 'show']);
        Route::post('/', [GalleryCategoryController::class, 'store']);
        Route::put('/{id}', [GalleryCategoryController::class, 'update']);
        Route::delete('/{id}', [GalleryCategoryController::class, 'destroy']);
    });
        // Gallery Management
    Route::prefix('galleries')->group(function () {
        Route::get('/', [GalleryController::class, 'index']);
        Route::get('/{id}', [GalleryController::class, 'show']);
        Route::post('/', [GalleryController::class, 'store']);
        Route::put('/{id}', [GalleryController::class, 'update']);
        Route::delete('/{id}', [GalleryController::class, 'destroy']);
    });

    Route::prefix('testimonials')->group(function () {
        Route::get('/', [TestimonialController::class, 'index']);
        Route::get('/{id}', [TestimonialController::class, 'show']);
        Route::post('/', [TestimonialController::class, 'store']);
        Route::put('/{id}', [TestimonialController::class, 'update']);
        Route::delete('/{id}', [TestimonialController::class, 'destroy']);
    });

    // Message Management
    Route::prefix('messages')->group(function () {
        Route::get('/', [MessageController::class, 'index']);
        Route::delete('/{id}', [MessageController::class, 'destroy']);
    });
    
});

// Current Authenticated User 
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});