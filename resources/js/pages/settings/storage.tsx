import { Head, useForm, router } from '@inertiajs/react';
import { SubmitEventHandler, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cloud, Plus, Trash2, Edit } from 'lucide-react';
import { index as storageIndex, store as storageStore, update as storageUpdate, destroy as storageDestroy } from '@/routes/storage';

interface StorageConfig {
    id: number;
    name: string;
    s3_bucket: string;
    s3_region: string;
    s3_endpoint: string;
    s3_key: string;
    s3_secret: string;
    created_at: string;
}

export default function Storage({
    storageConfigs,
}: {
    storageConfigs: StorageConfig[];
}) {
    const [editingConfig, setEditingConfig] = useState<StorageConfig | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data, setData, post, put, processing, errors, reset, recentlySuccessful } = useForm({
        name: '',
        s3_bucket: '',
        s3_region: '',
        s3_endpoint: '',
        s3_key: '',
        s3_secret: '',
    });

    const openCreateForm = () => {
        reset();
        setEditingConfig(null);
        setIsFormOpen(true);
    };

    const openEditForm = (config: StorageConfig) => {
        setData({
            name: config.name || '',
            s3_bucket: config.s3_bucket || '',
            s3_region: config.s3_region || '',
            s3_endpoint: config.s3_endpoint || '',
            s3_key: config.s3_key || '',
            s3_secret: config.s3_secret || '',
        });
        setEditingConfig(config);
        setIsFormOpen(true);
    };

    const submit: SubmitEventHandler = (e) => {
        e.preventDefault();
        
        if (editingConfig) {
            put(storageUpdate({ storage: editingConfig.id }).url, {
                preserveScroll: true,
                onSuccess: () => setIsFormOpen(false),
            });
        } else {
            post(storageStore().url, {
                preserveScroll: true,
                onSuccess: () => setIsFormOpen(false),
            });
        }
    };

    const removeConfig = (id: number) => {
        if(confirm('Tem certeza? Os arquivos vinculados não poderão ser deletados da nuvem futuramente caso o bucket não exista mais.')) {
            router.delete(storageDestroy({ storage: id }).url, {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="Configurações de armazenamento" />

            <h1 className="sr-only">Configurações de armazenamento</h1>

            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <Heading
                        variant="small"
                        title="Configurações de armazenamento"
                        description="Gerencie seus provedores de armazenamento customizados (S3, DigitalOcean, etc)."
                    />
                    {!isFormOpen && (
                        <Button onClick={openCreateForm} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Bucket
                        </Button>
                    )}
                </div>

                {!isFormOpen && storageConfigs.length > 0 && (
                    <div className="grid gap-4 mt-6">
                        {storageConfigs.map((config) => (
                            <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 border rounded-md bg-muted">
                                        <Cloud className="w-6 h-6 text-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{config.name}</h3>
                                        <p className="text-sm text-muted-foreground">{config.s3_bucket} ({config.s3_region})</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" onClick={() => openEditForm(config)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="destructive" size="icon" onClick={() => removeConfig(config.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {!isFormOpen && storageConfigs.length === 0 && (
                    <div className="text-center py-10 border rounded-lg border-dashed">
                        <Cloud className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold">Nenhum Bucket</h3>
                        <p className="text-muted-foreground text-sm mt-1">Você está usando o provedor padrão no momento.</p>
                        <Button onClick={openCreateForm} size="sm" variant="outline" className="mt-4">Registrar Bucket</Button>
                    </div>
                )}

                {isFormOpen && (
                    <form onSubmit={submit} className="space-y-4 rounded-lg border p-6 bg-card shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg font-heading">{editingConfig ? 'Editar' : 'Nova'} Configuração</h3>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome (Ex: Meu S3, Backup R2)</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <InputError message={errors.name} />}
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="s3_bucket">Bucket Name</Label>
                            <Input
                                id="s3_bucket"
                                value={data.s3_bucket}
                                onChange={(e) => setData('s3_bucket', e.target.value)}
                                required
                            />
                            {errors.s3_bucket && <InputError message={errors.s3_bucket} />}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="s3_region">Region (e.g., us-east-1)</Label>
                            <Input
                                id="s3_region"
                                value={data.s3_region}
                                onChange={(e) => setData('s3_region', e.target.value)}
                                required
                            />
                            {errors.s3_region && <InputError message={errors.s3_region} />}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="s3_endpoint">Custom Endpoint URL (Opcional)</Label>
                            <Input
                                id="s3_endpoint"
                                type="url"
                                placeholder="https://nyc3.digitaloceanspaces.com"
                                value={data.s3_endpoint}
                                onChange={(e) => setData('s3_endpoint', e.target.value)}
                            />
                            {errors.s3_endpoint && <InputError message={errors.s3_endpoint} />}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="s3_key">Access Key</Label>
                            <Input
                                id="s3_key"
                                value={data.s3_key}
                                onChange={(e) => setData('s3_key', e.target.value)}
                                required={!editingConfig || !editingConfig.s3_key}
                                placeholder={editingConfig?.s3_key ? 'Manter original' : ''}
                            />
                            {errors.s3_key && <InputError message={errors.s3_key} />}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="s3_secret">Secret Key</Label>
                            <Input
                                id="s3_secret"
                                type="password"
                                value={data.s3_secret}
                                onChange={(e) => setData('s3_secret', e.target.value)}
                                required={!editingConfig || !editingConfig.s3_secret}
                                placeholder={editingConfig?.s3_secret ? 'Manter original' : ''}
                            />
                            {errors.s3_secret && <InputError message={errors.s3_secret} />}
                        </div>

                        <div className="flex items-center gap-4 mt-6">
                            <Button disabled={processing}>Salvar Bucket</Button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}

Storage.layout = {
    breadcrumbs: [
        {
            title: 'Storage settings',
            href: storageIndex(),
        },
    ],
};
