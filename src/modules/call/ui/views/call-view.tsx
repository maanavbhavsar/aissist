'use client';

import Image from "next/image";
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
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="flex flex-col items-center gap-4">
        <Image 
          src="/Science.png" 
          alt="Loading" 
          width={64} 
          height={64}
          className="animate-spin-slow"
          style={{ animationDuration: '3s' }}
        />
        <p className="text-xl font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Loading...</p>
      </div>
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
