import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export const CallEnded = () =>{

    return (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
            <div className="py-4 px-8 items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-y-6 bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-blue-600/30">
                    <div className="flex flex-col gap-y-2 text-center">
                        <h6 className="text-lg font-medium text-white">Call ended</h6>
                        <p className="text-sm text-blue-200">Your meeting summary and insights will be ready shortly. Check back in a few minutes!</p>

                    </div>
                   <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                            <Link href="/dashboard/meetings">Return to Meetings?</Link>
                    </Button>
                </div>
            </div>
        </div>
    );

}