<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->decimal('admission_fee', 10, 2)->nullable()->after('is_active');
            $table->decimal('program_fee', 10, 2)->nullable()->after('admission_fee');
        });
    }

    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropColumn(['admission_fee', 'program_fee']);
        });
    }
};
