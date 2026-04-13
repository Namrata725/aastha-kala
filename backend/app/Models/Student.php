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

    public function fees()
    {
        return $this->hasMany(StudentFee::class);
    }
}
