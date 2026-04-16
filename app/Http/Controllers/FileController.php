<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateFolderRequest;
use App\Http\Requests\UploadFileRequest;
use App\Models\File;
use App\Services\StorageManagerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class FileController extends Controller
{
    public function __construct(
        private StorageManagerService $storageManagerService
    ) {}

    public function index(Request $request, ?string $folder = null)
    {
        $user = auth()->user();
        $currentFolder = null;

        $disk = $request->query('disk', 'default');
        $expectedProvider = $disk === 'default' ? 'uploadthing' : 's3:' . $disk;

        if ($folder) {
            $currentFolder = File::where('id', $folder)
                ->where('user_id', $user->id)
                ->where('is_folder', true)
                ->firstOrFail();
        }

        $files = File::where('user_id', $user->id)
            ->where('parent_id', $folder)
            ->where('storage_provider', $expectedProvider)
            ->orderByDesc('is_folder')
            ->orderBy('name')
            ->get();

        if ($disk !== 'default') {
            $this->storageManagerService->forUser($user, (string) $disk);

            $files->transform(function (File $file) {
                if ($file->is_folder || empty($file->file_key)) {
                    return $file;
                }

                try {
                    // Usa URL assinada de curta duração para previews de buckets privados.
                    $file->url = Storage::disk('custom_s3')->temporaryUrl(
                        $file->file_key,
                        now()->addMinutes(15)
                    );
                } catch (\Throwable $e) {
                    Log::warning('[S3 DEBUG] Failed to generate temporary preview URL', [
                        'file_id' => $file->id,
                        'file_key' => $file->file_key,
                        'message' => $e->getMessage(),
                    ]);
                }

                return $file;
            });
        }

        $breadcrumbs = $this->buildBreadcrumbs($currentFolder);

        $storageUsed = File::where('user_id', $user->id)
            ->where('storage_provider', $expectedProvider)
            ->whereNotNull('size')
            ->sum('size');

        $storageConfigs = $user->storageConfigs()->select(['id', 'name'])->get();

        return Inertia::render('drive/index', [
            'files' => $files,
            'currentFolder' => $currentFolder,
            'breadcrumbs' => $breadcrumbs,
            'storageUsed' => $storageUsed,
            'storageFormatted' => $this->formatBytes($storageUsed),
            'storageConfigs' => $storageConfigs,
            'currentDisk' => $disk,
        ]);
    }

    public function upload(UploadFileRequest $request)
    {
        $user = auth()->user();
        $parentId = $request->input('parent_id');
        $uploadedFiles = $request->file('files');
        $successCount = 0;

        $storageManager = $this->storageManagerService->forUser($user, $request->input('storage_config_id'));
        $provider = $storageManager->getProvider();

        foreach ($uploadedFiles as $file) {
            $result = $provider->uploadFile($file);

            if ($result) {
                File::create([
                    'user_id' => $user->id,
                    'parent_id' => $parentId,
                    'name' => $file->getClientOriginalName(),
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'file_key' => $result['key'],
                    'url' => $result['url'],
                    'is_folder' => false,
                    'storage_provider' => $storageManager->getCurrentProviderName(),
                ]);
                $successCount++;
            }
        }

        $total = count($uploadedFiles);

        if ($successCount === $total) {
            return back()->with('success', "{$successCount} arquivo(s) enviado(s) com sucesso!");
        }

        if ($successCount > 0) {
            return back()->with('warning', "{$successCount} de {$total} arquivo(s) enviado(s). Alguns falharam.");
        }

        return back()->withErrors(['files' => 'Falha ao enviar os arquivos. Tente novamente.']);
    }

    public function createFolder(CreateFolderRequest $request)
    {
        $user = auth()->user();
        $disk = $request->input('storage_config_id', 'default');
        $provider = $disk === 'default' ? 'uploadthing' : 's3:' . $disk;

        File::create([
            'user_id' => $user->id,
            'parent_id' => $request->input('parent_id'),
            'name' => $request->input('name'),
            'is_folder' => true,
            'storage_provider' => $provider,
        ]);

        return back()->with('success', 'Pasta criada com sucesso!');
    }

    public function rename(Request $request, File $file)
    {
        if ($file->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $file->update(['name' => $request->input('name')]);

        return back()->with('success', 'Renomeado com sucesso!');
    }

    public function destroy(File $file)
    {
        if ($file->user_id !== auth()->id()) {
            abort(403);
        }

        // Garante que o StorageManager tenha o contexto do usuário antes de resolver provedores.
        $this->storageManagerService->forUser(auth()->user());

        $keysByProvider = $file->getKeysByProvider();

        foreach ($keysByProvider as $provider => $fileKeys) {
            if (!empty($fileKeys)) {
                $this->storageManagerService->getProviderByName($provider)->deleteFiles($fileKeys);
            }
        }

        $file->delete();

        return back()->with('success', 'Excluído com sucesso!');
    }

    private function buildBreadcrumbs(?File $folder): array
    {
        $breadcrumbs = [
            ['id' => null, 'name' => 'Drive'],
        ];

        if (! $folder) {
            return $breadcrumbs;
        }

        $trail = [];
        $current = $folder;

        while ($current) {
            $trail[] = ['id' => $current->id, 'name' => $current->name];
            $current = $current->parent;
        }

        return array_merge($breadcrumbs, array_reverse($trail));
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = 0;
        $value = $bytes;

        while ($value >= 1024 && $i < count($units) - 1) {
            $value /= 1024;
            $i++;
        }

        return round($value, 2) . ' ' . $units[$i];
    }
}
