"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { columns } from "../components/columns";

export const MeetingsView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.meetings.getMany.queryOptions({})
  );

  if (data.items.length === 0) {
    return (
      <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
        <EmptyState
          title="Create your first meeting"
          description="Schedule a meeting to connect with an agent. Each meeting lets you collaborate, share ideas, and interact with the agent in real time."
        />
      </div>
    );
  }

  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      <DataTable columns={columns} data={data.items} />
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
