'use client';

interface IdDisplayProps {
    id: string;
    label?: string;
    showWhen: boolean;
    className?: string;
}

export function IdDisplay({ id, label = 'ID', showWhen, className = '' }: IdDisplayProps) {
    if (!showWhen) return null;

    return (
        <div className={`text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded border ${className}`}>
            <span className="font-semibold">{label}:</span> {id}
        </div>
    );
}
