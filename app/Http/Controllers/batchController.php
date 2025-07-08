<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use Illuminate\Http\Request;

class batchController extends Controller
{
    public function index()
    {
        $search = request('search');

    $query = Batch::with(['campaigns.emailTemplate'])->withCount('contacts')->latest();

    if ($search) {
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%");
            //   ->orWhere('email', 'like', "%{$search}%");
        });
    }

    return $query->paginate(20);

    }

    public function show($id)
    {
        $batch = Batch::with(['contacts', 'campaigns.emailTemplate'])->findOrFail($id);
        return response()->json($batch);
    }
}
