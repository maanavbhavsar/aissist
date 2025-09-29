"use client";

import { useState, useEffect, ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  trigger?: ReactNode;
  children: ReactNode;
  placeholder?: string;
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  title = "Search",
  description,
  trigger,
  children,
  placeholder = "Find a meeting or agent..."
}: ResponsiveDialogProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    // Mobile: Bottom drawer implementation
    return (
      <>
        {trigger}
        

        {/* Mobile Bottom Drawer */}
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
          <DialogPrimitive.Portal>
            {/* Mobile Overlay */}
            <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 z-40" />
            <div className={cn(
              "fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 transform transition-transform duration-300 ease-out",
              open ? "translate-y-0" : "translate-y-full"
            )}>
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 bg-slate-300 rounded-full" />
              </div>

              {/* Close button */}
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="w-8 h-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Header */}
              <div className="px-6 pt-4 pb-6">
                <div className="mb-6">
                  {description && (
                    <p className="text-sm text-slate-600">
                      {description}
                    </p>
                  )}
                </div>

                {/* Search Input */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                {/* Content */}
                <div className="max-h-64 overflow-y-auto">
                  {children}
                </div>
              </div>

              {/* Safe area for devices with home indicator */}
              <div className="h-4 bg-white" />
            </div>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </>
    );
  }

  // Desktop: Regular dialog implementation
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <DialogPrimitive.Trigger asChild>
          {trigger}
        </DialogPrimitive.Trigger>
      )}
      
      <DialogPrimitive.Portal>
        {/* Desktop Overlay */}
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/30 z-40" />
        
        <DialogPrimitive.Content className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
        )}>
          <DialogPrimitive.Title className="sr-only">Search Dialog</DialogPrimitive.Title>
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          {/* Header */}
          <div className="space-y-2">
            {description && (
              <DialogPrimitive.Description className="text-sm text-muted-foreground">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Content */}
          <div className="max-h-64 overflow-y-auto">
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
