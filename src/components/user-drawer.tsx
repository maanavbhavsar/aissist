"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  LogOut,
  X
} from "lucide-react";

interface UserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  userInitial: string;
  onSignOut: () => void;
}

export function UserDrawer({ 
  isOpen, 
  onClose, 
  userName, 
  userEmail, 
  userInitial, 
  onSignOut 
}: UserDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" />
      
      {/* Drawer */}
      <div 
        ref={drawerRef}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-out"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Close button */}
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* User Info */}
        <div className="px-6 pt-4 pb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-slate-900 font-bold text-xl">
              {userInitial}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800">
                {userName}
              </h3>
              <p className="text-sm text-slate-600">
                {userEmail}
              </p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="w-full justify-start h-12 text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="text-base">Logout</span>
            </Button>
          </div>
        </div>

        {/* Safe area for devices with home indicator */}
        <div className="h-4 bg-white" />
      </div>
    </>
  );
}
