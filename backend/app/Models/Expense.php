<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'amount',
        'expense_date',
        'category',
        'payment_method',
        'remarks',
        'receipt_image',
    ];
}
