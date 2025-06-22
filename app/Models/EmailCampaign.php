<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailCampaign extends Model
{
     protected $fillable = [
        'name',
        'email_template_id',
        'total_contacts',
        'emails_sent',
        'status'
    ];

    public function template()
    {
        return $this->belongsTo(EmailTemplate::class, 'email_template_id');
    }
}
