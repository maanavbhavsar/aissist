"use client";

import { Button } from "@/components/ui/button";

interface DataPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const DataPagination = ({ page, totalPages, onPageChange }: DataPaginationProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 py-4">
      <div className="text-sm text-slate-300 order-2 sm:order-1">
        Page {page} of {totalPages === 0 ? 1 : totalPages}
      </div>
      <div className="flex items-center justify-end gap-2 order-1 sm:order-2 w-full sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="flex-1 sm:flex-initial"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages || totalPages === 0}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className="flex-1 sm:flex-initial"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
