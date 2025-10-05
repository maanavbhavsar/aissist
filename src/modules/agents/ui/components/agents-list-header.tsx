"use client";

import { useState } from "react";
import { NewAgentDialog } from "./new-agent-dialog";
import { AgentsSearchFilter } from "./agents-search-filter";
import { Button } from "@/components/ui/button";
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
        <div className="py-4 px-4 md:px-8 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h5 className="font-medium text-xl text-white">My Agents</h5>
                <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <PlusIcon /> New Agent
                </Button>
            </div>
            <div className="flex items-center gap-2 p-1">
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
        </div>
        </>
    );
};