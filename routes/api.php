<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| All routes here return JSON only (NO views / NO blade)
*/

/* =========================
   AUTH ROUTES (PUBLIC)
========================= */
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

/* =========================
   PROTECTED ROUTES (SANCTUM)
========================= */
Route::middleware('auth:sanctum')->group(function () {

    /* USER */
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    /* ADMIN USERS */
    Route::get('/users', [AuthController::class, 'users']);
    Route::patch('/users/{user}', [AuthController::class, 'updateUser']);

    /* REPORTS */
    Route::prefix('reports')->group(function () {
        Route::post('/', [ReportController::class, 'store']);
        Route::get('/', [ReportController::class, 'index']);
        Route::patch('/{id}', [ReportController::class, 'update']);
        Route::delete('/{id}', [ReportController::class, 'destroy']);
    });

    /* USER REPORTS */
    Route::get('/my-reports', [ReportController::class, 'myReports']);
});
