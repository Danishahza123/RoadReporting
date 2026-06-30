<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PageController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', [PageController::class, 'showIndex'])->name('home');
// Legacy-migrated SPA page (converted from public/index.html)
Route::get('/dashboard', [PageController::class, 'showIndex'])->name('dashboard');
Route::get('/about', [PageController::class, 'showAbout'])->name('about');
Route::get('/contact', [PageController::class, 'showContact'])->name('contact');

Route::post('/contact', [PageController::class, 'submitContact'])->name('contact.submit');

