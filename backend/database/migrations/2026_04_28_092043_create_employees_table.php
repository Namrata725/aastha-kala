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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique()->nullable();
            $table->string('device_user_id')->nullable()->unique();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->enum('type', ['staff', 'instructor'])->default('staff');
            $table->enum('salary_basis', ['salary', 'percentage', 'none'])->default('salary');
            $table->decimal('salary_amount', 10, 2)->nullable();
            $table->decimal('percentage', 5, 2)->nullable();
            $table->date('joining_date')->nullable();
            $table->boolean('status')->default(true);
            $table->string('image')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
