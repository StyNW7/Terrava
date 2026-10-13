import { useEffect, useMemo, useState } from "react";
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
import { useLanguage } from "@/hooks/useLanguage";

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
  /** Shown when rows are selected; receives the selected rows and a way to clear the selection. */
  bulkActions?: ReactNode | ((selected: T[], clearSelection: () => void) => ReactNode);
}

function SelectBox({ checked, indeterminate = false, onChange, label }: { checked: boolean; indeterminate?: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(element) => {
        if (element) element.indeterminate = indeterminate;
      }}
      onChange={(event) => onChange(event.target.checked)}
      onClick={(event) => event.stopPropagation()}
      aria-label={label}
      className="h-4 w-4 cursor-pointer rounded border-terrava-border accent-[rgb(var(--t-primary))]"
    />
  );
}

export default function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  emptyTitle,
  emptyDescription,
  enableRowSelection = false,
  onSelectionChange,
  pageSize = 10,
  renderMobileCard,
  bulkActions,
}: DataTableProps<T>) {
  const { t } = useLanguage();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });

  const selectionColumn = useMemo<ColumnDef<T, unknown>>(
    () => ({
      id: "__select",
      enableSorting: false,
      header: ({ table }) => (
        <SelectBox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onChange={(value) => table.toggleAllPageRowsSelected(value)}
          label={t("dashboard.selectAllRows")}
        />
      ),
      cell: ({ row }) => <SelectBox checked={row.getIsSelected()} onChange={(value) => row.toggleSelected(value)} label={t("dashboard.selectRow")} />,
    }),
    [t]
  );

  const allColumns = useMemo(() => (enableRowSelection ? [selectionColumn, ...columns] : columns), [enableRowSelection, selectionColumn, columns]);

  // Selection is keyed by row id; drop ids that are no longer in the data (e.g. archived rows).
  const selectedRows = useMemo(() => data.filter((row) => rowSelection[row.id]), [data, rowSelection]);
  const clearSelection = () => setRowSelection({});

  useEffect(() => {
    onSelectionChange?.(selectedRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRows]);

  // Stay on a valid page when filtering shrinks the data.
  useEffect(() => {
    setPagination((current) => {
      const lastPage = Math.max(0, Math.ceil(data.length / current.pageSize) - 1);
      return current.pageIndex > lastPage ? { ...current, pageIndex: lastPage } : current;
    });
  }, [data.length]);

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, rowSelection, pagination },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    enableRowSelection,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) return <LoadingSkeleton variant="table" rows={6} />;

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle ?? t("dashboard.emptyTitle")}
        description={emptyDescription ?? t("dashboard.emptyDescription")}
      />
    );
  }

  const selectedCount = selectedRows.length;

  return (
    <div className="rounded-2xl border border-terrava-border bg-white">
      {enableRowSelection && selectedCount > 0 && bulkActions && (
        <div className="flex items-center justify-between border-b border-terrava-border bg-terrava-light px-4 py-2.5">
          <span className="text-xs font-semibold text-terrava-primary">{t("dashboard.selectedCount", { count: selectedCount })}</span>
          <div className="flex flex-wrap items-center gap-2">
            {typeof bulkActions === "function" ? bulkActions(selectedRows, clearSelection) : bulkActions}
            <button type="button" onClick={clearSelection} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-terrava-muted hover:bg-white">
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[960px] border-collapse text-left text-sm">
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
              <tr key={row.id} className="border-t border-terrava-border transition-colors hover:bg-terrava-bg/60">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="whitespace-nowrap px-4 py-3.5 align-middle text-terrava-text">
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
          <div key={row.id} className="flex items-start gap-3 p-4">
            {enableRowSelection && (
              <span className="pt-0.5">
                <SelectBox checked={row.getIsSelected()} onChange={(value) => row.toggleSelected(value)} label={t("dashboard.selectRow")} />
              </span>
            )}
            <div className="min-w-0 flex-1">{renderMobileCard ? renderMobileCard(row.original) : null}</div>
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
