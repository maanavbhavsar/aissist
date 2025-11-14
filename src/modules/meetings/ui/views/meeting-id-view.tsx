"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { MeetingIdViewHeader } from "@/modules/meetings/ui/components/meeting-id-view-header";
import { UpdateMeetingDialog } from "@/modules/meetings/ui/components/update-meeting-dialog";
import { UpcomingState } from "@/modules/meetings/ui/components/upcoming-state";
import { ActiveState } from "@/modules/meetings/ui/components/active-state";
import { CancelledState } from "@/modules/meetings/ui/components/cancelled-state";
import { ProcessingState } from "@/modules/meetings/ui/components/processing-state";
import CompletedState from "@/modules/meetings/ui/components/completed-state";
import { useConfirm } from "@/hooks/use-confirm";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { toast } from "sonner";

interface Props {
  meetingId: string;
}

export function MeetingIdView({ meetingId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  
  const { data } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({
      id: meetingId,
    })
  );

  // Meeting status variants
  const isActive = data.status === "active";
  const isUpcoming = data.status === "upcoming";
  const isCancelled = data.status === "cancelled";
  const isCompleted = data.status === "completed";
  const isProcessing = data.status === "processing";

  const removeMeeting = useMutation(
    trpc.meetings.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
        router.push("/dashboard/meetings");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const [removeConfirmation, confirmRemove] = useConfirm(
    "Are you sure?",
    "This action will permanently remove this meeting."
  );

  const handleRemove = async () => {
    const ok = await confirmRemove();
    if (!ok) return;
    
    await removeMeeting.mutateAsync({ id: meetingId });
  };

  return (
    <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4 relative z-10">
      <MeetingIdViewHeader
        meetingId={meetingId}
        meetingName={data.name}
        onEdit={() => setUpdateDialogOpen(true)}
        onRemove={handleRemove}
      />
      {/* Render appropriate state component based on meeting status */}
      {isUpcoming && <UpcomingState meetingId={meetingId} />}
      {isActive && <ActiveState meetingId={meetingId} />}
      {isCancelled && <CancelledState />}
      {isProcessing && <ProcessingState />}
      {isCompleted && (
        <CompletedState 
          meetingId={meetingId} 
          meetingName={data.name}
          summary={data.summary}
          transcript={data.transcriptUrl}
          recordingUrl={data.recordingUrl}
        />
      )}
      
      <UpdateMeetingDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        initialValues={data}
      />
      
      {removeConfirmation}
    </div>
  );
}

export function MeetingIdViewLoading() {
  return <LoadingState title="Loading meeting..." description="This may take a few seconds." />;
}

export function MeetingIdViewError() {
  return <ErrorState title="Error loading meeting" description="Please try again later." />;
}