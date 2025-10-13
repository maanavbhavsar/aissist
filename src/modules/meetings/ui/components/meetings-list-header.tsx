"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PlusIcon, XCircleIcon } from "lucide-react";
import { NewMeetingDialog } from "./new-meeting-dialog";
import { MeetingsSearchFilter } from "./meetings-search-filter";
import { StatusFilter } from "./status-filter";
import { AgentIdFilter } from "./agent-id-filter";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

export const MeetingsListHeader = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [filters, setFilters] = useMeetingsFilters();

    const isAnyFilterModified = !!filters.status || !!filters.search || !!filters.agentId;

    const onClearFilters = () => {
        setFilters({
            status: null,
            agentId: "",
            search: "",
            page: 1,
        });
    };

    return (
        <>
            <NewMeetingDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
            <div className="py-2 px-2 md:px-8 flex flex-col gap-2 md:gap-4">
                <div className="flex items-center justify-between">
                    <h5 className="font-medium text-base md:text-xl text-white">My Meetings</h5>
                    <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base">
                        <PlusIcon className="w-4 h-4" /> <span className="hidden sm:inline">New Meeting</span>
                    </Button>
                </div>
                {/* Desktop: No scroll area - filters flow naturally */}
                <div className="hidden md:flex items-center gap-2">
                    <MeetingsSearchFilter />
                    <StatusFilter />
                    <AgentIdFilter />
                    {isAnyFilterModified && (
                            <Button
                                variant="outline"
                                onClick={onClearFilters}
                                className="h-8 w-[80px] bg-slate-800 text-white border-slate-600 hover:bg-slate-700 text-sm"
                            >
                            <XCircleIcon className="h-4 w-4" />
                            Clear
                        </Button>
                    )}
                </div>
                
                {/* Mobile: With scroll area for horizontal overflow */}
                <ScrollArea className="md:hidden w-full">
                    <div className="flex items-center gap-2 p-1 min-w-max">
                        <MeetingsSearchFilter />
                        <StatusFilter />
                        <AgentIdFilter />
                        {isAnyFilterModified && (
                            <Button
                                variant="outline"
                                onClick={onClearFilters}
                                className="h-8 w-[80px] bg-slate-800 text-white border-slate-600 hover:bg-slate-700 text-sm"
                            >
                                <XCircleIcon className="h-4 w-4" />
                                Clear
                            </Button>
                        )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </>
    );
};
