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
    ]);

    Excel::import(new ContactImport, $request->file('file'));

    return response()->json(['message' => 'Contacts imported successfully.']);
}

public function index()
{
    $search = request('search');

    $query = Contact::latest();

    if ($search) {
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }

    return $query->paginate(20);
} 



}