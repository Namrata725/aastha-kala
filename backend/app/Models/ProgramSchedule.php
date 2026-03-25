<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProgramSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'start_time',
        'end_time'
    ];

    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}