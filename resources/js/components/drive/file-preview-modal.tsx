import { Download, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { DriveFile } from '@/types';

interface FilePreviewModalProps {
    file: DriveFile | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function FilePreviewModal({ file, open, onOpenChange }: FilePreviewModalProps) {
    if (!file || !file.url) return null;

    const isImage = file.mime_type?.startsWith('image/');
    const isVideo = file.mime_type?.startsWith('video/');
    const isPdf = file.mime_type === 'application/pdf';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 pr-8">
                        <span className="truncate">{file.name}</span>
                        <span className="shrink-0 text-xs font-normal text-muted-foreground">
                            {file.formatted_size}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-lg bg-muted/50">
                    {isImage && (
                        <img
                            src={file.url}
                            alt={file.name}
                            className="max-h-[65vh] max-w-full rounded-lg object-contain"
                        />
                    )}
                    {isVideo && (
                        <video
                            src={file.url}
                            controls
                            className="max-h-[65vh] max-w-full rounded-lg"
                        >
                            Seu navegador não suporta a reprodução de vídeo.
                        </video>
                    )}
                    {isPdf && (
                        <iframe
                            src={file.url}
                            className="h-[65vh] w-full rounded-lg"
                            title={file.name}
                        />
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        <X className="size-4" />
                        Fechar
                    </Button>
                    <Button
                        onClick={() => window.open(file.url!, '_blank')}
                        className="bg-gradient-to-r from-blue-600 to-violet-600 text-white"
                    >
                        <Download className="size-4" />
                        Download
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
