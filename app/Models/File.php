<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class File extends Model
{
    use HasUlids;

    protected $fillable = [
        'user_id',
        'parent_id',
        'name',
        'original_name',
        'mime_type',
        'size',
        'file_key',
        'url',
        'is_folder',
    ];

    protected $casts = [
        'is_folder' => 'boolean',
        'size' => 'integer',
    ];

    protected $appends = ['formatted_size'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(File::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(File::class, 'parent_id');
    }

    /**
     * Retorna todos os arquivos descendentes (recursivo).
     */
    public function allChildren(): HasMany
    {
        return $this->children()->with('allChildren');
    }

    public function scopeFolders($query)
    {
        return $query->where('is_folder', true);
    }

    public function scopeOnlyFiles($query)
    {
        return $query->where('is_folder', false);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function getFormattedSizeAttribute(): string
    {
        if ($this->is_folder || $this->size === null) {
            return '—';
        }

        $bytes = $this->size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = 0;

        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Coleta todas as chaves (file_keys) deste arquivo e de seus descendentes (para exclusão na API).
     */
    public function getAllFileKeys(): array
    {
        $keys = [];

        if ($this->file_key) {
            $keys[] = $this->file_key;
        }

        if ($this->is_folder) {
            foreach ($this->children()->get() as $child) {
                $keys = array_merge($keys, $child->getAllFileKeys());
            }
        }

        return $keys;
    }
}
