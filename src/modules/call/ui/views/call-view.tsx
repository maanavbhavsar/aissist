'use client';

import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { ErrorState } from '@/components/error-state';
import { CallProvider } from '../components/call-provider';

export function CallView({ meetingId }: { meetingId: string }) {
  const trpc = useTRPC();
  const { data, isLoading, error } = useQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId })
  );


  if (isLoading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-white">Loading meeting...</div>
    </div>
  );

  if (error) return (
    <div className="flex h-screen items-center justify-center">
      <ErrorState title="Error" description="Failed to load meeting data" />
    </div>
  );

  if (!data) return (
    <div className="flex h-screen items-center justify-center">
      <ErrorState title="Not Found" description="Meeting not found" />
    </div>
  );
  if (data.status === 'completed') {
    return (
      <div className="flex h-screen items-center justify-center">
        <ErrorState title="Meeting Ended" description="This meeting has ended. You can no longer join." />
      </div>
    );
  }

  return <CallProvider meetingId={meetingId} meetingName={data.name} />;
}
