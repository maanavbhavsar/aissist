"use client";
import { useState } from "react";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const AgentsView = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions());
    
    return (
        <div className="space-y-6">
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

            {/* Agent Data Display */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Agent Data</h3>
                    <p className="text-sm text-slate-600">Raw JSON data from database:</p>
                </div>
                <pre className="bg-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>
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
