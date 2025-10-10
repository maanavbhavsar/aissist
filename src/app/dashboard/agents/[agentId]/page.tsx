import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "@/trpc/server";
import { AgentIdView } from "@/modules/agents/ui/views/agent-id-view";
import { AgentIdViewLoading } from "@/modules/agents/ui/views/agent-id-view";
import { AgentIdViewError } from "@/modules/agents/ui/views/agent-id-view";

interface Props {
  params: Promise<{
    agentId: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { agentId } = await params;

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(
    trpc.agents.getOne.queryOptions({
      id: agentId,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={<AgentIdViewError />}>
        <Suspense fallback={<AgentIdViewLoading />}>
          <AgentIdView agentId={agentId} />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
}
