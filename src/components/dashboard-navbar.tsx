"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DashboardCommand } from "@/components/dashboard-command";
import { 
  Menu, 
  Search
} from "lucide-react";

interface DashboardNavbarProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export function DashboardNavbar({ onToggleSidebar }: DashboardNavbarProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const handleCommandPalette = () => {
    setIsCommandPaletteOpen(true);
  };

  // Keyboard shortcut: Cmd+K / Ctrl+K to open command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      // ESC to close
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen]);

  return (
    <>
    <div className="bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-sm border-b border-cyan-500/20 px-4 sm:px-6 py-4 flex items-center justify-between shadow-lg shadow-cyan-500/5">
      {/* Left side - Collapse button */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="hover:bg-slate-700/50 text-white"
        >
          <Menu className="w-5 h-5 text-white" />
        </Button>
      </div>

      {/* Center - Command Palette - Centered */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-md">
          <Button
            variant="outline"
            onClick={handleCommandPalette}
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700/60 border-cyan-500/30 bg-gradient-to-br from-slate-800/60 to-slate-900/60 hover:border-cyan-500/50 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <Search className="w-4 h-4 mr-2 sm:mr-3" />
            <span className="text-xs sm:text-sm hidden sm:inline">Search agents, meetings...</span>
            <span className="text-xs sm:hidden">Search...</span>
            <div className="ml-auto flex items-center gap-1 hidden sm:flex">
              <kbd className="px-1.5 py-0.5 text-xs bg-slate-700 text-slate-300 rounded border border-slate-600">
                ⌘
              </kbd>
              <kbd className="px-1.5 py-0.5 text-xs bg-slate-700 text-slate-300 rounded border border-slate-600">
                K
              </kbd>
            </div>
          </Button>
        </div>
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
