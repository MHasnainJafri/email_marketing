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
        Schema::create('email_logs', function (Blueprint $table) {
            $table->id();
    $table->foreignId('contact_id')->constrained()->onDelete('cascade');
    $table->foreignId('email_template_id')->constrained()->onDelete('cascade');
    $table->string('status')->default('pending'); // pending, sent, failed
    $table->text('error_message')->nullable();
    $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_logs');
    }
};
