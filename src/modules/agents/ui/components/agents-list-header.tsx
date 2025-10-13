"use client";

import { useState } from "react";
import { NewAgentDialog } from "./new-agent-dialog";
import { AgentsSearchFilter } from "./agents-search-filter";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PlusIcon, XCircleIcon } from "lucide-react";
import { useAgentsFilters } from "../../hooks/use-agents-filters";
import { DEFAULT_PAGE } from "@/constants";

export const AgentsListHeader = () => {
    const [open, setDialogOpen] = useState(false);
    const [filters, setFilters] = useAgentsFilters();

    const isAnyFilterModified = !!filters.search;

    const clearFilters = () => {
        setFilters({
            search: "",
            page: DEFAULT_PAGE,
        });
    };

    return (
        <> 
        <NewAgentDialog open={open} onOpenChange={setDialogOpen} />
            <div className="py-2 px-2 md:px-8 flex flex-col gap-2 md:gap-4">
            <div className="flex items-center justify-between">
                <h5 className="font-medium text-base md:text-xl text-white">My Agents</h5>
                <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <PlusIcon /> New Agent
                </Button>
            </div>
            {/* Desktop: No scroll area - filters flow naturally */}
            <div className="hidden md:flex items-center gap-2">
                <AgentsSearchFilter />
                {isAnyFilterModified && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                    >
                        <XCircleIcon className="h-4 w-4" />
                        Clear
                    </Button>
                )}
            </div>
            
            {/* Mobile: With scroll area for horizontal overflow */}
                <ScrollArea className="md:hidden w-full">
                <div className="flex items-center gap-2 p-1 min-w-max">
                    <AgentsSearchFilter />
                    {isAnyFilterModified && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                            className="bg-slate-800 text-white border-slate-600 hover:bg-slate-700 text-sm h-8 w-[80px]"
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