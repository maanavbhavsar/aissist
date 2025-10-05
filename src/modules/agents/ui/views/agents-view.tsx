"use client";
import { useState } from "react";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "../components/data-table";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";
import { useAgentsFilters } from "../../hooks/use-agents-filters";
import { DataPagination } from "../components/data-pagination";

export const AgentsView = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const trpc = useTRPC();
    const [filters, setFilters] = useAgentsFilters();
    const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions(filters));
    
    return (
        <div className="flex-1 pb-4 px-8 flex flex-col gap-y-4">
            {/* Responsive Search Dialog */}
            <ResponsiveDialog
                open={isSearchOpen}
                onOpenChange={setIsSearchOpen}
                description="Find agents and meetings"
            >
                <div className="space-y-2">
                    {/* Search results will appear here when implemented */}
                </div>
            </ResponsiveDialog>

            {/* Data Table */}
            <DataTable 
                columns={columns} 
                data={data.items} 
                onRowClick={(agent) => {
                    console.log('Agent clicked:', agent);
                    // TODO: Navigate to agent details or open edit dialog
                }}
            />

            {/* Pagination */}
            <DataPagination 
                page={filters.page}
                totalPages={data.totalPages}
                onPageChange={(page) => setFilters({ page })}
            />

            {data.items.length === 0 && (
                <EmptyState title="No agents found" description="Create a new agent to get started. Join your meetings. Each agent will follow your instructions and will interact with you during the call." />
            )}
        </div>
    );
};

export const AgentsViewLoading = () => {
    return(
        <LoadingState title="Loading..." description="Loading agents, may take a few seconds..." />
    );
};

export const AgentsViewError = () => {
    return(
        <ErrorState title="Error Loading Agents" description="Something went wrong." />
    );
};
