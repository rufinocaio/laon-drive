import { Link, router } from '@inertiajs/react';
import {
    Download,
    EllipsisVertical,
    File,
    FileArchive,
    FileAudio,
    FileCode,
    FileImage,
    FileSpreadsheet,
    FileText,
    FileVideo,
    Folder,
    Pencil,
    Trash2,
    Share2,
    Copy,
    Link as LinkIcon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import type { DriveFile } from '@/types';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FileCardProps {
    file: DriveFile;
    onRename: (file: DriveFile) => void;
    onPreview: (file: DriveFile) => void;
    viewMode: 'grid' | 'list';
    currentDisk?: string;
}

const mimeIconMap: Record<string, { icon: typeof File; color: string; bg: string }> = {
    folder: { icon: Folder, color: 'text-blue-500', bg: 'from-blue-500/15 to-blue-600/15' },
    'image/': { icon: FileImage, color: 'text-emerald-500', bg: 'from-emerald-500/15 to-green-600/15' },
    'video/': { icon: FileVideo, color: 'text-purple-500', bg: 'from-purple-500/15 to-purple-600/15' },
    'audio/': { icon: FileAudio, color: 'text-pink-500', bg: 'from-pink-500/15 to-pink-600/15' },
    'application/pdf': { icon: FileText, color: 'text-red-500', bg: 'from-red-500/15 to-red-600/15' },
    'application/vnd.ms-excel': { icon: FileSpreadsheet, color: 'text-green-600', bg: 'from-green-500/15 to-green-600/15' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml': { icon: FileSpreadsheet, color: 'text-green-600', bg: 'from-green-500/15 to-green-600/15' },
    'text/csv': { icon: FileSpreadsheet, color: 'text-green-600', bg: 'from-green-500/15 to-green-600/15' },
    'application/msword': { icon: FileText, color: 'text-blue-600', bg: 'from-blue-500/15 to-blue-600/15' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml': { icon: FileText, color: 'text-blue-600', bg: 'from-blue-500/15 to-blue-600/15' },
    'text/': { icon: FileCode, color: 'text-gray-500', bg: 'from-gray-500/15 to-gray-600/15' },
    'application/zip': { icon: FileArchive, color: 'text-amber-500', bg: 'from-amber-500/15 to-amber-600/15' },
    'application/x-rar': { icon: FileArchive, color: 'text-amber-500', bg: 'from-amber-500/15 to-amber-600/15' },
    'application/gzip': { icon: FileArchive, color: 'text-amber-500', bg: 'from-amber-500/15 to-amber-600/15' },
};

function getFileIcon(file: DriveFile) {
    if (file.is_folder) return mimeIconMap['folder'];
    if (!file.mime_type) return { icon: File, color: 'text-gray-400', bg: 'from-gray-400/15 to-gray-500/15' };

    for (const [key, value] of Object.entries(mimeIconMap)) {
        if (key !== 'folder' && file.mime_type.startsWith(key)) {
            return value;
        }
    }

    return { icon: File, color: 'text-gray-400', bg: 'from-gray-400/15 to-gray-500/15' };
}

function isPreviewable(file: DriveFile): boolean {
    if (file.is_folder || !file.mime_type || !file.url) return false;
    return (
        file.mime_type.startsWith('image/') ||
        file.mime_type === 'application/pdf' ||
        file.mime_type.startsWith('video/')
    );
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function FileCard({ file, onRename, onPreview, viewMode, currentDisk = 'default' }: FileCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { icon: Icon, color, bg } = getFileIcon(file);
    const diskQuery = currentDisk !== 'default' ? `?disk=${encodeURIComponent(currentDisk)}` : '';
    const folderHref = `/drive/${file.id}${diskQuery}`;

    const handleDelete = () => {
        if (!confirm(`Tem certeza que deseja excluir "${file.name}"?`)) return;
        setIsDeleting(true);
        router.delete(`/drive/${file.id}`, {
            preserveScroll: true,
            onFinish: () => setIsDeleting(false),
        });
    };

    const handleDownload = () => {
        if (file.url) {
            window.open(file.url, '_blank');
        }
    };

    const handleShare = () => {
        const wasShared = file.is_shared;
        router.post(`/drive/${file.id}/share`, {}, {
            preserveScroll: true,
            onSuccess: (page) => {
                if (!wasShared) {
                    const updatedFiles = (page.props as any).files as DriveFile[];
                    const updatedFile = updatedFiles?.find((f) => f.id === file.id);
                    if (updatedFile?.share_url) {
                        navigator.clipboard.writeText(updatedFile.share_url);
                        toast.success('Link compartilhado e copiado com sucesso!');
                    }
                }
            },
        });
    };

    const copyShareLink = () => {
        if (file.share_url) {
            navigator.clipboard.writeText(file.share_url);
            toast.success('Link de compartilhamento copiado!');
        }
    };

    const isImage = file.mime_type?.startsWith('image/') && file.url;

    if (viewMode === 'list') {
        return (
            <div
                className={cn(
                    'group flex items-center gap-4 rounded-xl border border-transparent px-4 py-3 transition-all duration-200 hover:border-sidebar-border/70 hover:bg-accent/50',
                    isDeleting && 'pointer-events-none opacity-50',
                )}
            >
                {file.is_folder ? (
                    <Link
                        href={folderHref}
                        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-blue-600/15"
                    >
                        <Icon className={cn('size-5', color)} />
                    </Link>
                ) : (
                    <button
                        onClick={() => (isPreviewable(file) ? onPreview(file) : handleDownload())}
                        className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br', bg)}
                    >
                        <Icon className={cn('size-5', color)} />
                    </button>
                )}

                <div className="min-w-0 flex-1">
                    {file.is_folder ? (
                        <Link href={folderHref} className="block truncate text-sm font-medium text-foreground hover:text-blue-500">
                            {file.name}
                        </Link>
                    ) : (
                        <button
                            onClick={() => (isPreviewable(file) ? onPreview(file) : handleDownload())}
                            className="block truncate text-left text-sm font-medium text-foreground hover:text-blue-500"
                        >
                            {file.name}
                        </button>
                    )}
                    {file.is_shared && (
                        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-blue-500 font-medium">
                            <Share2 className="size-2.5" />
                            <span>Compartilhado</span>
                        </div>
                    )}
                </div>

                <span className="hidden text-xs text-muted-foreground sm:block">{file.formatted_size}</span>
                <span className="hidden text-xs text-muted-foreground md:block">{formatDate(file.created_at)}</span>

                <DropdownMenu>
                    <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-lg opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100">
                        <EllipsisVertical className="size-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onRename(file)}>
                            <Pencil className="size-4" />
                            Renomear
                        </DropdownMenuItem>
                        {!file.is_folder && file.url && (
                            <DropdownMenuItem onClick={handleDownload}>
                                <Download className="size-4" />
                                Download
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleShare}>
                            <Share2 className={cn("size-4", file.is_shared && "text-red-500")} />
                            {file.is_shared ? 'Desativar link' : 'Compartilhar'}
                        </DropdownMenuItem>
                        {file.is_shared && (
                            <DropdownMenuItem onClick={copyShareLink}>
                                <Copy className="size-4" />
                                Copiar link
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                            <Trash2 className="size-4" />
                            Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    }

    // Grid view
    return (
        <div
            className={cn(
                'group relative flex flex-col overflow-hidden rounded-2xl border border-sidebar-border/70 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 dark:border-sidebar-border dark:hover:border-blue-500/30',
                isDeleting && 'pointer-events-none opacity-50',
            )}
        >
            {/* Thumbnail / Icon area */}
            {file.is_folder ? (
                <Link href={folderHref} className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-blue-500/5 to-violet-500/5 transition-colors duration-300 group-hover:from-blue-500/10 group-hover:to-violet-500/10">
                    <Icon className={cn('size-12 transition-transform duration-300 group-hover:scale-110', color)} />
                </Link>
            ) : isImage ? (
                <button
                    onClick={() => onPreview(file)}
                    className="relative aspect-[4/3] overflow-hidden bg-muted"
                >
                    <img
                        src={file.url!}
                        alt={file.name}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </button>
            ) : (
                <button
                    onClick={() => (isPreviewable(file) ? onPreview(file) : handleDownload())}
                    className={cn('flex aspect-[4/3] items-center justify-center bg-gradient-to-br transition-colors duration-300', bg, 'group-hover:opacity-80')}
                >
                    <Icon className={cn('size-12 transition-transform duration-300 group-hover:scale-110', color)} />
                </button>
            )}

            {/* File info */}
            <div className="flex items-center gap-2 p-3">
                <div className="min-w-0 flex-1">
                    {file.is_folder ? (
                        <Link href={folderHref} className="block truncate text-sm font-medium text-foreground transition-colors hover:text-blue-500">
                            {file.name}
                        </Link>
                    ) : (
                        <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {file.is_folder ? 'Pasta' : file.formatted_size}
                        </p>
                        {file.is_shared && (
                            <span className="flex items-center gap-0.5 rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-500 uppercase tracking-tighter shadow-sm whitespace-nowrap">
                                <Share2 className="size-2" strokeWidth={3} />
                                Público
                            </span>
                        )}
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger className="flex size-8 shrink-0 items-center justify-center rounded-lg opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100">
                        <EllipsisVertical className="size-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onRename(file)}>
                            <Pencil className="size-4" />
                            Renomear
                        </DropdownMenuItem>
                        {!file.is_folder && file.url && (
                            <DropdownMenuItem onClick={handleDownload}>
                                <Download className="size-4" />
                                Download
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleShare}>
                            <Share2 className={cn("size-4", file.is_shared && "text-red-500")} />
                            {file.is_shared ? 'Desativar link' : 'Compartilhar'}
                        </DropdownMenuItem>
                        {file.is_shared && (
                            <DropdownMenuItem onClick={copyShareLink}>
                                <Copy className="size-4" />
                                Copiar link
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                            <Trash2 className="size-4" />
                            Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
