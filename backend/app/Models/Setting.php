<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Setting extends Model
{
        use HasFactory;

    protected $fillable = [
        'company_name',
        'email',
        'phone',
        'address',
        'location_map',
        'about_short',
        'about',
        'banner',
        'logo',
        'mission',
        'years_of_experience',
        'awards',
        'number_of_instructors',
        'number_of_students',
        'success_rate',
        'why_choose_heading',
        'why_choose_content',
        'mission_paragraph',
    ];

    protected $casts = [
        'mission' => 'array', 
    ];
}
