"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { CommandSelect } from "@/components/ui/command-select";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { AgentGetMany } from "@/modules/agents/types";

export const AgentIdFilter = () => {
  const [filters, setFilters] = useMeetingsFilters();
  const [agentSearch, setAgentSearch] = useState("");

  const { data } = useQuery({
    ...useTRPC().agents.getMany.queryOptions({
      pageSize: 100,
      search: agentSearch,
    }),
  });

  return (
    <CommandSelect
      className="h-8 w-[140px] sm:w-[160px] md:w-[240px] bg-slate-800 text-white border-slate-600 text-sm"
      placeholder="Agent"
      options={
        (Array.isArray((data as any)?.items) ? (data as any).items : []).map((agent: AgentGetMany["items"][0]) => ({
          id: agent.id as string,
          value: agent.id,
          children: (
            <div className="flex items-center gap-2">
              <GeneratedAvatar
                seed={agent.name}
                variant="bot-neutral"
                className="size-4"
              />
              {agent.name}
            </div>
          ),
        })) || []
      }
      value={filters.agentId || ""}
      onSelect={(value) => setFilters({ agentId: value })}
      onSearch={setAgentSearch}
    />
  );
};
