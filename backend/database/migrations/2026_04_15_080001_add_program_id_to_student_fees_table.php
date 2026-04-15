<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_fees', function (Blueprint $table) {
            // Link each fee record directly to a specific program
            $table->foreignId('program_id')->nullable()->constrained()->onDelete('set null')->after('student_id');

            // Simplify fee_type: just 'admission' or 'program' (one record per payment)
            DB::statement("ALTER TABLE student_fees MODIFY COLUMN fee_type ENUM('admission', 'program', 'billing') NOT NULL DEFAULT 'program'");

            // Net amount after discount (computed and stored for fast querying)
            $table->decimal('net_amount', 10, 2)->nullable()->after('pending_amount');
        });
    }

    public function down(): void
    {
        Schema::table('student_fees', function (Blueprint $table) {
            $table->dropForeign(['program_id']);
            $table->dropColumn(['program_id', 'net_amount']);
            DB::statement("ALTER TABLE student_fees MODIFY COLUMN fee_type ENUM('admission', 'program', 'billing') NOT NULL");
        });
    }
};
