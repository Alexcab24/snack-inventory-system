import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className = '' }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    return (
        <div className={`flex items-center justify-center space-x-2 ${className}`}>
            {/* First page */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="px-2 py-1"
            >
                <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous page */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            {getVisiblePages().map((page, index) => (
                <div key={index}>
                    {page === '...' ? (
                        <span className="px-3 py-1 text-gray-500">...</span>
                    ) : (
                        <Button
                            variant={currentPage === page ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => onPageChange(page as number)}
                            className="px-3 py-1 min-w-[40px]"
                        >
                            {page}
                        </Button>
                    )}
                </div>
            ))}

            {/* Next page */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 py-1"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last page */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1"
            >
                <ChevronsRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
