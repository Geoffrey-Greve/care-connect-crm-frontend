import { useEffect, useMemo, useState } from "react";

export function useTablePagination<T>(items: T[], initialPageSize = 10) {
  const [entriesPerPage, setEntriesPerPage] = useState(initialPageSize.toString());
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = Math.max(1, parseInt(entriesPerPage, 10) || initialPageSize);
  const totalItems = items.length;
  const hasItems = totalItems > 0;
  const rawPageCount = hasItems ? Math.ceil(totalItems / itemsPerPage) : 1;

  useEffect(() => {
    if (currentPage > rawPageCount) {
      setCurrentPage(rawPageCount);
    }
  }, [rawPageCount, currentPage]);

  const pagination = useMemo(() => {
    if (!hasItems) {
      return { paginatedItems: [] as T[], startIndex: 0, endIndex: 0 };
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return {
      paginatedItems: items.slice(startIndex, endIndex),
      startIndex,
      endIndex,
    };
  }, [hasItems, items, currentPage, itemsPerPage, totalItems]);

  const handleEntriesChange = (value: string) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const resetToFirstPage = () => setCurrentPage(1);

  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, rawPageCount));

  const showingStart = hasItems ? pagination.startIndex + 1 : 0;
  const showingEnd = hasItems ? pagination.endIndex : 0;

  const setPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, rawPageCount));
    setCurrentPage(validPage);
  };

  return {
    entriesPerPage,
    handleEntriesChange,
    currentPage,
    setCurrentPage: setPage,
    pageCount: hasItems ? rawPageCount : 0,
    totalItems,
    paginatedItems: pagination.paginatedItems,
    startIndex: pagination.startIndex,
    endIndex: pagination.endIndex,
    showingStart,
    showingEnd,
    resetToFirstPage,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious: hasItems && currentPage > 1,
    canGoNext: hasItems && currentPage < rawPageCount,
    hasItems,
  };
}

