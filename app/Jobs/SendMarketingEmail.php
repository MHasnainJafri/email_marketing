<?php

namespace App\Jobs;

use App\Mail\MarketingMail;
use App\Models\Contact;
use App\Models\EmailCampaign;
use App\Models\EmailLog;
use App\Models\EmailTemplate;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendMarketingEmail implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    protected $contact;
    protected $template;
    protected $campaignId;

    public function __construct(Contact $contact, EmailTemplate $template, $campaignId = null)
    {
        $this->contact = $contact;
        $this->template = $template;
        $this->campaignId = $campaignId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
         try {
            Mail::to($this->contact->email)->send(new MarketingMail($this->template));
            EmailLog::create([
                'contact_id' => $this->contact->id,
                'email_template_id' => $this->template->id,
                'status' => 'sent',
            ]);

             if ($this->campaignId) {
                EmailCampaign::where('id', $this->campaignId)
                    ->increment('emails_sent');

                $campaign = EmailCampaign::find($this->campaignId);
                if ($campaign->emails_sent >= $campaign->total_contacts) {
                    $campaign->update(['status' => 'completed']);
                }
            }
        } catch (\Exception $e) {
            EmailLog::create([
                'contact_id' => $this->contact->id,
                'email_template_id' => $this->template->id,
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }
    }
}
