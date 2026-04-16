<?php

namespace App\Services;

use App\Contracts\StorageProviderInterface;
use App\Models\User;
use App\Models\File;

class StorageManagerService
{
    private ?User $user = null;
    private bool $useCustomS3 = false;
    private ?string $providerName = 'uploadthing';

    public function forUser(User $user, ?string $storageConfigId = null): self
    {
        $this->user = $user;

        if ($storageConfigId && $storageConfigId !== 'default') {
            // Busca inclusive configs com soft delete para poder deletar arquivos de configs antigas
            $config = $user->storageConfigs()->withTrashed()->find($storageConfigId);

            if ($config && !empty($config->s3_bucket) && !empty($config->s3_key)) {
                $this->useCustomS3 = true;
                $this->providerName = 's3:' . $config->id;

                config(['filesystems.disks.custom_s3' => [
                    'driver' => 's3',
                    'key' => decrypt($config->s3_key),
                    'secret' => decrypt($config->s3_secret),
                    'region' => $config->s3_region,
                    'bucket' => $config->s3_bucket,
                    'url' => null,
                    'endpoint' => $config->s3_endpoint ?: null,
                    'use_path_style_endpoint' => $config->s3_endpoint ? true : false,
                    // Mantém exceções do S3 visíveis nos logs para facilitar a depuração.
                    'throw' => true,
                ]]);
            }
        }

        return $this;
    }

    public function forFile(File $file): self
    {
        $provider = $file->storage_provider;
        $configId = null;

        if ($provider && str_starts_with($provider, 's3:')) {
            $parts = explode(':', $provider);
            $configId = $parts[1] ?? null;
        }

        return $this->forUser($file->user, $configId);
    }

    public function getProvider(): StorageProviderInterface
    {
        if ($this->useCustomS3) {
            return app(S3StorageService::class);
        }

        return app(UploadThingService::class);
    }

    public function getProviderByName(string $name): StorageProviderInterface
    {
        if (str_starts_with($name, 's3:')) {
            $parts = explode(':', $name);
            if (count($parts) > 1 && $this->user !== null) {
                // Inicializa o disco dinamicamente
                $this->forUser($this->user, $parts[1]);
                return app(S3StorageService::class);
            }
        }

        return app(UploadThingService::class);
    }

    public function getCurrentProviderName(): string
    {
        return $this->providerName;
    }
}
