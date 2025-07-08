<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Batch extends Model
{
    protected $fillable = [
        'name',
        'file_path',
    ];

    /**
     * Get the contacts associated with the batch.
     */
    public function contacts()
    {
        return $this->hasMany(Contact::class);
    }
    /**
     * Get the campaigns associated with the batch.
     */
    public function campaigns(){
        return $this->hasMany(BatchCompaign::class);
    }
}
