<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PasswordResetController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Authentication Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
Route::post('/social-login', [AuthController::class, 'socialLogin']);

// Protected Authentication Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    
    // Role-Restricted Admin Routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/stats', [AuthController::class, 'adminStats']);
        Route::get('/admin/users', [AuthController::class, 'listUsers']);
        Route::post('/admin/users', [AuthController::class, 'createUser']);
    });
});

