"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { AgentIdViewHeader } from "@/modules/agents/ui/components/agent-id-view-header";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Badge } from "@/components/ui/badge";
import { Video } from "lucide-react";


interface Props {
  agentId: string;
}

export function AgentIdView({ agentId }: Props) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.agents.getOne.queryOptions({
      id: agentId,
    })
  );

  return (
    <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
      <AgentIdViewHeader
        agentId={agentId}
        agentName={data.name}
        onEdit={() => {}}
        onRemove={() => {}}
      />
      
      <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 backdrop-blur-sm">
        <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
          <div className="flex items-center gap-x-3">
            <GeneratedAvatar
              variant="bot-neutral"
              seed={data.name}
              className="size-10"
            />
            <h2 className="text-2xl font-medium text-white">{data.name}</h2>
          </div>
          
          <Badge variant="outline" className="flex items-center gap-x-2 [&>svg]:size-4 border-slate-600 text-slate-300 bg-slate-700/30">
            <Video className="size-4 text-blue-400" />
            {data.meetingCount}{data.meetingCount === 1 ? "meeting" : "meetings"}
          </Badge>
          
          <div className="flex flex-col gap-y-4">
            <p className="text-lg font-medium text-white">Instructions</p>
            <p className="text-slate-300">{data.instructions}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AgentIdViewLoading() {
  return <LoadingState title="Loading agent..." description="We're fetching the agent's information..."/>;
}

export function AgentIdViewError() {
  return <ErrorState title="Error loading individual agent" description="We're unable to fetch the agent's information. Please try again later."/>;
}
