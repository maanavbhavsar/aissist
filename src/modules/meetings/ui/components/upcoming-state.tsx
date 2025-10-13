import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Video, Ban } from "lucide-react";

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
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-transparent border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
        >
          <Ban className="size-4" />
          Cancel Meeting
        </Button>
        
        <Button asChild className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <Link href={`/call/${meetingId}`}>
            <Video className="size-4" />
            Start Meeting
          </Link>
        </Button>
      </div>
    </div>
  );
}
