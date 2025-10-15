import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { CallView } from "@/modules/call/ui/views/call-view";

export default async function Page({ 
  params 
}: { 
  params: Promise<{ meetingId: string }> 
}) {
  const { meetingId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    redirect('/sign-in');
  }

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CallView meetingId={meetingId} />
    </HydrationBoundary>
  );
}
