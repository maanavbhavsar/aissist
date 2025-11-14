"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { CornerDownRight, CircleCheck, CircleX, CircleArrowUp, Clock, Loader } from "lucide-react"
import { format } from "date-fns"
import { cn, formatDuration } from "@/lib/utils"
import { GeneratedAvatar } from "@/components/generated-avatar"
import type { MeetingGetMany } from "../../types"

const statusIconMap = {
  upcoming: CircleArrowUp,
  active: CircleCheck,
  completed: CircleCheck,
  processing: Loader,
  cancelled: CircleX,
};

const statusColorMap = {
  upcoming: "bg-yellow-500/20 text-yellow-800 border-yellow-800/5",
  active: "bg-blue-500/20 text-blue-800 border-blue-800/5",
  completed: "bg-emerald-500/20 text-emerald-800 border-emerald-800/5",
  cancelled: "bg-rose-500/20 text-rose-800 border-rose-800/5",
  processing: "bg-gray-300/20 text-gray-800 border-gray-800/5",
};

export const columns: ColumnDef<MeetingGetMany["items"][number]>[] = [
  {
    accessorKey: "name",
    header: "Meeting Name",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-y-1">
          <span className="font-semibold capitalize text-white truncate">{row.original.name}</span>
          <div className="flex items-center gap-x-1">
            <CornerDownRight className="size-3 text-slate-400 flex-shrink-0" />
            <span className="text-sm text-slate-300 truncate">{row.original.agent.name}</span>
          </div>
          <div className="flex items-center gap-x-2">
            <GeneratedAvatar
              variant="bot-neutral"
              seed={row.original.agent.name}
              className="size-4 flex-shrink-0"
            />
            <span className="text-sm text-slate-400">
              {row.original.startedAt ? format(new Date(row.original.startedAt), "MMM d") : ""}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const Icon = statusIconMap[row.original.status as keyof typeof statusIconMap];
      
      return (
        <Badge
          variant="outline"
          className={cn("capitalize", statusColorMap[row.original.status as keyof typeof statusColorMap])}
        >
          <Icon
            className={cn(
              "size-4 text-slate-400",
              row.original.status === "processing" && "animate-spin"
            )}
          />
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      return (
        <Badge
          variant="outline"
          className="capitalize text-white border-white/30"
        >
          <Clock className="size-4 text-white flex items-center gap-x-2" />
          {row.original.duration ? formatDuration(row.original.duration) : "No duration"}
        </Badge>
      );
    },
  },
]
