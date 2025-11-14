"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { UserDrawer } from "@/components/user-drawer";
import { 
  Video, 
  Briefcase, 
  ChevronDown,
  LogOut
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Mobile detection
  useEffect(() => {
    if (!isClient) return;
    
    const checkMobile = () => {
      const isMobileSize = window.innerWidth < 768;
      setIsMobile(isMobileSize);
      
      // On mobile, always start with sidebar closed
      if (isMobileSize) {
        setIsSidebarCollapsed(true);
      }
      // On desktop, expand sidebar when switching from mobile
      else if (!isMobileSize) {
        setIsSidebarCollapsed(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isClient]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <Image 
            src="/Science.png" 
            alt="Loading" 
            width={64} 
            height={64}
            className="animate-spin-slow"
            style={{ animationDuration: '3s' }}
          />
          <p className="text-xl font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Loading...</p>
        </div>
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

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative z-auto">
      {/* Mobile backdrop */}
      {isMobile && !isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}
      
      {/* Sidebar - Independent like meow.ai */}
      <div className={`${isMobile ? 'w-64' : (isSidebarCollapsed ? 'w-20' : 'w-64')} ${isMobile ? 'fixed left-0 top-0 z-50 h-screen' : 'relative'} bg-slate-950 text-white flex flex-col transition-all duration-300 min-h-screen ${isMobile && isSidebarCollapsed ? '-translate-x-full' : ''}`}>
        {/* Logo Section */}
        <div className={`${isSidebarCollapsed ? 'p-4' : 'p-6'} border-b border-slate-800/50`}>
          <Link href="/dashboard" className="flex items-center justify-center">
            {isSidebarCollapsed ? (
              <img src="/Aissist Logo.png" alt="AIssist" className="h-12 w-auto logo-glow cursor-pointer object-contain max-w-12" />
            ) : (
              <div className="flex items-center gap-3 w-full">
                <img src="/Aissist Logo.png" alt="AIssist" className="h-12 w-auto logo-glow cursor-pointer flex-shrink-0 object-contain max-w-12" />
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">AIssist</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${isSidebarCollapsed ? 'p-2' : 'p-6'}`}>
          <ul className="space-y-4">
            <li>
              <Link href="/dashboard/meetings" className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} text-slate-300 hover:text-cyan-400 transition-all duration-300 hover:translate-x-1 px-3 py-2 rounded-lg hover:bg-slate-800/50 group relative`}>
                <div className={`flex items-center ${isSidebarCollapsed ? 'gap-0' : 'gap-3'}`}>
                  <Video className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  {!isSidebarCollapsed && <span className="font-medium">Meetings</span>}
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex items-center gap-1">
                    <Image 
                      src="/Science.png" 
                      alt="" 
                      width={12} 
                      height={12} 
                      className="animate-bounce-slow opacity-60"
                      style={{ animationDelay: '0s' }}
                    />
                    <Image 
                      src="/Science.png" 
                      alt="" 
                      width={12} 
                      height={12} 
                      className="animate-bounce-slow opacity-60"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                )}
              </Link>
            </li>
            <li>
              <Link href="/dashboard/agents" className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} text-slate-300 hover:text-cyan-400 transition-all duration-300 hover:translate-x-1 px-3 py-2 rounded-lg hover:bg-slate-800/50 group relative`}>
                <div className={`flex items-center ${isSidebarCollapsed ? 'gap-0' : 'gap-3'}`}>
                  <Briefcase className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  {!isSidebarCollapsed && <span className="font-medium">Agents</span>}
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex items-center gap-1">
                    <Image 
                      src="/Science.png" 
                      alt="" 
                      width={12} 
                      height={12} 
                      className="animate-bounce-slow opacity-60"
                      style={{ animationDelay: '0s' }}
                    />
                    <Image 
                      src="/Science.png" 
                      alt="" 
                      width={12} 
                      height={12} 
                      className="animate-bounce-slow opacity-60"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                )}
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Profile - Push to bottom */}
        <div className="mt-auto">
          <div className={`${isSidebarCollapsed ? 'p-2 pb-4' : 'p-6 pb-4'}`}>
            <div className="relative" ref={userMenuRef}>
            <button
              onClick={toggleUserMenu}
              className={`w-full border border-cyan-500/30 rounded-lg bg-gradient-to-br from-slate-800/90 to-slate-900/90 hover:from-slate-700/90 hover:to-slate-800/90 hover:border-cyan-500/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-lg shadow-cyan-500/10 hover:shadow-xl hover:shadow-cyan-500/20 ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}
            >
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                <div className={`bg-yellow-400 rounded-full flex items-center justify-center text-slate-900 font-bold ${isSidebarCollapsed ? 'w-8 h-8' : 'w-10 h-10'}`}>
                  {session.user.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                {!isSidebarCollapsed && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">
                        {session.user.name || 'User'}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </>
                )}
              </div>
            </button>

            {/* Desktop Dropdown Menu */}
            {isUserMenuOpen && !isMobile && (
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
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <DashboardNavbar 
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        
        {/* Page Content */}
        <div className="flex-1 bg-transparent min-w-0 overflow-x-hidden relative z-10">
          <div className={`${isMobile ? 'p-2 sm:p-4' : 'p-6'}`}>
            {children}
          </div>
        </div>
      </div>

      {/* Mobile User Drawer */}
      <UserDrawer
        isOpen={isUserMenuOpen && isMobile}
        onClose={() => setIsUserMenuOpen(false)}
        userName={session.user.name || 'User'}
        userEmail={session.user.email}
        userInitial={session.user.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
