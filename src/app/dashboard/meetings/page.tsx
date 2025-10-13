import { Suspense, Fragment } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { MeetingsView } from "@/modules/meetings/ui/views/meetings-view";
import { MeetingsViewLoading } from "@/modules/meetings/ui/views/meetings-view";
import { MeetingsViewError } from "@/modules/meetings/ui/views/meetings-view";
import { MeetingsListHeader } from "@/modules/meetings/ui/components/meetings-list-header";
import { loadSearchParams } from "@/modules/meetings/params";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  const filters = await loadSearchParams(searchParams);

  void queryClient.prefetchQuery(
    trpc.meetings.getMany.queryOptions({
      ...filters,
    })
  );
  
  void queryClient.prefetchQuery(
    trpc.agents.getMany.queryOptions({ pageSize: 100 })
  );

  return (
    <Fragment>
      <MeetingsListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<MeetingsViewError />}>
          <Suspense fallback={<MeetingsViewLoading />}>
            <MeetingsView />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </Fragment>
  );
}
