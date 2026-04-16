import { Head, Link, router } from '@inertiajs/react';
import { CloudUpload, FolderPlus, Grid3X3, List, ChevronRight } from 'lucide-react';
import { useCallback, useState } from 'react';

import { CreateFolderModal } from '@/components/drive/create-folder-modal';
import { EmptyState } from '@/components/drive/empty-state';
import { FileCard } from '@/components/drive/file-card';
import { FilePreviewModal } from '@/components/drive/file-preview-modal';
import { RenameModal } from '@/components/drive/rename-modal';
import { StorageIndicator } from '@/components/drive/storage-indicator';
import { UploadModal } from '@/components/drive/upload-modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DriveFile, DrivePageProps } from '@/types';

export default function Drive({ files, currentFolder, breadcrumbs, storageUsed, storageFormatted }: DrivePageProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [uploadOpen, setUploadOpen] = useState(false);
    const [folderOpen, setFolderOpen] = useState(false);
    const [renameFile, setRenameFile] = useState<DriveFile | null>(null);
    const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
    const [isDraggingPage, setIsDraggingPage] = useState(false);

    const parentId = currentFolder?.id ?? null;

    const handlePageDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingPage(true);
    }, []);

    const handlePageDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (e.currentTarget === e.target) {
            setIsDraggingPage(false);
        }
    }, []);

    const handlePageDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDraggingPage(false);
            if (e.dataTransfer.files.length > 0) {
                const formData = new FormData();
                Array.from(e.dataTransfer.files).forEach((file) => formData.append('files[]', file));
                if (parentId) formData.append('parent_id', parentId);

                router.post('/drive/upload', formData, { forceFormData: true });
            }
        },
        [parentId],
    );

    return (
        <>
            <Head title={currentFolder ? currentFolder.name : 'Drive'} />

            <div
                className="relative flex h-full flex-1 flex-col overflow-hidden"
                onDragOver={handlePageDragOver}
                onDragLeave={handlePageDragLeave}
                onDrop={handlePageDrop}
            >
                {/* Full-page drag overlay */}
                {isDraggingPage && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-blue-500 bg-blue-500/5 p-12">
                            <div className="flex size-16 items-center justify-center rounded-2xl bg-blue-500/15">
                                <CloudUpload className="size-8 text-blue-500 animate-bounce" />
                            </div>
                            <p className="text-lg font-semibold text-blue-500">Solte os arquivos aqui</p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-sidebar-border/70 px-6 py-4 dark:border-sidebar-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {currentFolder ? currentFolder.name : 'Meus Arquivos'}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {files.length} {files.length === 1 ? 'item' : 'itens'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* View toggle */}
                            <div className="flex rounded-lg border border-sidebar-border/70 p-0.5 dark:border-sidebar-border">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={cn(
                                        'flex size-8 items-center justify-center rounded-md transition-all duration-200',
                                        viewMode === 'grid'
                                            ? 'bg-accent text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    <Grid3X3 className="size-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={cn(
                                        'flex size-8 items-center justify-center rounded-md transition-all duration-200',
                                        viewMode === 'list'
                                            ? 'bg-accent text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    <List className="size-4" />
                                </button>
                            </div>

                            <Button variant="outline" size="sm" onClick={() => setFolderOpen(true)}>
                                <FolderPlus className="size-4" />
                                <span className="hidden sm:inline">Nova Pasta</span>
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setUploadOpen(true)}
                                className="bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:brightness-110"
                            >
                                <CloudUpload className="size-4" />
                                <span className="hidden sm:inline">Upload</span>
                            </Button>
                        </div>
                    </div>

                    {/* Breadcrumbs */}
                    {breadcrumbs.length > 1 && (
                        <nav className="flex items-center gap-1 text-sm">
                            {breadcrumbs.map((crumb, i) => (
                                <span key={crumb.id ?? 'root'} className="flex items-center gap-1">
                                    {i > 0 && <ChevronRight className="size-3.5 text-muted-foreground" />}
                                    {i === breadcrumbs.length - 1 ? (
                                        <span className="font-medium text-foreground">{crumb.name}</span>
                                    ) : (
                                        <Link
                                            href={crumb.id ? `/drive/${crumb.id}` : '/drive'}
                                            className="text-muted-foreground transition-colors hover:text-blue-500"
                                        >
                                            {crumb.name}
                                        </Link>
                                    )}
                                </span>
                            ))}
                        </nav>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
                    {files.length === 0 ? (
                        <EmptyState onUpload={() => setUploadOpen(true)} />
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {files.map((file) => (
                                <FileCard
                                    key={file.id}
                                    file={file}
                                    viewMode="grid"
                                    onRename={setRenameFile}
                                    onPreview={setPreviewFile}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {/* List header */}
                            <div className="flex items-center gap-4 px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                <div className="size-10" />
                                <div className="flex-1">Nome</div>
                                <div className="hidden w-20 sm:block">Tamanho</div>
                                <div className="hidden w-24 md:block">Data</div>
                                <div className="w-8" />
                            </div>
                            {files.map((file) => (
                                <FileCard
                                    key={file.id}
                                    file={file}
                                    viewMode="list"
                                    onRename={setRenameFile}
                                    onPreview={setPreviewFile}
                                />
                            ))}
                        </div>
                    )}

                    {/* Storage indicator */}
                    <div className="mt-auto pt-4">
                        <StorageIndicator used={storageUsed} formatted={storageFormatted} />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} parentId={parentId} />
            <CreateFolderModal open={folderOpen} onOpenChange={setFolderOpen} parentId={parentId} />
            <RenameModal file={renameFile} open={!!renameFile} onOpenChange={(v) => !v && setRenameFile(null)} />
            <FilePreviewModal file={previewFile} open={!!previewFile} onOpenChange={(v) => !v && setPreviewFile(null)} />
        </>
    );
}

Drive.layout = {
    breadcrumbs: [
        {
            title: 'Drive',
            href: '/drive',
        },
    ],
};
