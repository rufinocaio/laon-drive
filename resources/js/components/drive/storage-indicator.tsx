import { cn } from '@/lib/utils';
import { HardDrive } from 'lucide-react';

interface StorageIndicatorProps {
    used: number;
    formatted: string;
    limit?: number;
    showLimit?: boolean;
}

export function StorageIndicator({ used, formatted, limit = 2 * 1024 * 1024 * 1024, showLimit = true }: StorageIndicatorProps) {
    const percentage = Math.min((used / limit) * 100, 100);

    const formatLimit = () => {
        const gb = limit / (1024 * 1024 * 1024);
        return `${gb} GB`;
    };

    return (
        <div className="rounded-xl border border-sidebar-border/70 bg-card/50 p-4 backdrop-blur-sm dark:border-sidebar-border">
            <div className={cn("flex items-center gap-2", showLimit && "mb-3")}>
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-violet-500/10">
                    <HardDrive className="size-4 text-blue-500" />
                </div>
                <div>
                    <p className="text-xs font-medium text-foreground">Armazenamento</p>
                    <p className="text-xs text-muted-foreground">
                        {formatted} {showLimit && `de ${formatLimit()}`}
                    </p>
                </div>
            </div>
            {showLimit && (
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                        className={cn(
                            'h-full rounded-full transition-all duration-500 ease-out',
                            percentage > 90
                                ? 'bg-gradient-to-r from-red-500 to-red-600'
                                : percentage > 70
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                  : 'bg-gradient-to-r from-blue-500 to-violet-500',
                        )}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            )}
        </div>
    );
}

