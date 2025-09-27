"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { 
  Video, 
  Briefcase, 
  Star, 
  User,
  ChevronDown,
  CreditCard,
  LogOut
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Redirect to sign-in if no session (avoid setState in render cycle)
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        }
      }
    });
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img src="/aissist_colored_only.png" alt="AIssist" className="w-6 h-6 hover:drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] transition-all duration-300 cursor-pointer" />
            <span className="text-xl font-bold text-white">AIssist</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6">
          <ul className="space-y-4">
            <li>
              <a href="/dashboard" className="flex items-center gap-3 text-slate-300 hover:text-cyan-400 transition-colors">
                <Video className="w-5 h-5" />
                <span>Meetings</span>
              </a>
            </li>
            <li>
              <a href="/dashboard" className="flex items-center gap-3 text-slate-300 hover:text-cyan-400 transition-colors">
                <Briefcase className="w-5 h-5" />
                <span>Agents</span>
              </a>
            </li>
            <li>
              <a href="/dashboard" className="flex items-center gap-3 text-slate-300 hover:text-cyan-400 transition-colors">
                <Star className="w-5 h-5" />
                <span>Upgrade</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-6">
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={toggleUserMenu}
              className="w-full border border-slate-700 rounded-lg p-4 bg-slate-800 hover:bg-slate-750 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-slate-900 font-bold">
                  {session.user.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-medium">
                    {session.user.name || 'User'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                {/* User Information */}
                <div className="p-4 border-b border-slate-200">
                  <p className="font-semibold text-slate-800">
                    {session.user.name || 'User'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {session.user.email}
                  </p>
                </div>
                
                {/* Menu Items */}
                <div className="py-1">
                  <button className="flex items-center w-full px-4 py-2 text-slate-700 hover:bg-slate-100 transition-colors">
                    <CreditCard className="w-4 h-4 mr-3" />
                    <span>Billing</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2 text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-slate-50">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-800">
              Welcome back, {session.user.name}
            </h1>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
