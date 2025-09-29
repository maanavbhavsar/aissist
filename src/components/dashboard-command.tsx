"use client";

import { Dispatch, SetStateAction } from "react";
import { ResponsiveDialog } from "@/components/responsive-dialog";

interface DashboardCommandProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function DashboardCommand({ open, setOpen }: DashboardCommandProps) {
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      description="Search for meetings and agents"
      placeholder="Find a meeting or agent..."
    >
      <div className="space-y-2">
        {/* Search results will appear here when implemented */}
      </div>
    </ResponsiveDialog>
  );
}
