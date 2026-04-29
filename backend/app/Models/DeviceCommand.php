<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceCommand extends Model
{
    protected $fillable = [
        'sn',
        'command',
        'status',
        'sent_at',
    ];
}
