import React from "react";
import Badge from "../primitives/Badge";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  useMono?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  emptySubMessage?: string;
  emptyAction?: React.ReactNode;
  
  // Selection
  selectedIds?: Set<string | number>;
  onSelectRow?: (id: string | number) => void;
  onSelectAllRows?: (checked: boolean) => void;
  rowIdAccessor?: (row: T) => string | number;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = "ไม่พบข้อมูล",
  emptySubMessage,
  emptyAction,
  selectedIds,
  onSelectRow,
  onSelectAllRows,
  rowIdAccessor,
}: DataTableProps<T>) {
  const isSelectable = selectedIds !== undefined && onSelectRow !== undefined && onSelectAllRows !== undefined && rowIdAccessor !== undefined;
  
  const allSelected = isSelectable && data.length > 0 && selectedIds.size === data.length;
  const someSelected = isSelectable && selectedIds.size > 0 && selectedIds.size < data.length;

  if (isLoading) {
    return (
      <div className="w-full overflow-hidden border border-border rounded-lg bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface border-b border-border">
              {isSelectable && <th className="w-12 px-4 py-3"><div className="w-4 h-4 rounded bg-border-subtle" /></th>}
              {columns.map((col, index) => (
                <th key={index} className="px-4 py-3 text-xs font-semibold text-muted font-sans select-none">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, rIndex) => (
              <tr key={rIndex} className="border-b border-border border-subtle">
                {isSelectable && <td className="px-4 py-4"><div className="w-4 h-4 rounded shimmer" /></td>}
                {columns.map((col, cIndex) => (
                  <td key={cIndex} className="px-4 py-4">
                    <div className="h-4 bg-surface rounded shimmer w-2/3" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-border rounded-lg text-center gap-4">
        {/* Empty State Illustration SVG */}
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-surface text-muted">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold text-ink">{emptyMessage}</h3>
          {emptySubMessage && <p className="text-sm text-muted font-sans">{emptySubMessage}</p>}
        </div>
        {emptyAction && <div className="mt-2">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-border rounded-lg bg-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface border-b border-border select-none">
            {isSelectable && (
              <th className="w-12 px-4 py-3 text-center align-middle">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAllRows(e.target.checked)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary/20 cursor-pointer"
                  aria-label="เลือกทั้งหมด"
                />
              </th>
            )}
            {columns.map((col, index) => (
              <th
                key={index}
                className={`px-4 py-3 text-xs font-semibold text-muted font-sans ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rIndex) => {
            const rowId = rIndex; // Fallback
            const actualRowId = rowIdAccessor ? rowIdAccessor(row) : keyExtractor(row);
            const isSelected = isSelectable && selectedIds.has(actualRowId);

            return (
              <tr
                key={keyExtractor(row)}
                className={`group border-b border-border-subtle transition-colors relative hover:bg-surface/50 ${
                  rIndex % 2 === 1 ? "bg-surface/20" : "bg-white"
                } ${isSelected ? "bg-primary-light hover:bg-primary-light" : ""}`}
              >
                {/* 2px Left edge hover indicator */}
                <td className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-150 pointer-events-none" />

                {isSelectable && (
                  <td className="px-4 py-4 text-center align-middle">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectRow(actualRowId)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary/20 cursor-pointer"
                      aria-label="เลือกรายการนี้"
                    />
                  </td>
                )}
                {columns.map((col, cIndex) => {
                  const val = typeof col.accessor === "function"
                    ? col.accessor(row)
                    : (row[col.accessor] as React.ReactNode);

                  return (
                    <td
                      key={cIndex}
                      className={`px-4 py-4 text-sm text-ink font-sans ${
                        col.useMono ? "font-mono text-[13px]" : ""
                      } ${col.className || ""}`}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
