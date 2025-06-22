<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
     protected $fillable = ['title', 'subject', 'body'];

    public function emailLogs()
    {
        return $this->hasMany(EmailLog::class);
    }
}
