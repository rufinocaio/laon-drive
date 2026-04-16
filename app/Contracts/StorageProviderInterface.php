<?php

namespace App\Contracts;

use Illuminate\Http\UploadedFile;

interface StorageProviderInterface
{
    /**
     * @return array{key: string, url: string, name: string, size: int}|null
     */
    public function uploadFile(UploadedFile $file): ?array;

    public function deleteFile(string $fileKey): bool;

    public function deleteFiles(array $fileKeys): bool;
}
