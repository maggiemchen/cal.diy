"use client";

import type { Table as ReactTableType, VisibilityState } from "@tanstack/react-table";
import { useEffect, useRef } from "react";

import { DataTable, useDataTable, useColumnFilters } from "@calcom/features/data-table";
import classNames from "@calcom/ui/classNames";

import { DataTablePagePagination } from "./DataTablePagePagination";

export type DataTableWrapperPaginatedProps<TData, TValue> = {
  testId?: string;
  bodyTestId?: string;
  table: ReactTableType<TData>;
  isPending: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  hideHeader?: boolean;
  variant?: "default" | "compact";
  totalDBRowCount?: number;
  ToolbarLeft?: React.ReactNode;
  ToolbarRight?: React.ReactNode;
  EmptyView?: React.ReactNode;
  LoaderView?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  children?: React.ReactNode;
  tableContainerRef?: React.RefObject<HTMLDivElement>;
};

export function DataTableWrapperPaginated<TData, TValue>({
  testId,
  bodyTestId,
  table,
  isPending,
  hasNextPage,
  hasPreviousPage,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  totalDBRowCount,
  variant,
  hideHeader,
  ToolbarLeft,
  ToolbarRight,
  EmptyView,
  LoaderView,
  className,
  containerClassName,
  children,
  tableContainerRef: externalRef,
}: DataTableWrapperPaginatedProps<TData, TValue>) {
  const internalRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = externalRef || internalRef;
  const { sorting, setSorting, columnVisibility, setColumnVisibility } = useDataTable();
  const columnFilters = useColumnFilters();

  useEffect(() => {
    const mergedColumnVisibility = {
      ...(table.initialState?.columnVisibility || {}),
      ...columnVisibility,
    } satisfies VisibilityState;

    table.setState((prev) => ({
      ...prev,
      sorting,
      columnFilters,
      columnVisibility: mergedColumnVisibility,
    }));
    table.setOptions((prev) => ({
      ...prev,
      onSortingChange: setSorting,
      onColumnVisibilityChange: setColumnVisibility,
    }));
  }, [table, sorting, columnFilters, columnVisibility]);

  let view: "loader" | "empty" | "table" = "table";
  if (isPending && LoaderView) {
    view = "loader";
  } else if (table.getRowCount() === 0 && EmptyView) {
    view = "empty";
  }

  return (
    <>
      {(ToolbarLeft || ToolbarRight || children) && (
        <div className={classNames("grid w-full items-center gap-2 py-4", className)}>
          <div className="flex w-full flex-col gap-2">
            <div className="flex w-full flex-wrap justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">{ToolbarLeft}</div>
              <div className="flex flex-wrap items-center gap-2">{ToolbarRight}</div>
            </div>
          </div>

          {children}
        </div>
      )}
      {view === "loader" && LoaderView}
      {view === "empty" && EmptyView}
      {view === "table" && (
        <DataTable
          testId={testId}
          bodyTestId={bodyTestId}
          table={table}
          tableContainerRef={tableContainerRef}
          isPending={isPending}
          enableColumnResizing={true}
          hideHeader={hideHeader}
          variant={variant}
          className={className}
          containerClassName={containerClassName}>
          {totalDBRowCount !== undefined && (
            <div style={{ gridArea: "footer", marginTop: "1rem" }}>
              <DataTablePagePagination
                table={table}
                totalDbDataCount={totalDBRowCount}
                currentPage={currentPage}
                pageSize={pageSize}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                isLoading={isPending}
              />
            </div>
          )}
        </DataTable>
      )}
    </>
  );
}
