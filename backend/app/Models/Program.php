<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'title',
        'description',
        'image',
        'speciality',
        'is_active',
        'admission_fee',
        'program_fee',
    ];

    protected $casts = [
        'parent_id' => 'integer',
        'speciality' => 'array',
        'is_active' => 'boolean',
    ];

    public function parent()
    {
        return $this->belongsTo(Program::class, 'parent_id');
    }

    public function subPrograms()
    {
        return $this->hasMany(Program::class, 'parent_id');
    }

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

    public function enrollments()
    {
        return $this->hasMany(StudentProgram::class);
    }
}
