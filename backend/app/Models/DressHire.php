<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DressHire extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'order',
        'images',
    ];

    protected $casts = [
        'images' => 'array',
    ];
}
