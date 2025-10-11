import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import { MeetingsView } from "@/modules/meetings/ui/views/meetings-view";
import { MeetingsViewLoading } from "@/modules/meetings/ui/views/meetings-view";
import { MeetingsViewError } from "@/modules/meetings/ui/views/meetings-view";

export default async function Page() {
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(
    trpc.meetings.getMany.queryOptions({})
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={<MeetingsViewError />}>
        <Suspense fallback={<MeetingsViewLoading />}>
          <MeetingsView />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
}
