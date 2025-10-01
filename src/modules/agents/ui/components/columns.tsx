"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CornerDownRight } from "lucide-react"
import type { AgentGetOne } from "../../types"

const getAgentEmoji = (name: string) => {
  if (!name) return "🤖";
  
  const emojis = ["🤖", "👨‍💼", "👩‍💼", "🧑‍💻", "👨‍🔬", "👩‍🔬", "🧑‍🎓", "👨‍🏫", "👩‍🏫", "🧑‍⚕️", "👨‍⚕️", "👩‍⚕️"];
  const index = name.charCodeAt(0) % emojis.length;
  return emojis[index];
};

export const columns: ColumnDef<AgentGetOne>[] = [
  {
    accessorKey: "name",
    header: "Agent Name",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2">
            <Avatar className="size-6">
              <AvatarFallback>
                {getAgentEmoji(row.original.name as string)}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold capitalize text-white">{row.original.name as string}</span>
          </div>
          <div className="flex items-center gap-x-2">
            <CornerDownRight className="size-3 text-slate-400" />
            <span className="text-sm text-slate-400 max-w-[200px] truncate capitalize">
              {row.original.instructions as string}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "meetingCount",
    header: "Meetings",
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="flex items-center gap-x-2 border-blue-400 text-blue-300 bg-blue-900/30">
          <svg className="size-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 10h-2v2h2v-2zm4-8H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l2 2V4c0-1.1-.9-2-2-2zM8 15c0 .55-.45 1-1 1s-1-.45-1-1v-2H3v2c0 1.1.9 2 2 2s2-.9 2-2v-2H8v2zM9 11H3c0-1.1.9-2 2-2s2 .9 2 2z"/>
          </svg>
          {(row.original.meetingCount as number) || 5} {(row.original.meetingCount as number) === 1 ? 'meeting' : 'meetings'}
        </Badge>
      );
    },
  },
]