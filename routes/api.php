<?php

use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\EmailSendController;
use App\Http\Controllers\Api\EmailTemplateController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


// routes/api.php
Route::prefix('contacts')->group(function () {
    Route::post('/import', [ContactController::class, 'import']);
    Route::get('/', [ContactController::class, 'index']);
});

// routes/api.php
Route::apiResource('templates', EmailTemplateController::class);

// routes/api.php
Route::prefix('send-email')->group(function () {
    Route::post('/', [EmailSendController::class, 'send']);
    Route::post('/one', [EmailSendController::class, 'sendToOne']);
    Route::post('/all', [EmailSendController::class, 'sendToAll']);
});


Route::get('/campaigns', [EmailSendController::class, 'campaigns']);


// store file
Route::post('/store-file', [EmailSendController::class, 'storeFile']);