"use client";

import { Dispatch, SetStateAction, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { CommandDialog, CommandInput, CommandList, CommandGroup, CommandItem } from "@/components/ui/command";
import type { MeetingGetMany } from "@/modules/meetings/types";
import type { AgentGetMany } from "@/modules/agents/types";

interface DashboardCommandProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function DashboardCommand({ open, setOpen }: DashboardCommandProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const trpc = useTRPC();
  const lastExecutionRef = useRef<{ key: string; timestamp: number } | null>(null);

  const { data: meetingsData } = useQuery(
    trpc.meetings.getMany.queryOptions({
      search,
      pageSize: 100,
    })
  );

  const { data: agentsData } = useQuery(
    trpc.agents.getMany.queryOptions({
      search,
      pageSize: 100,
    })
  );

  const handleMeetingSelect = (meetingId: string) => {
    const now = Date.now();
    const lastExec = lastExecutionRef.current;
    const resourceKey = `meeting-${meetingId}`;
    
    // Prevent double execution within 100ms for the same resource type and ID
    if (lastExec?.key === resourceKey && now - lastExec.timestamp < 100) {
      return;
    }
    
    lastExecutionRef.current = { key: resourceKey, timestamp: now };
    router.push(`/dashboard/meetings/${meetingId}`);
    setOpen(false);
    setSearch(""); // Clear search on selection
  };

  const handleAgentSelect = (agentId: string) => {
    const now = Date.now();
    const lastExec = lastExecutionRef.current;
    const resourceKey = `agent-${agentId}`;
    
    // Prevent double execution within 100ms for the same resource type and ID
    if (lastExec?.key === resourceKey && now - lastExec.timestamp < 100) {
      return;
    }
    
    lastExecutionRef.current = { key: resourceKey, timestamp: now };
    router.push(`/dashboard/agents/${agentId}`);
    setOpen(false);
    setSearch(""); // Clear search on selection
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Clear search when dialog closes
      setSearch("");
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange} shouldFilter={false}>
      <CommandInput
        value={search}
        onValueChange={(val) => setSearch(val)}
        placeholder="Type to search agents and meetings"
      />
      <CommandList className="max-h-[400px]">
        <CommandGroup heading="Meetings">
          {meetingsData?.items?.length ? (
            meetingsData.items.map((meeting: MeetingGetMany["items"][0]) => (
              <CommandItem
                key={meeting.id}
                value={`meeting-${meeting.id}-${meeting.name}`}
                onSelect={(value) => {
                  // Only handle if it's the correct value
                  if (value === `meeting-${meeting.id}-${meeting.name}`) {
                    handleMeetingSelect(meeting.id);
                  }
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMeetingSelect(meeting.id);
                }}
                onPointerDown={(e) => {
                  // Handle pointer events as well
                  if (e.button === 0) { // Left mouse button
                    handleMeetingSelect(meeting.id);
                  }
                }}
                className="cursor-pointer hover:bg-accent/50"
              >
                {meeting.name}
              </CommandItem>
            ))
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">No meetings found</div>
          )}
        </CommandGroup>
        
        <CommandGroup heading="Agents">
          {agentsData?.items?.length ? (
            agentsData.items.map((agent: AgentGetMany["items"][0]) => (
              <CommandItem
                key={agent.id}
                value={`agent-${agent.id}-${agent.name}`}
                onSelect={(value) => {
                  // Only handle if it's the correct value
                  if (value === `agent-${agent.id}-${agent.name}`) {
                    handleAgentSelect(agent.id);
                  }
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAgentSelect(agent.id);
                }}
                onPointerDown={(e) => {
                  // Handle pointer events as well
                  if (e.button === 0) { // Left mouse button
                    handleAgentSelect(agent.id);
                  }
                }}
                className="cursor-pointer hover:bg-accent/50"
              >
                <GeneratedAvatar
                  variant="bot-neutral"
                  seed={agent.name}
                  className="size-4 mr-2"
                />
                {agent.name} (ID: {agent.id})
              </CommandItem>
            ))
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">No agents found</div>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
