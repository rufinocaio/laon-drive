import { router } from '@inertiajs/react';
import { CloudUpload, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface UploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    parentId: string | null;
    storageConfigId?: number | null;
}

interface FileWithPreview {
    file: File;
    id: string;
    preview?: string;
}

export function UploadModal({ open, onOpenChange, parentId, storageConfigId }: UploadModalProps) {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const addFiles = useCallback((newFiles: FileList | File[]) => {
        const fileArray = Array.from(newFiles).map((file) => ({
            file,
            id: Math.random().toString(36).slice(2) + Date.now().toString(36),
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        }));
        setFiles((prev) => [...prev, ...fileArray]);
    }, []);

    const removeFile = (id: string) => {
        setFiles((prev) => {
            const file = prev.find((f) => f.id === id);
            if (file?.preview) URL.revokeObjectURL(file.preview);
            return prev.filter((f) => f.id !== id);
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) {
            addFiles(e.dataTransfer.files);
        }
    };

    const handleSubmit = () => {
        if (files.length === 0) return;
        setIsUploading(true);

        const formData = new FormData();
        files.forEach((f) => formData.append('files[]', f.file));
        if (parentId) formData.append('parent_id', parentId);
        if (storageConfigId) formData.append('storage_config_id', storageConfigId.toString());

        router.post('/drive/upload', formData, {
            forceFormData: true,
            onProgress: (event) => {
                if (event?.percentage) setProgress(event.percentage);
            },
            onSuccess: () => {
                setFiles([]);
                setProgress(0);
                setIsUploading(false);
                onOpenChange(false);
            },
            onError: () => {
                setIsUploading(false);
                setProgress(0);
            },
        });
    };

    const handleClose = (value: boolean) => {
        if (isUploading) return;
        if (!value) {
            files.forEach((f) => {
                if (f.preview) URL.revokeObjectURL(f.preview);
            });
            setFiles([]);
            setProgress(0);
        }
        onOpenChange(value);
    };

    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        const mb = kb / 1024;
        return `${mb.toFixed(1)} MB`;
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Enviar arquivos</DialogTitle>
                    <DialogDescription>
                        Arraste e solte ou selecione os arquivos que deseja enviar.
                    </DialogDescription>
                </DialogHeader>

                {/* Drop zone */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={cn(
                        'relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 transition-all duration-300',
                        isDragging
                            ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10'
                            : 'border-muted-foreground/25 hover:border-blue-500/50 hover:bg-blue-500/5',
                    )}
                >
                    <div
                        className={cn(
                            'mb-3 flex size-12 items-center justify-center rounded-xl transition-all duration-300',
                            isDragging
                                ? 'scale-110 bg-blue-500/20'
                                : 'bg-muted',
                        )}
                    >
                        <CloudUpload
                            className={cn(
                                'size-6 transition-all duration-300',
                                isDragging ? '-translate-y-1 text-blue-500' : 'text-muted-foreground',
                            )}
                        />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                        {isDragging ? 'Solte aqui!' : 'Clique ou arraste arquivos'}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Máximo 100MB por arquivo</p>
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files) addFiles(e.target.files);
                            e.target.value = '';
                        }}
                    />
                </div>

                {/* File list */}
                {files.length > 0 && (
                    <div className="max-h-48 space-y-2 overflow-y-auto">
                        {files.map((f) => (
                            <div
                                key={f.id}
                                className="flex items-center gap-3 rounded-lg border border-sidebar-border/70 p-2 dark:border-sidebar-border"
                            >
                                {f.preview ? (
                                    <img src={f.preview} alt="" className="size-10 rounded-lg object-cover" />
                                ) : (
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                                        <CloudUpload className="size-5 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{f.file.name}</p>
                                    <p className="text-xs text-muted-foreground">{formatSize(f.file.size)}</p>
                                </div>
                                {!isUploading && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFile(f.id);
                                        }}
                                        className="flex size-7 items-center justify-center rounded-md hover:bg-destructive/10"
                                    >
                                        <X className="size-4 text-muted-foreground hover:text-destructive" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Progress bar */}
                {isUploading && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Enviando...</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleClose(false)} disabled={isUploading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={files.length === 0 || isUploading}
                        className="bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:brightness-110"
                    >
                        {isUploading ? 'Enviando...' : `Enviar ${files.length > 0 ? `(${files.length})` : ''}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
