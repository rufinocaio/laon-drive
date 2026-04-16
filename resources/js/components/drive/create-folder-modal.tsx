import { router } from '@inertiajs/react';
import { FolderPlus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateFolderModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    parentId: string | null;
    storageConfigId?: number | null;
}

export function CreateFolderModal({ open, onOpenChange, parentId, storageConfigId }: CreateFolderModalProps) {
    const [name, setName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('O nome da pasta é obrigatório.');
            return;
        }

        setIsCreating(true);
        setError('');

        router.post(
            '/drive/folder',
            {
                name: name.trim(),
                parent_id: parentId,
                storage_config_id: storageConfigId,
            },
            {
                onSuccess: () => {
                    setName('');
                    setIsCreating(false);
                    onOpenChange(false);
                },
                onError: (errors) => {
                    setError(errors.name || 'Erro ao criar a pasta.');
                    setIsCreating(false);
                },
            },
        );
    };

    const handleClose = (value: boolean) => {
        if (isCreating) return;
        if (!value) {
            setName('');
            setError('');
        }
        onOpenChange(value);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/15 to-blue-600/15">
                            <FolderPlus className="size-4 text-blue-500" />
                        </div>
                        Nova pasta
                    </DialogTitle>
                    <DialogDescription>Dê um nome para a sua nova pasta.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="folder-name">Nome da pasta</Label>
                        <Input
                            id="folder-name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError('');
                            }}
                            placeholder="Minha pasta"
                            autoFocus
                            disabled={isCreating}
                        />
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={isCreating}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={!name.trim() || isCreating}
                            className="bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:brightness-110"
                        >
                            {isCreating ? 'Criando...' : 'Criar pasta'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
