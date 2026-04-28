<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'device_user_id',
        'phone',
        'address',
        'type',
        'salary_basis',
        'salary_amount',
        'percentage',
        'joining_date',
        'status',
        'image',
    ];

    public function instructor()
    {
        return $this->hasOne(Instructor::class);
    }

    public function salaryPayments()
    {
        return $this->hasMany(SalaryPayment::class);
    }
}
