"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (row: TData) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      {/* Mobile: Card Layout */}
      <div className="md:hidden space-y-3">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <div
              key={row.id}
              onClick={() => onRowClick?.(row.original)}
              className="cursor-pointer rounded-lg border border-cyan-500/20 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm p-4 hover:bg-slate-700/40 hover:border-cyan-500/40 transition-all duration-300 shadow-lg shadow-cyan-500/5 hover:shadow-xl hover:shadow-cyan-500/10"
            >
              <div className="space-y-3">
                {row.getVisibleCells().map((cell, index) => {
                  const header = typeof cell.column.columnDef.header === 'function' 
                    ? cell.column.id 
                    : (cell.column.columnDef.header as string) || cell.column.id;
                  return (
                    <div key={cell.id} className={index === 0 ? "" : "pt-2 border-t border-slate-700"}>
                      <div className="text-xs text-slate-400 mb-1 font-medium uppercase">
                        {header}
                      </div>
                      <div className="text-sm text-slate-200">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center min-h-[400px] rounded-lg border border-cyan-500/20 bg-gradient-to-br from-slate-800/40 to-slate-900/40 shadow-lg shadow-cyan-500/5">
            <div className="text-slate-400 text-sm">No data to display</div>
          </div>
        )}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-cyan-500/20 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm shadow-2xl shadow-cyan-500/10">
        {table.getRowModel().rows?.length ? (
          <Table>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer h-19 text-slate-300 hover:bg-slate-700/40 hover:border-l-2 hover:border-l-cyan-500/50 border-b border-cyan-500/10 transition-all duration-300"
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-sm p-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-slate-400 text-sm">No data to display</div>
          </div>
        )}
      </div>
    </>
  )
}
