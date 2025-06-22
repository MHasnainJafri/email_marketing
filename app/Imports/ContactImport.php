<?php

namespace App\Imports;

use App\Models\Contact;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;


class ContactImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
       
        return new Contact([
            'name'  => $row['name'] ?? $row['user_name']??null,
            'email' => $row['email'],
        ]);
    }
}
