<?php

namespace App\Imports;

use App\Models\Contact;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;


class ContactImport implements ToModel, WithHeadingRow
{
    protected $batchId;
    public function __construct($batchId = null)
    {
        $this->batchId = $batchId;
    }
    public function model(array $row)
    {
        $email = $row['email'] ?? null;
        if (!$email) {
            return null; // skip rows without email
        }

        // Check if contact with this email already exists in any batch
        if (Contact::where('email', $email)->exists()) {
            return null; // skip if already exists
        }

        // Create new contact
        return new Contact([
            'name'     => $row['name'] ?? $row['user_name'] ?? null,
            'email'    => $email,
            'batch_id' => $this->batchId,
        ]);
    }
}
