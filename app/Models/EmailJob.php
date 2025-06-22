<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailJob extends Model
{
     protected $fillable = [
        'job_name',
        'total',
        'sent',
        'status'
    ];
}
