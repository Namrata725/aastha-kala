<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Instructor extends Model
{
    protected $fillable = [
        'name',
        'title',
        'about',
        'facebook_url',
        'instagram_url',
        'email',
        'phone',
        'image',
    ];
}
