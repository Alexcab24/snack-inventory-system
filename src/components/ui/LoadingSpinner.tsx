export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    };

    return (
        <div className={`loading-spinner rounded-full border-4 border-blue-200 border-t-blue-600 ${sizeClasses[size]}`}></div>
    );
}
