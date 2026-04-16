import { Head } from '@inertiajs/react';
import { Download, File, FileArchive, FileAudio, FileCode, FileImage, FileSpreadsheet, FileText, FileVideo, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DriveFile } from '@/types';

interface SharedPageProps {
    file: DriveFile;
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

export default function Shared({ file }: SharedPageProps) {
    const { icon: Icon, color, bg } = getFileIcon(file);

    const handleDownload = () => {
        window.location.href = `/s/${file.share_token}/download`;
    };

    const isImage = file.mime_type?.startsWith('image/') && file.url;

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <Head title={`Compartilhado: ${file.name}`} />

            <Card className="w-full max-w-md border-sidebar-border/70 bg-card/50 shadow-2xl backdrop-blur-sm dark:border-sidebar-border overflow-hidden">
                <CardHeader className="text-center p-0">
                    {isImage ? (
                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                            <img
                                src={file.url!}
                                alt={file.name}
                                className="size-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-4 left-6 right-6 text-left">
                                <CardTitle className="text-xl font-bold tracking-tight text-white truncate">
                                    {file.name}
                                </CardTitle>
                                <p className="text-sm text-white/80">
                                    {file.formatted_size}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="pt-10 pb-6 px-6">
                            <div className={cn("mx-auto mb-6 flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br shadow-lg shadow-blue-500/10 transition-transform duration-500 hover:scale-110", bg)}>
                                <Icon className={cn('size-12', color)} />
                            </div>
                            <CardTitle className="text-xl font-bold tracking-tight text-foreground truncate px-4">
                                {file.name}
                            </CardTitle>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {file.is_folder ? 'Pasta' : file.formatted_size}
                            </p>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-balance text-sm text-muted-foreground">
                        Este item foi compartilhado publicamente via Laon Drive. Você pode visualizá-lo ou fazer o download abaixo.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button
                        onClick={handleDownload}
                        className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:brightness-110 py-6 text-base font-semibold"
                    >
                        <Download className="mr-2 size-5" />
                        Baixar Arquivo
                    </Button>
                    <p className="text-center text-[10px] text-muted-foreground/50">
                        O download será iniciado automaticamente de forma segura.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
