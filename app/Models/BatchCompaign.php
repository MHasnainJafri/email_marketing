<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BatchCompaign extends Model
{
    
    protected $fillable = [
        'batch_id',
        'email_template_id',
    ];

    /**
     * Get the batch associated with the campaign.
     */
    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    /**
     * Get the email template associated with the campaign.
     */
    public function emailTemplate()
    {
        return $this->belongsTo(EmailTemplate::class);
    }
}
