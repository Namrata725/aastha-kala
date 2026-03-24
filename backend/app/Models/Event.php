<?php
namespace App\Models;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'banner',
        'event_date',
        'location',
        'contact_person_name',
        'contact_person_phone',
        'status',
    ];

    protected $casts = [
        'event_date' => 'datetime',
    ];


    protected static function boot()
    {
        parent::boot();

        static::creating(function ($event) {
            if (empty($event->slug)) {
                $event->slug = Str::slug($event->title);
            }
        });
    }
}