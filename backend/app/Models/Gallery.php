<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Gallery extends Model
{
    use HasFactory;
    protected $fillable = [
        'title',
        'type',
        'category_id',
        'description',
        'position',
        'video',
        'images'
    ];

    protected $casts = [
        'images' => 'array',
    ];
    
    public function category()
    {
        return $this->belongsTo(GalleryCategory::class);
    }

}
