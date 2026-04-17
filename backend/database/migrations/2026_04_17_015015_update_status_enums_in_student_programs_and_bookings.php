<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('student_programs', function (Blueprint $table) {
            DB::statement("ALTER TABLE student_programs MODIFY COLUMN status ENUM('active', 'inactive', 'completed', 'graduated') DEFAULT 'active'");
        });

        Schema::table('bookings', function (Blueprint $table) {
            DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending', 'accepted', 'rejected', 'completed', 'inactive', 'graduated') DEFAULT 'pending'");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_programs', function (Blueprint $table) {
            DB::statement("ALTER TABLE student_programs MODIFY COLUMN status ENUM('active', 'inactive', 'completed') DEFAULT 'active'");
        });

        Schema::table('bookings', function (Blueprint $table) {
            DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending'");
        });
    }
};
