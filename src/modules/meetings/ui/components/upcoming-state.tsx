import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

interface Props {
  meetingId: string;
}

export function UpcomingState({ meetingId }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-2">Meeting not started yet</h2>
        <p className="text-slate-300">Your meeting is scheduled and ready to begin.</p>
      </div>
      
      <div className="flex justify-center">
        <Button asChild className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/60 transition-all duration-300">
          <Link href={`/call/${meetingId}`}>
            <Video className="size-4" />
            Start Meeting
          </Link>
        </Button>
      </div>
    </div>
  );
}
