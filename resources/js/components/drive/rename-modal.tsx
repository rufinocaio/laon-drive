import { router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';

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
import type { DriveFile } from '@/types';

interface RenameModalProps {
    file: DriveFile | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RenameModal({ file, open, onOpenChange }: RenameModalProps) {
    const [name, setName] = useState('');
    const [isRenaming, setIsRenaming] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (file) {
            setName(file.name);
            setError('');
        }
    }, [file]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !name.trim()) {
            setError('O nome é obrigatório.');
            return;
        }

        setIsRenaming(true);
        setError('');

        router.put(
            `/drive/${file.id}/rename`,
            { name: name.trim() },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsRenaming(false);
                    onOpenChange(false);
                },
                onError: (errors) => {
                    setError(errors.name || 'Erro ao renomear.');
                    setIsRenaming(false);
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/15 to-orange-500/15">
                            <Pencil className="size-4 text-amber-500" />
                        </div>
                        Renomear
                    </DialogTitle>
                    <DialogDescription>
                        Escolha um novo nome para &ldquo;{file?.name}&rdquo;.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="rename-input">Novo nome</Label>
                        <Input
                            id="rename-input"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError('');
                            }}
                            autoFocus
                            disabled={isRenaming}
                        />
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isRenaming}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={!name.trim() || isRenaming}
                            className="bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:brightness-110"
                        >
                            {isRenaming ? 'Renomeando...' : 'Renomear'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
