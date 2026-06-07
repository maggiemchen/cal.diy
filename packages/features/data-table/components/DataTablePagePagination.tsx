"use client";

import type { Table } from "@tanstack/react-table";

import { Button } from "@calcom/ui";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "@calcom/ui/components/icon";

interface DataTablePagePaginationProps<TData> {
  table: Table<TData>;
  totalDbDataCount: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isLoading?: boolean;
}

export function DataTablePagePagination<TData>({
  table,
  totalDbDataCount,
  currentPage,
  pageSize,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}: DataTablePagePaginationProps<TData>) {
  const loadedCount = table.getFilteredRowModel().rows.length;
  const totalPages = Math.ceil(totalDbDataCount / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalDbDataCount);

  // Calculate which page numbers to show
  const getVisiblePageNumbers = () => {
    const delta = 2; // Show 2 pages on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Always include page 1
    range.push(1);

    // Calculate the range around current page
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    // Always include last page if totalPages > 1
    if (totalPages > 1) {
      range.push(totalPages);
    }

    let prev = 0;
    for (const i of range) {
      if (prev + 1 !== i) {
        rangeWithDots.push("...");
      }
      rangeWithDots.push(i);
      prev = i;
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePageNumbers();

  if (totalDbDataCount === 0) {
    return (
      <div className="flex items-center justify-between">
        <p className="text-subtle text-sm">No results found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1 text-sm">
        <p className="text-subtle">
          Showing <span className="text-default font-medium">{startItem}</span> to{" "}
          <span className="text-default font-medium">{endItem}</span> of{" "}
          <span className="text-default font-medium">{totalDbDataCount}</span> results
        </p>
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-subtle text-sm">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={isLoading}
              className="bg-default border-subtle text-default rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        {/* First page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={!hasPreviousPage || isLoading}
          className="h-8 w-8 p-0"
          aria-label="Go to first page">
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage || isLoading}
          className="h-8 w-8 p-0"
          aria-label="Go to previous page">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => {
            if (page === "...") {
              return (
                <span key={index} className="text-muted-foreground px-2 py-1 text-sm">
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isCurrentPage = pageNumber === currentPage;

            return (
              <Button
                key={pageNumber}
                variant={isCurrentPage ? "default" : "ghost"}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
                disabled={isLoading}
                className="h-8 w-8 p-0"
                aria-label={`Go to page ${pageNumber}`}
                aria-current={isCurrentPage ? "page" : undefined}>
                {pageNumber}
              </Button>
            );
          })}
        </div>

        {/* Next page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage || isLoading}
          className="h-8 w-8 p-0"
          aria-label="Go to next page">
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage || isLoading}
          className="h-8 w-8 p-0"
          aria-label="Go to last page">
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
