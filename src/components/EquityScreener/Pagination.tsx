import { useCallback, useMemo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalResults,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalResults);

  const handlePrev = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  const handlePageClick = useCallback((page: number) => {
    onPageChange(page);
  }, [onPageChange]);

  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  if (totalResults === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-bg-secondary">
      <span className="text-xs text-text-secondary">
        Showing {startIndex.toLocaleString()}-{endIndex.toLocaleString()} of {totalResults.toLocaleString()}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-2 py-1 text-xs bg-bg-tertiary text-text-secondary rounded
                     hover:bg-bg-primary hover:text-text-primary
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Prev
        </button>

        {pageNumbers.map((page, index) => (
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-xs text-text-secondary">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={`
                w-7 h-7 text-xs rounded transition-colors
                ${page === currentPage
                  ? 'bg-accent-blue text-white'
                  : 'bg-bg-tertiary text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                }
              `}
            >
              {page}
            </button>
          )
        ))}

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-2 py-1 text-xs bg-bg-tertiary text-text-secondary rounded
                     hover:bg-bg-primary hover:text-text-primary
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
