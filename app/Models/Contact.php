<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
      protected $fillable = ['name', 'email','batch_id'];

    public function emailLogs()
    {
        return $this->hasMany(EmailLog::class);
    }
    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }
}
