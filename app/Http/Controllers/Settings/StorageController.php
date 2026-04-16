<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\StorageConfig;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StorageController extends Controller
{
    public function index(Request $request)
    {
        $configs = $request->user()->storageConfigs()->get()->map(function ($config) {
            return [
                'id' => $config->id,
                'name' => $config->name,
                's3_bucket' => $config->s3_bucket,
                's3_region' => $config->s3_region,
                's3_key' => $config->s3_key ? decrypt($config->s3_key) : '',
                's3_secret' => $config->s3_secret ? decrypt($config->s3_secret) : '',
                's3_endpoint' => $config->s3_endpoint,
                'created_at' => $config->created_at,
            ];
        });

        return Inertia::render('settings/storage', [
            'storageConfigs' => $configs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            's3_bucket' => ['required', 'string', 'max:255'],
            's3_region' => ['required', 'string', 'max:255'],
            's3_key' => ['required', 'string', 'max:255'],
            's3_secret' => ['required', 'string', 'max:255'],
            's3_endpoint' => ['nullable', 'string', 'max:255', 'url'],
        ]);

        $config = new StorageConfig();
        $config->user_id = $request->user()->id;
        $config->name = $validated['name'];
        $config->s3_bucket = $validated['s3_bucket'];
        $config->s3_region = $validated['s3_region'];
        $config->s3_endpoint = $validated['s3_endpoint'];
        $config->s3_key = encrypt($validated['s3_key']);
        $config->s3_secret = encrypt($validated['s3_secret']);
        $config->save();

        return back()->with('success', 'Configuração de bucket S3 adicionada com sucesso.');
    }

    public function update(Request $request, StorageConfig $storage)
    {
        if ($storage->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            's3_bucket' => ['required', 'string', 'max:255'],
            's3_region' => ['required', 'string', 'max:255'],
            's3_key' => ['nullable', 'string', 'max:255'],
            's3_secret' => ['nullable', 'string', 'max:255'],
            's3_endpoint' => ['nullable', 'string', 'max:255', 'url'],
        ]);

        $storage->name = $validated['name'];
        $storage->s3_bucket = $validated['s3_bucket'];
        $storage->s3_region = $validated['s3_region'];
        $storage->s3_endpoint = $validated['s3_endpoint'];

        if (!empty($validated['s3_key'])) {
            $storage->s3_key = encrypt($validated['s3_key']);
        }
        if (!empty($validated['s3_secret'])) {
            $storage->s3_secret = encrypt($validated['s3_secret']);
        }

        $storage->save();

        return back()->with('success', 'Configuração de storage atualizada com sucesso.');
    }

    public function destroy(Request $request, StorageConfig $storage)
    {
        if ($storage->user_id !== $request->user()->id) {
            abort(403);
        }

        $storage->delete();

        return back()->with('success', 'Configuração removida com sucesso.');
    }
}
