"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { DataTable } from "@/components/data-table";
import { DataPagination } from "@/components/data-pagination";
import { EmptyState } from "@/components/empty-state";
import { columns } from "../components/columns";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

export const MeetingsView = () => {
  const trpc = useTRPC();
  const router = useRouter();
  const [filters, setFilters] = useMeetingsFilters();
  
  const { data } = useSuspenseQuery(
    trpc.meetings.getMany.queryOptions({
      ...filters,
    })
  );

  if (data.items.length === 0) {
    return (
      <div className="flex-1 pb-2 px-2 md:px-8 flex flex-col gap-y-2 md:gap-y-4">
        <EmptyState
          title="Create your first meeting"
          description="Schedule a meeting to connect with an agent. Each meeting lets you collaborate, share ideas, and interact with the agent in real time."
        />
      </div>
    );
  }

  return (
    <div className="flex-1 pb-2 px-2 md:px-8 flex flex-col gap-y-2 md:gap-y-4">
      <DataTable 
        columns={columns} 
        data={data.items}
        onRowClick={(row) => router.push(`/dashboard/meetings/${row.id}`)}
      />
      <DataPagination
        page={filters.page}
        totalPages={data.totalPages}
        onPageChange={(page) => setFilters({ page })}
      />
    </div>
  );
};

export const MeetingsViewLoading = () => {
  return (
    <LoadingState title="Loading..." description="Loading meetings, may take a few seconds..." />
  );
};

export const MeetingsViewError = () => {
  return (
    <ErrorState title="Error Loading Meetings" description="Something went wrong." />
  );
};
