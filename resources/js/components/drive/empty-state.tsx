import { CloudUpload } from 'lucide-react';

export function EmptyState({ onUpload }: { onUpload: () => void }) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center py-20">
            <div className="group relative mb-6">
                <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-indigo-500/20 blur-xl transition-all duration-500 group-hover:from-blue-500/30 group-hover:via-violet-500/30 group-hover:to-indigo-500/30" />
                <div className="relative flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 ring-1 ring-blue-500/20 transition-transform duration-300 group-hover:scale-110">
                    <CloudUpload className="size-10 text-blue-500 transition-transform duration-300 group-hover:-translate-y-1" />
                </div>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">Nenhum arquivo por aqui</h3>
            <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
                Arraste e solte seus arquivos aqui, ou clique no botão abaixo para começar a enviar.
            </p>
            <button
                onClick={onUpload}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 hover:brightness-110 active:scale-95"
            >
                <CloudUpload className="size-4" />
                Enviar arquivos
            </button>
        </div>
    );
}
