"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";

interface Props {
  meetingId: string;
}

export const MeetingIdView = ({ meetingId }: Props) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({
      id: meetingId,
    })
  );

  return (
    <div>
      Meeting ID: {meetingId}
      <br />
      {JSON.stringify(data)}
    </div>
  );
};

export const MeetingIdViewLoading = () => {
  return (
    <LoadingState title="Loading..." description="Loading meeting, may take a few seconds..." />
  );
};

export const MeetingIdViewError = () => {
  return (
    <ErrorState title="Error Loading Meeting" description="Something went wrong." />
  );
};
