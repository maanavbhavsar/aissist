"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { NewMeetingDialog } from "./new-meeting-dialog";

export const MeetingsListHeader = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <>
            <NewMeetingDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
            <div className="py-4 px-4 md:px-8 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h5 className="font-medium text-xl text-white">My Meetings</h5>
                    <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <PlusIcon /> New Meeting
                    </Button>
                </div>
            </div>
        </>
    );
};
