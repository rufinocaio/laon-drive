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
        Schema::create('files', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->ulid('parent_id')->nullable();
            $table->string('name');
            $table->string('original_name')->nullable();
            $table->string('mime_type')->nullable();
            $table->bigInteger('size')->nullable();
            $table->string('file_key')->nullable();
            $table->string('url', 2048)->nullable();
            $table->boolean('is_folder')->default(false);
            $table->timestamps();

            $table->foreign('parent_id')->references('id')->on('files')->cascadeOnDelete();
            $table->index('user_id');
            $table->index('parent_id');
            $table->index('file_key');
            $table->index(['user_id', 'parent_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};
