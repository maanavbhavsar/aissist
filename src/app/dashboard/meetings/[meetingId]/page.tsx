import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import { 
  MeetingIdView,
  MeetingIdViewLoading,
  MeetingIdViewError 
} from "@/modules/meetings/ui/views/meeting-id-view";

interface Props {
  params: Promise<{
    meetingId: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { meetingId } = await params;

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(
    trpc.meetings.getOne.queryOptions({
      id: meetingId,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={<MeetingIdViewError />}>
        <Suspense fallback={<MeetingIdViewLoading />}>
          <MeetingIdView meetingId={meetingId} />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
}
