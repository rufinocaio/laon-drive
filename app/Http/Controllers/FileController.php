<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateFolderRequest;
use App\Http\Requests\UploadFileRequest;
use App\Models\File;
use App\Services\UploadThingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FileController extends Controller
{
    public function __construct(
        private UploadThingService $uploadThingService
    ) {}

    public function index(?string $folder = null)
    {
        $user = auth()->user();
        $currentFolder = null;

        if ($folder) {
            $currentFolder = File::where('id', $folder)
                ->where('user_id', $user->id)
                ->where('is_folder', true)
                ->firstOrFail();
        }

        $files = File::where('user_id', $user->id)
            ->where('parent_id', $folder)
            ->orderByDesc('is_folder')
            ->orderBy('name')
            ->get();

        $breadcrumbs = $this->buildBreadcrumbs($currentFolder);

        $storageUsed = File::where('user_id', $user->id)
            ->whereNotNull('size')
            ->sum('size');

        return Inertia::render('drive/index', [
            'files' => $files,
            'currentFolder' => $currentFolder,
            'breadcrumbs' => $breadcrumbs,
            'storageUsed' => $storageUsed,
            'storageFormatted' => $this->formatBytes($storageUsed),
        ]);
    }

    public function upload(UploadFileRequest $request)
    {
        $user = auth()->user();
        $parentId = $request->input('parent_id');
        $uploadedFiles = $request->file('files');
        $successCount = 0;

        foreach ($uploadedFiles as $file) {
            $result = $this->uploadThingService->uploadFile($file);

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

        File::create([
            'user_id' => $user->id,
            'parent_id' => $request->input('parent_id'),
            'name' => $request->input('name'),
            'is_folder' => true,
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

        $fileKeys = $file->getAllFileKeys();

        // Deleta na api UploadThing
        if (!empty($fileKeys)) {
            $this->uploadThingService->deleteFiles($fileKeys);
        }

        // Deleta no banco de dados
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
