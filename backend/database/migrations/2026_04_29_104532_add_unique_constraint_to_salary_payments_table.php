<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Identify and remove duplicate salary payment records before applying the unique constraint.
        // We keep the latest record (max id) for each employee/month/year/type combination.
        $duplicates = DB::table('salary_payments')
            ->select('employee_id', 'month', 'year', 'payment_type', DB::raw('COUNT(*) as count'), DB::raw('MAX(id) as max_id'))
            ->groupBy('employee_id', 'month', 'year', 'payment_type')
            ->having('count', '>', 1)
            ->get();

        foreach ($duplicates as $duplicate) {
            DB::table('salary_payments')
                ->where('employee_id', $duplicate->employee_id)
                ->where('month', $duplicate->month)
                ->where('year', $duplicate->year)
                ->where('payment_type', $duplicate->payment_type)
                ->where('id', '<', $duplicate->max_id)
                ->delete();
        }

        // 2. Apply the unique constraint with a descriptive index name.
        Schema::table('salary_payments', function (Blueprint $table) {
            $table->unique(['employee_id', 'month', 'year', 'payment_type'], 'unique_salary_payments_employee_period_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('salary_payments', function (Blueprint $table) {
            if (DB::getDriverName() !== 'sqlite') {
                $table->dropUnique('unique_salary_payments_employee_period_type');
            } else {
                // SQLite does not support dropping unique constraints easily without recreating the table.
                // However, for development purposes, dropping the index by name often works or is skipped.
            }
        });
    }
};
