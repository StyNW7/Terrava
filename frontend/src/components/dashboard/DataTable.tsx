import { useState } from "react";
import type { ReactNode } from "react";
import {
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import LoadingSkeleton from "@/components/dashboard/LoadingSkeleton";
import EmptyState from "@/components/dashboard/EmptyState";
import Pagination from "@/components/dashboard/Pagination";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  enableRowSelection?: boolean;
  onSelectionChange?: (rows: T[]) => void;
  pageSize?: number;
  renderMobileCard?: (row: T) => ReactNode;
  bulkActions?: ReactNode;
}

export default function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  emptyTitle = "Tidak ada data",
  emptyDescription = "Belum ada data yang tersedia untuk filter ini.",
  enableRowSelection = false,
  onSelectionChange,
  pageSize = 10,
  renderMobileCard,
  bulkActions,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection, pagination },
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      setRowSelection(updater);
      if (onSelectionChange) {
        const next = typeof updater === "function" ? updater(rowSelection) : updater;
        const selectedRows = data.filter((_, index) => next[String(index)]);
        onSelectionChange(selectedRows);
      }
    },
    onPaginationChange: setPagination,
    enableRowSelection,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) return <LoadingSkeleton variant="table" rows={6} />;

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="rounded-2xl border border-terrava-border bg-white">
      {enableRowSelection && selectedCount > 0 && bulkActions && (
        <div className="flex items-center justify-between border-b border-terrava-border bg-terrava-light px-4 py-2.5">
          <span className="text-xs font-semibold text-terrava-primary">{selectedCount} dipilih</span>
          <div className="flex items-center gap-2">{bulkActions}</div>
        </div>
      )}

      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-terrava-bg">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-terrava-muted">
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        disabled={!header.column.getCanSort()}
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-1.5 disabled:cursor-default"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() &&
                          (header.column.getIsSorted() === "asc" ? (
                            <ArrowUp className="h-3 w-3" aria-hidden="true" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ArrowDown className="h-3 w-3" aria-hidden="true" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-40" aria-hidden="true" />
                          ))}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-terrava-border hover:bg-terrava-bg/60">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3.5 align-middle text-terrava-text">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card fallback */}
      <div className="divide-y divide-terrava-border md:hidden">
        {table.getRowModel().rows.map((row) => (
          <div key={row.id} className="p-4">
            {renderMobileCard ? renderMobileCard(row.original) : null}
          </div>
        ))}
      </div>

      <Pagination
        page={pagination.pageIndex + 1}
        totalPages={table.getPageCount()}
        onPageChange={(page) => table.setPageIndex(page - 1)}
        totalResults={data.length}
        pageSize={pagination.pageSize}
      />
    </div>
  );
}
