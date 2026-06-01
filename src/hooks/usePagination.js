import { useState, useMemo } from 'react';

/**
 * Custom hook for localized array or asynchronous list pagination.
 * @param {Array} items 
 * @param {number} itemsPerPage 
 */
export function usePagination(items = [], itemsPerPage = 8) {
  const [currentPage, setCurrentPage] = useState(1);

  const maxPage = useMemo(() => {
    return Math.max(1, Math.ceil(items.length / itemsPerPage));
  }, [items.length, itemsPerPage]);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, maxPage));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    goToPage(currentPage + 1);
  };

  const prevPage = () => {
    goToPage(currentPage - 1);
  };

  return {
    currentPage,
    maxPage,
    currentData,
    goToPage,
    nextPage,
    prevPage,
    hasNext: currentPage < maxPage,
    hasPrev: currentPage > 1,
  };
}
