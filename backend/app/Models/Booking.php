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
        'name',
        'phone',
        'email',
        'message',
        'class_mode',
        'type',
        'custom_start_time',
        'custom_end_time',
        'status',
    ];

    protected $casts = [
        'custom_start_time' => 'datetime:H:i',
        'custom_end_time' => 'datetime:H:i',
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
}