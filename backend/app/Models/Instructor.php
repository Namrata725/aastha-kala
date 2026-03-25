<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Instructor extends Model
{
    use HasFactory;

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

    public function programs()
    {
        return $this->belongsToMany(Program::class)->withTimestamps();
    }
}