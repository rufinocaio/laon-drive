<?php

namespace App\Services;

use App\Contracts\StorageProviderInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UploadThingService implements StorageProviderInterface
{
    private string $token;

    private string $apiKey;

    private string $appId;

    private string $apiUrl;

    public function __construct()
    {
        $this->token = config('uploadthing.token');
        $this->apiUrl = config('uploadthing.api_url');

        $this->parseToken();
    }

    /**
     * Decodifica o token base64 para extrair apiKey e appId.
     */
    private function parseToken(): void
    {
        try {
            $decoded = json_decode(base64_decode($this->token), true);

            if ($decoded && isset($decoded['apiKey'])) {
                $this->apiKey = $decoded['apiKey'];
                $this->appId = $decoded['appId'] ?? '';
                Log::info('[UT DEBUG] Token parsed OK', [
                    'appId' => $this->appId,
                    'apiKeyPrefix' => substr($this->apiKey, 0, 12) . '...',
                ]);
            } else {
                $this->apiKey = $this->token;
                $this->appId = '';
                Log::warning('[UT DEBUG] Token is NOT base64 JSON, using raw value', [
                    'tokenPrefix' => substr($this->token, 0, 20) . '...',
                ]);
            }
        } catch (\Exception $e) {
            $this->apiKey = $this->token;
            $this->appId = '';
            Log::warning('[UT DEBUG] Token parse exception', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Faz upload de um arquivo para o UploadThing usando o fluxo prepareUpload v7.
     *
     * @return array{key: string, url: string, name: string, size: int}|null
     */
    public function uploadFile(UploadedFile $file): ?array
    {
        try {
            Log::info('[UT DEBUG] 1. Upload started', [
                'fileName' => $file->getClientOriginalName(),
                'fileSize' => $file->getSize(),
                'mimeType' => $file->getMimeType(),
                'realPath' => $file->getRealPath(),
            ]);

            $payload = [
                'fileName' => $file->getClientOriginalName(),
                'fileSize' => $file->getSize(),
                'fileType' => $file->getMimeType(),
                'contentDisposition' => 'inline',
                'acl' => 'public-read',
                'expiresIn' => 3600,
            ];

            Log::info('[UT DEBUG] 2. Chamando endpoint prepareUpload', [
                'url' => "{$this->apiUrl}/v7/prepareUpload",
                'apiKeyPrefix' => substr($this->apiKey, 0, 12) . '...',
                'payload' => $payload,
            ]);

            $response = Http::withHeaders([
                'x-uploadthing-api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->apiUrl}/v7/prepareUpload", $payload);

            Log::info('[UT DEBUG] 3. Resposta do prepareUpload', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            if (! $response->successful()) {
                Log::error('[UT DEBUG] prepareUpload FALHOU', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return null;
            }

            $data = $response->json();
            $fileKey = $data['key'] ?? null;
            $presignedUrl = $data['url'] ?? null;

            Log::info('[UT DEBUG] 4. Dados do prepareUpload', [
                'fileKey' => $fileKey,
                'presignedUrl' => $presignedUrl ? substr($presignedUrl, 0, 80) . '...' : null,
            ]);

            if (! $fileKey || ! $presignedUrl) {
                Log::error('[UT DEBUG] Faltando key ou url na resposta do prepareUpload', [
                    'response' => $data,
                ]);

                return null;
            }

            $fileContents = file_get_contents($file->getRealPath());
            $fileContentLength = strlen($fileContents);

            Log::info('[UT DEBUG] 5. Iniciando upload PUT', [
                'presignedUrl' => substr($presignedUrl, 0, 80) . '...',
                'contentType' => $file->getMimeType(),
                'contentLength' => $fileContentLength,
            ]);

            // Faz upload via multipart/form-data conforme documentação do UploadThing
            $uploadResponse = Http::send('PUT', $presignedUrl, [
                'multipart' => [
                    [
                        'name' => 'file',
                        'contents' => $fileContents,
                        'filename' => $file->getClientOriginalName(),
                    ],
                ],
            ]);

            Log::info('[UT DEBUG] 6. PUT response', [
                'status' => $uploadResponse->status(),
                'body' => substr($uploadResponse->body(), 0, 500),
            ]);

            if (! $uploadResponse->successful() && $uploadResponse->status() !== 204) {
                Log::error('[UT DEBUG] PUT upload FAILED', [
                    'status' => $uploadResponse->status(),
                    'body' => $uploadResponse->body(),
                ]);

                return null;
            }

            $fileUrl = "https://utfs.io/f/{$fileKey}";

            Log::info('[UT DEBUG] 7. Upload SUCCESS', [
                'key' => $fileKey,
                'url' => $fileUrl,
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
            ]);

            return [
                'key' => $fileKey,
                'url' => $fileUrl,
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
            ];
        } catch (\Exception $e) {
            Log::error('[UT DEBUG] EXCEPTION during upload', [
                'message' => $e->getMessage(),
                'file' => $e->getFile() . ':' . $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return null;
        }
    }

    /**
     * Exclui um arquivo do UploadThing usando sua file key.
     */
    public function deleteFile(string $fileKey): bool
    {
        return $this->deleteFiles([$fileKey]);
    }

    /**
     * Exclui múltiplos arquivos do UploadThing por suas file keys.
     */
    public function deleteFiles(array $fileKeys): bool
    {
        if (empty($fileKeys)) {
            return true;
        }

        try {
            Log::info('[UT DEBUG] Delete request', ['fileKeys' => $fileKeys]);

            $response = Http::withHeaders([
                'x-uploadthing-api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->apiUrl}/v6/deleteFiles", [
                'fileKeys' => $fileKeys,
            ]);

            Log::info('[UT DEBUG] Delete response', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            if (! $response->successful()) {
                Log::error('[UT DEBUG] Delete FAILED', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'fileKeys' => $fileKeys,
                ]);

                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('[UT DEBUG] Delete EXCEPTION', [
                'message' => $e->getMessage(),
                'fileKeys' => $fileKeys,
            ]);

            return false;
        }
    }
}
