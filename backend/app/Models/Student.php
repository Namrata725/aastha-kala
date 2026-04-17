<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'image',
        'dob',
        'address',
        'phone',
        'email',
        'time',
        'offer_enroll_reference',
        'gender',
        'classes',
        'enrollment_date',
        'duration_value',
        'duration_unit',
        'status',
    ];

    protected $casts = [
        'dob' => 'date',
        'enrollment_date' => 'date',
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }

    public function fees()
    {
        return $this->hasMany(StudentFee::class);
    }

    public function enrollments()
    {
        return $this->hasMany(StudentProgram::class);
    }

    public function programs()
    {
        return $this->belongsToMany(Program::class, 'student_programs')
                    ->withPivot(['enrolled_at', 'status'])
                    ->withTimestamps();
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
