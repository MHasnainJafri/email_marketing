<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailLog extends Model
{
     protected $fillable = [
        'contact_id',
        'email_template_id',
        'status',
        'error_message'
    ];

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function emailTemplate()
    {
        return $this->belongsTo(EmailTemplate::class);
    }
}
