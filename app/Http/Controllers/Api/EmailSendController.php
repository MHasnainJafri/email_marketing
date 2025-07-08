<?php

namespace App\Http\Controllers\Api;

use App\Models\Contact;
use App\Models\EmailCampaign;
use Illuminate\Http\Request;
use App\Models\EmailTemplate;
use App\Jobs\SendMarketingEmail;
use App\Http\Controllers\Controller;
use App\Models\BatchCompaign;

class EmailSendController extends Controller
{
    /**
     * Send a marketing email to one or all contacts.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendToOne(Request $request)
    {
        $request->validate([
            'contact_id' => 'required|exists:contacts,id',
            'template_id' => 'required|exists:email_templates,id',
        ]);

        $contact = Contact::findOrFail($request->contact_id);
        $template = EmailTemplate::findOrFail($request->template_id);

        dispatch(new SendMarketingEmail($contact, $template));

        return response()->json(['message' => 'Email queued for sending to one contact.']);
    }

    public function sendToAll(Request $request)
    {
        $request->validate([
            'template_id' => 'required|exists:email_templates,id',
        ]);

        $template = EmailTemplate::findOrFail($request->template_id);
        $contacts = Contact::all();

        foreach ($contacts as $contact) {
            dispatch(new SendMarketingEmail($contact, $template));
        }

        return response()->json(['message' => 'Emails queued for all contacts.']);
    }
    public function to_batch_users($id,Request $request)
    {
        $request->validate([
            'template_id' => 'required|exists:email_templates,id',
        ]);

        $template = EmailTemplate::findOrFail($request->template_id);
        $contacts = Contact::where('batch_id', $id)->get();

        foreach ($contacts as $contact) {
            dispatch(new SendMarketingEmail($contact, $template));
        }
        BatchCompaign::create([
            'batch_id' => $id,
            'email_template_id' => $template->id,
        ]);

        return response()->json(['message' => 'Emails queued for all contacts.']);
    }
    public function send(Request $request)
    {
        $validated = $request->validate([
            'template_id' => 'required|exists:email_templates,id',
            'contact_ids' => 'nullable|array',
            'contact_ids.*' => 'integer|exists:contacts,id',
                    'name'          => 'nullable|string|max:255'
        ]);

        $template = EmailTemplate::findOrFail($validated['template_id']);

        // If contact_ids provided, fetch those, else fetch all
        $contacts = isset($validated['contact_ids']) && !empty($validated['contact_ids']) ? Contact::whereIn('id', $validated['contact_ids'])->get() : Contact::all();
 // Create a campaign record
    $campaign = EmailCampaign::create([
        'name' => $validated['name'] ?? 'Campaign #' . now()->format('YmdHis'),
        'email_template_id' => $template->id,
        'total_contacts' => $contacts->count(),
        'status' => 'queued',
    ]);


        foreach ($contacts as $contact) {
    dispatch(new SendMarketingEmail($contact, $template, $campaign->id));
        }
$campaign->update(['status' => 'processing']);
        return response()->json([
            'message' => 'Emails have been queued successfully.',
            'total_queued' => $contacts->count(),

                    'campaign_id' => $campaign->id,
        ]);
    }

    public function campaigns()
{
    $campaigns = EmailCampaign::with('template:id,title')->latest()->paginate(10);

    return response()->json($campaigns);
}


// /storeFile 
    public function storeFile(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpeg,jpg,png,gif,mp4,avi,mov,webm|max:20480',
        ]);

        // Store the file in the public storage
        $path = $request->file('file')->store('email_files', 'public');
        //return public url
        $url = asset('storage/' . $path);
        return response()->json([
            'message' => 'File uploaded successfully.',
            'file_url' => $url,
        ]);

    }
}
