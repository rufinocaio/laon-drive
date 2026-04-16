<?php

use App\Http\Controllers\FileController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('drive.index', ['folder' => null]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('drive/{folder?}', [FileController::class, 'index'])->name('drive.index');
    Route::post('drive/upload', [FileController::class, 'upload'])->name('drive.upload');
    Route::post('drive/folder', [FileController::class, 'createFolder'])->name('drive.createFolder');
    Route::put('drive/{file}/rename', [FileController::class, 'rename'])->name('drive.rename');
    Route::delete('drive/{file}', [FileController::class, 'destroy'])->name('drive.destroy');
    Route::post('drive/{file}/share', [FileController::class, 'toggleShare'])->name('drive.share');
});

Route::get('/s/{token}', [FileController::class, 'publicShow'])->name('drive.publicShow');
Route::get('/s/{token}/download', [FileController::class, 'publicDownload'])->name('drive.publicDownload');

require __DIR__ . '/settings.php';
