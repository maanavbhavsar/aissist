"use client";

import { 
  CircleXIcon, 
  CircleCheckIcon, 
  ClockIcon, 
  VideoIcon, 
  LoaderIcon 
} from "lucide-react";
import { CommandSelect } from "@/components/ui/command-select";
import { MeetingStatus } from "../../types";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

const options = [
  {
    id: MeetingStatus.Upcoming,
    value: MeetingStatus.Upcoming,
    children: (
      <div className="flex items-center gap-2 capitalize">
        <ClockIcon className="h-4 w-4" />
        {MeetingStatus.Upcoming}
      </div>
    ),
  },
  {
    id: MeetingStatus.Completed,
    value: MeetingStatus.Completed,
    children: (
      <div className="flex items-center gap-2 capitalize">
        <CircleCheckIcon className="h-4 w-4" />
        {MeetingStatus.Completed}
      </div>
    ),
  },
  {
    id: MeetingStatus.Active,
    value: MeetingStatus.Active,
    children: (
      <div className="flex items-center gap-2 capitalize">
        <VideoIcon className="h-4 w-4" />
        {MeetingStatus.Active}
      </div>
    ),
  },
  {
    id: MeetingStatus.Processing,
    value: MeetingStatus.Processing,
    children: (
      <div className="flex items-center gap-2 capitalize">
        <LoaderIcon className="h-4 w-4" />
        {MeetingStatus.Processing}
      </div>
    ),
  },
  {
    id: MeetingStatus.Cancelled,
    value: MeetingStatus.Cancelled,
    children: (
      <div className="flex items-center gap-2 capitalize">
        <CircleXIcon className="h-4 w-4" />
        {MeetingStatus.Cancelled}
      </div>
    ),
  },
];

export const StatusFilter = () => {
  const [filters, setFilters] = useMeetingsFilters();

  return (
    <CommandSelect
      className="h-8 w-[140px] sm:w-[160px] md:w-[240px] bg-slate-800 text-white border-slate-600 text-sm"
      placeholder="Status"
      options={options}
      value={filters.status || ""}
      onSelect={(value) => setFilters({ status: value as MeetingStatus })}
    />
  );
};
