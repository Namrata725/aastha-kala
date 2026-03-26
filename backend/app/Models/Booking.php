<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'schedule_id',
        'instructor_id',
        'booking_date',
        'name',
        'phone',
        'email',
        'message',
        'class_mode',
        'type',
        'custom_start_time',
        'custom_end_time',
        'duration_value',
        'duration_unit',
        'status',
    ];

    protected $casts = [
        'custom_start_time' => 'string',
        'custom_end_time' => 'string',
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function schedule()
    {
        return $this->belongsTo(ProgramSchedule::class);
    }

    public function instructor()
    {
        return $this->belongsTo(Instructor::class);
    }

    public function schedules()
    {
        return $this->belongsToMany(ProgramSchedule::class, 'booking_schedule', 'booking_id', 'program_schedule_id');
    }
}
