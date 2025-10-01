"use client";

import { useState } from "react";
import { NewAgentDialog } from "./new-agent-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon } from "lucide-react";

export const AgentsListHeader = () => {
    const [open, setDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <> 
        <NewAgentDialog open={open} onOpenChange={setDialogOpen} />
        <div className="py-4 px-4 md:px-8 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h5 className="font-medium text-xl">My Agents</h5>
                <Button onClick={() => setDialogOpen(true)}>
                    <PlusIcon /> New Agent
                </Button>
            </div>
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>
        </div>
        </>
    );
};