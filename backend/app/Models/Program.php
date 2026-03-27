<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'image',
        'speciality',
        'is_active',
    ];

    protected $casts = [
        'speciality' => 'array',
        'is_active' => 'boolean',
    ];

    public function schedules()
    {
        return $this->hasMany(ProgramSchedule::class)->orderBy('start_time');
    }

    public function instructors()
    {
        return $this->belongsToMany(Instructor::class, 'program_instructor')->withTimestamps();
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
