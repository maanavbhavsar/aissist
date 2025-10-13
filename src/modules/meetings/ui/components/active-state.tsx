import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

interface Props {
  meetingId: string;
}

export function ActiveState({ meetingId }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-2">Meeting is active</h2>
        <p className="text-slate-300">Join your ongoing meeting session.</p>
      </div>
      
      <Button asChild className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
        <Link href={`/call/${meetingId}`}>
          <Video className="size-4" />
          Join Meeting
        </Link>
      </Button>
    </div>
  );
}
