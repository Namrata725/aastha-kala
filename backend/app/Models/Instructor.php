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
        return $this->belongsToMany(Program::class, 'program_instructor')->withTimestamps();
    }

    public function availabilities()
    {
        return $this->hasMany(InstructorAvailability::class);
    }

    public function fixed_classes()
    {
        return $this->hasMany(ProgramSchedule::class);
    }
}