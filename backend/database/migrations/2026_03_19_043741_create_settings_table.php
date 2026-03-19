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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('company_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->text('location_map')->nullable();
            $table->text('about_short')->nullable();
            $table->text('about')->nullable();
            $table->string('banner')->nullable();
            $table->string('logo')->nullable();
            $table->json('mission')->nullable();
            $table->integer('years_of_experience')->default(0);
            $table->integer('awards')->default(0);
            $table->integer('number_of_instructors')->default(0);
            $table->integer('number_of_students')->default(0);
            $table->integer('success_rate')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
