"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

export const MeetingsSearchFilter = () => {
  const [filters, setFilters] = useMeetingsFilters();

  return (
    <div className="relative">
      <Input
        placeholder="Filter by name"
        className="h-8 w-[140px] sm:w-[160px] md:w-[240px] bg-slate-800 text-white border-slate-600 placeholder:text-slate-400 pl-6 text-sm"
        value={filters.search}
        onChange={(event) => setFilters({ search: event.target.value })}
      />
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
};
