"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardCommand } from "@/components/dashboard-command";
import { 
  Menu, 
  Search,
  Command
} from "lucide-react";

interface DashboardNavbarProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export function DashboardNavbar({ onToggleSidebar, isSidebarCollapsed }: DashboardNavbarProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const handleCommandPalette = () => {
    setIsCommandPaletteOpen(true);
  };

  return (
    <>
    <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      {/* Left side - Collapse button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="hover:bg-slate-100"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </Button>
      </div>

      {/* Center - Command Palette */}
      <div className="flex-1 max-w-md mx-8">
        <Button
          variant="outline"
          onClick={handleCommandPalette}
          className="w-full justify-start text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-slate-300"
        >
          <Search className="w-4 h-4 mr-3" />
          <span className="text-sm">Search agents, meetings...</span>
          <div className="ml-auto flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-600 rounded border border-slate-300">
              ⌘
            </kbd>
            <kbd className="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-600 rounded border border-slate-300">
              K
            </kbd>
          </div>
        </Button>
      </div>

      {/* Right side - Additional actions (can be expanded later) */}
      <div className="flex items-center gap-2">
        {/* Placeholder for future actions like notifications, user menu, etc. */}
      </div>
    </div>

    {/* Command Palette */}
    <DashboardCommand 
      open={isCommandPaletteOpen} 
      setOpen={setIsCommandPaletteOpen} 
    />
    </>
  );
}
