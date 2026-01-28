import { useState, useMemo } from 'react';

interface PaginationOptions<T> {
    items: T[];
    itemsPerPage: number;
}

export function usePagination<T>({ items, itemsPerPage }: PaginationOptions<T>) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / itemsPerPage);

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    }, [items, currentPage, itemsPerPage]);

    // Reset to page 1 if current page exceeds total pages
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    }

    return {
        currentPage,
        setCurrentPage,
        paginatedItems,
        totalPages
    };
}
