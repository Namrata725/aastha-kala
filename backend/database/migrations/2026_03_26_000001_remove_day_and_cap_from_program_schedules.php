<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('program_schedules', function (Blueprint $table) {
            $table->dropColumn(['day_of_week', 'max_capacity']);
        });
    }

    public function down(): void
    {
        Schema::table('program_schedules', function (Blueprint $table) {
            $table->enum('day_of_week', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])->nullable()->after('instructor_id');
            $table->integer('max_capacity')->nullable()->after('end_time');
        });
    }
};
