<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\ContactImport;
use App\Models\Contact;

class ContactController extends Controller
{
    // app/Http/Controllers/Api/ContactController.php


public function import(Request $request)
{
    
    $request->validate([
        'file' => 'required|file|mimes:xlsx,csv,txt',
        'batch_name' => 'nullable|string|max:255',
    ]);

    $batch_name= $request->input('batch_name',null);

    /// if batch nam eis null then create a new batch name with date and a string 
    if (!$batch_name) {
        $batch_name = 'Batch_' . now()->format('Y_m_d_H_i_s');
    }
    // If batch name is provided, you can handle it here
    $batchId = null;

    if ($batch_name) {
        $batch = new \App\Models\Batch();
        $batch->name = $request->input('batch_name');
        $batch->file_path = $request->file('file')->store('batches');
        $batch->save();
        $batchId = $batch->id;
    }

    Excel::import(new ContactImport($batchId), $request->file('file'));

    return response()->json(['message' => 'Contacts imported successfully.']);
}

public function index($id=null)
{
    $search = request('search');

    $query = Contact::with('batch:id,name')->latest();
    if ($id) {
        $query->where('batch_id', $id);
    }
    if ($search) {
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }

    return $query->paginate(20);
} 



}