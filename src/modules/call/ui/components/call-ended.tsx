import { Button } from "@/components/ui/button";
import Link from "next/link";

export const CallEnded = () =>{

    return (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
            <div className="py-4 px-8 items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-6 shadow-2xl shadow-cyan-500/10 border border-cyan-500/20">
                    <div className="flex flex-col gap-y-2 text-center">
                        <h6 className="text-lg font-medium">Call ended</h6>
                        <p className="text-sm">Summary transcription will appear soon.</p>

                    </div>
                   <Button asChild className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/60 transition-all duration-300">
                            <Link href="/dashboard/meetings">Return to Meetings?</Link>
                    </Button>
                </div>
            </div>
        </div>
    );

}