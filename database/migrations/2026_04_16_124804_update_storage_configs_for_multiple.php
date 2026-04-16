<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Executa a migration.
     */
    public function up(): void
    {
        Schema::table('storage_configs', function (Blueprint $table) {
            $table->string('name')->after('user_id');
            $table->dropColumn('use_custom_s3');
            $table->softDeletes();
        });
    }

    /**
     * Reverte a migration.
     */
    public function down(): void
    {
        Schema::table('storage_configs', function (Blueprint $table) {
            $table->dropColumn('name');
            $table->boolean('use_custom_s3')->default(false)->after('user_id');
            $table->dropSoftDeletes();
        });
    }
};
