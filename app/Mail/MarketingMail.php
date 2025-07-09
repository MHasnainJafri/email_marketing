<?php

namespace App\Mail;

use App\Models\EmailTemplate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MarketingMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public $template;
    public $contact;

    public function __construct(EmailTemplate $template, $contact = null)
    {
        $this->template = $template;
        $this->contact = $contact;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->template->title,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
{
    $replacements = [
        '{{name}}' => $this->contact?->name ?? '',
        '{{email}}' => $this->contact?->email ?? '',
        '{{company}}' => $this->contact?->company ?? '',
    ];

    $parsedBody = strtr($this->template->body, $replacements);

    return new Content(
        view: 'emails.marketing',
        with: [
            'subject' => $this->template->subject,
            'body' => $parsedBody,
        ]
    );
}


    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
