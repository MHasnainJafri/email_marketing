<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\EmailTemplate;
use App\Http\Controllers\Controller;

class EmailTemplateController extends Controller
{
    // app/Http/Controllers/Api/EmailTemplateController.php

public function index()
{
    return EmailTemplate::latest()->paginate(10);
}

public function store(Request $request)
{
    $data = $request->validate([
        'title' => 'required|string|max:255',
        'subject' => 'required|string|max:255',
        'body' => 'required|string',
    ]);

    return EmailTemplate::create($data);
}

public function show(EmailTemplate $template)
{
    return $template;
}

public function update(Request $request, EmailTemplate $template)
{
    $data = $request->validate([
        'title' => 'sometimes|string|max:255',
        'subject' => 'sometimes|string|max:255',
        'body' => 'sometimes|string',
    ]);

    $template->update($data);
    return $template;
}

public function destroy(EmailTemplate $template)
{
    $template->delete();
    return response()->json(['message' => 'Template deleted']);
}

}
