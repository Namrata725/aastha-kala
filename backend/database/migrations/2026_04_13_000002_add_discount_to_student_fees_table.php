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
            //  use a direct statement for compatibility.
            DB::statement("ALTER TABLE student_fees MODIFY COLUMN fee_type ENUM('admission', 'program', 'billing') NOT NULL");

            // Admission fee sub-fields
            $table->decimal('admission_fee', 10, 2)->nullable()->after('fee_type');
            $table->decimal('admission_discount', 10, 2)->default(0)->after('admission_fee');
            $table->enum('admission_discount_type', ['cash', 'percentage'])->default('cash')->after('admission_discount');
            $table->boolean('admission_paid')->default(false)->after('admission_discount_type');

            // Program fee sub-fields
            $table->decimal('program_fee', 10, 2)->nullable()->after('admission_paid');
            $table->decimal('program_discount', 10, 2)->default(0)->after('program_fee');
            $table->enum('program_discount_type', ['cash', 'percentage'])->default('cash')->after('program_discount');
        });
    }

    public function down(): void
    {
        Schema::table('student_fees', function (Blueprint $table) {
            DB::statement("ALTER TABLE student_fees MODIFY COLUMN fee_type ENUM('admission', 'monthly', 'billing') NOT NULL");
            $table->dropColumn([
                'admission_fee', 'admission_discount', 'admission_discount_type', 'admission_paid',
                'program_fee', 'program_discount', 'program_discount_type',
            ]);
        });
    }
};
