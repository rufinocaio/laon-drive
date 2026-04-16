<?php

namespace App\Services;

use App\Contracts\StorageProviderInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class S3StorageService implements StorageProviderInterface
{
    private string $diskName = 'custom_s3';

    public function __construct() {}

    /**
     * @return array{key: string, url: string, name: string, size: int}|null
     */
    public function uploadFile(UploadedFile $file): ?array
    {
        try {
            Log::info('[S3 DEBUG] 1. Upload started', [
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime' => $file->getMimeType(),
                'disk' => $this->diskName,
                'bucket' => config('filesystems.disks.custom_s3.bucket'),
                'region' => config('filesystems.disks.custom_s3.region'),
                'endpoint' => config('filesystems.disks.custom_s3.endpoint'),
            ]);

            // Evita forçar ACL público porque muitos buckets desabilitam ACLs.
            $path = Storage::disk($this->diskName)->putFile('drive_files', $file);

            if (!$path) {
                Log::error('[S3 DEBUG] PUT upload FAILED', [
                    'reason' => 'Storage::putFile returned false or null'
                ]);
                return null;
            }

            Log::info('[S3 DEBUG] 2. Upload SUCCESS', [
                'key' => $path,
                'url' => Storage::disk($this->diskName)->url($path),
            ]);

            return [
                'key' => $path,
                'url' => Storage::disk($this->diskName)->url($path),
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
            ];
        } catch (\Exception $e) {
            Log::error('[S3 DEBUG] EXCEPTION during upload', [
                'message' => $e->getMessage(),
                'exception' => $e::class,
                'file' => $e->getFile() . ':' . $e->getLine(),
            ]);
            return null;
        }
    }

    public function deleteFile(string $fileKey): bool
    {
        return $this->deleteFiles([$fileKey]);
    }

    public function deleteFiles(array $fileKeys): bool
    {
        if (empty($fileKeys)) {
            return true;
        }

        try {
            Log::info('[S3 DEBUG] 1. Delete request', ['fileKeys' => $fileKeys, 'disk' => $this->diskName]);

            foreach ($fileKeys as $key) {
                Storage::disk($this->diskName)->delete($key);
            }

            Log::info('[S3 DEBUG] 2. Delete SUCCESS', ['fileKeys' => $fileKeys]);

            return true;
        } catch (\Exception $e) {
            Log::error('[S3 DEBUG] Delete EXCEPTION', [
                'message' => $e->getMessage(),
                'fileKeys' => $fileKeys,
            ]);
            return false;
        }
    }
}
