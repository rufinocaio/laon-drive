<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StorageConfig extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        's3_key',
        's3_secret',
        's3_bucket',
        's3_region',
        's3_endpoint',
    ];

    protected $casts = [
        's3_key' => 'encrypted',
        's3_secret' => 'encrypted',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
