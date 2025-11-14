"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { AgentIdViewHeader } from "@/modules/agents/ui/components/agent-id-view-header";
import { UpdateAgentDialog } from "@/modules/agents/ui/components/update-agent-dialog";
import { useConfirm } from "@/hooks/use-confirm";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, ArrowLeft } from "lucide-react";
import { toast } from "sonner";


interface Props {
  agentId: string;
}

export function AgentIdView({ agentId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const [updateAgentDialogOpen, setUpdateAgentDialogOpen] = useState(false);
  
  const { data } = useSuspenseQuery(
    trpc.agents.getOne.queryOptions({
      id: agentId,
    })
  );

  const removeAgent = useMutation(
    trpc.agents.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
        // TODO: invalidate previous usage
        await router.push("/dashboard/agents");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const [removeConfirmation, confirmRemove] = useConfirm(
    "Are you sure?",
    `The following action will remove ${data.meetingCount} associated meetings.`
  );

  const handleRemoveAgent = async () => {
    const ok = await confirmRemove();
    if (!ok) return;
    
    await removeAgent.mutateAsync({ id: agentId });
  };

  return (
    <>
      <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => router.push('/dashboard/agents')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/60 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Agents
          </Button>
        </div>
        <AgentIdViewHeader
          agentId={agentId}
          agentName={data.name}
          onEdit={() => setUpdateAgentDialogOpen(true)}
          onRemove={handleRemoveAgent}
        />
      
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-lg border border-cyan-500/20 backdrop-blur-sm shadow-2xl shadow-cyan-500/10">
        <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
          <div className="flex items-center gap-x-3">
            <GeneratedAvatar
              variant="bot-neutral"
              seed={data.name}
              className="size-10"
            />
            <h2 className="text-2xl font-medium text-white">{data.name}</h2>
          </div>
          
          <Badge variant="outline" className="flex items-center gap-x-2 [&>svg]:size-4 border-cyan-500/30 text-slate-300 bg-cyan-600/20">
            <Video className="size-4 text-cyan-400" />
            {data.meetingCount} {data.meetingCount === 1 ? "meeting" : "meetings"}
          </Badge>
          
          <div className="flex flex-col gap-y-4">
            <p className="text-lg font-medium text-white">Instructions</p>
            <p className="text-slate-300">{data.instructions}</p>
          </div>
        </div>
      </div>
      </div>
      
      <UpdateAgentDialog
        open={updateAgentDialogOpen}
        onOpenChange={setUpdateAgentDialogOpen}
        initialValues={data}
      />
      
      {removeConfirmation}
    </>
  );
}

export function AgentIdViewLoading() {
  return <LoadingState title="Loading agent..." description="We're fetching the agent's information..."/>;
}

export function AgentIdViewError() {
  return <ErrorState title="Error loading individual agent" description="We're unable to fetch the agent's information. Please try again later."/>;
}
