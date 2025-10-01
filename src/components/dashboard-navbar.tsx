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
    <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-6 py-4 flex items-center justify-between">
      {/* Left side - Collapse button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="hover:bg-slate-700/50 text-white"
        >
          <Menu className="w-5 h-5 text-white" />
        </Button>
      </div>

      {/* Center - Command Palette */}
      <div className="flex-1 max-w-md mx-8">
        <Button
          variant="outline"
          onClick={handleCommandPalette}
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700/50 border-slate-600 bg-slate-800/50"
        >
          <Search className="w-4 h-4 mr-3" />
          <span className="text-sm">Search agents, meetings...</span>
          <div className="ml-auto flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-xs bg-slate-700 text-slate-300 rounded border border-slate-600">
              ⌘
            </kbd>
            <kbd className="px-1.5 py-0.5 text-xs bg-slate-700 text-slate-300 rounded border border-slate-600">
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
