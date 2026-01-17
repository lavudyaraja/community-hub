"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { getCurrentUser, isAuthenticated, logout as authLogout, UserData } from '@/lib/auth';
import {
  LayoutDashboard,
  Upload,
  FileText,
  BarChart3,
  HelpCircle,
  User,
  UserCircle,
  Mail,
  Phone,
  MapPin,
  LogOut,
  Menu,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  // Settings,
  Bell,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface SidebarProps {
  activeItem: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  disabled?: boolean;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard'
  },
  {
    id: 'upload',
    label: 'Upload Data',
    icon: Upload,
    href: '/dashboard/upload'
  },
  {
    id: 'submissions',
    label: 'My Submissions',
    icon: FileText,
    href: '/dashboard/submissions'
  },
  {
    id: 'dataset-preview',
    label: 'Dataset Preview',
    icon: Eye,
    href: '/dashboard/dataset-preview'
  },
  {
    id: 'status',
    label: 'Submission Status',
    icon: BarChart3,
    href: '/dashboard/status'
  },
  {
    id: 'help',
    label: 'Help / Guidelines',
    icon: HelpCircle,
    href: '/dashboard/help'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ activeItem }) => {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Initialize sidebar state and CSS variables
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sidebarCollapsed');
        const isCollapsedSaved = saved ? JSON.parse(saved) : false;
        setIsCollapsed(isCollapsedSaved);
        updateSidebarWidth(isCollapsedSaved);
      } catch (error) {
        console.error('Error loading sidebar state:', error);
        updateSidebarWidth(false);
      }
    }
  }, []);

  // Validate authentication and load user
  useEffect(() => {
    const validateAndLoadUser = async () => {
      try {
        if (!isAuthenticated()) {
          router.push('/auth/login');
          return;
        }

        const currentUser = getCurrentUser();
        
        if (!currentUser || !currentUser.email || !currentUser.name) {
          toast.error('Session expired', {
            description: 'Please login again'
          });
          router.push('/auth/login');
          return;
        }

        setUser(currentUser);
        // Load notification count
        loadNotificationCount(currentUser.email);
      } catch (error) {
        console.error('Error validating user:', error);
        toast.error('Authentication error');
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    validateAndLoadUser();
  }, [router]);

  // Load notification count
  const loadNotificationCount = async (userEmail: string) => {
    try {
      const response = await fetch(`/api/notifications?userEmail=${encodeURIComponent(userEmail)}&countOnly=true`);
      if (response.ok) {
        const data = await response.json();
        setUnreadNotificationCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  // Refresh notification count periodically
  useEffect(() => {
    if (!user?.email) return;

    const interval = setInterval(() => {
      loadNotificationCount(user.email);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user?.email]);

  // Handle window resize for mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [activeItem]);

  const updateSidebarWidth = (collapsed: boolean) => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty(
        '--sidebar-width', 
        collapsed ? '64px' : '256px'
      );
    }
  };

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
      }
      updateSidebarWidth(newState);
      toast.success(newState ? 'Sidebar collapsed' : 'Sidebar expanded');
    } catch (error) {
      console.error('Error saving sidebar state:', error);
    }
  };

  const handleLogout = () => {
    try {
      authLogout();
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Error logging out');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleMobileMenu}
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Sidebar */}
      <TooltipProvider delayDuration={300}>
        <div
          className={`fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
            isCollapsed ? 'w-16' : 'w-64'
          } ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div
              className={`flex items-center h-16 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 ${
                isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
              }`}
            >
              {!isCollapsed && (
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <LayoutDashboard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-white">DataHub</span>
                    <span className="text-[10px] text-blue-100">Data Management</span>
                  </div>
                </div>
              )}
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className={`text-white ${isCollapsed ? '' : 'ml-auto'}`}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Navigation Menu */}
            <nav className={`flex-1 overflow-y-auto py-4 ${isCollapsed ? 'px-2' : 'px-3'}`}>
              <ul className="space-y-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.label;

                  const MenuButton = (
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      disabled={item.disabled}
                      className={`w-full transition-all duration-200 ${
                        isCollapsed ? "justify-center px-2" : "justify-start px-3"
                      } ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-700"
                      } ${
                        item.disabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'} ${isActive ? 'text-white' : ''}`} />
                      {!isCollapsed && (
                        <span className="flex-1 text-left">{item.label}</span>
                      )}
                      {!isCollapsed && item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  );

                  return (
                    <li key={item.id}>
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={item.disabled ? '#' : item.href}>
                              {MenuButton}
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {item.label}
                            {item.badge && ` (${item.badge})`}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Link href={item.disabled ? '#' : item.href}>
                          {MenuButton}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>

              {!isCollapsed && (
                <>
                  <Separator className="my-4" />
                  
                  {/* Quick Actions */}
                  <div className="px-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Quick Actions</p>
                    <div className="space-y-1.5">
                      {/* <Link href="/dashboard/settings">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-gray-700"
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Settings
                        </Button>
                      </Link> */}
                      <Link href="/dashboard/notifications">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-gray-700"
                        >
                          <Bell className="h-4 w-4 mr-3" />
                          Notifications
                          {unreadNotificationCount > 0 && (
                            <Badge variant="destructive" className="ml-auto text-xs">
                              {unreadNotificationCount}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </nav>

            {/* Profile Section */}
            <div className={`border-t border-gray-200 bg-gray-50 ${isCollapsed ? 'p-2' : 'p-4'}`}>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-center p-2 hover:bg-gray-200"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-600 text-white text-xs">
                              {getInitials(user.name || 'User')}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {user.name} - View Profile
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button
                      variant="ghost"
                      className="w-full justify-start hover:bg-gray-200 p-3 h-auto"
                    >
                      <Avatar className="h-9 w-9 mr-3">
                        <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">
                          {getInitials(user.name || 'User')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">View profile</p>
                      </div>
                      <UserCircle className="h-4 w-4 text-gray-400" />
                    </Button>
                  )}
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start" side="right">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-14 w-14 ring-2 ring-blue-300">
                        <AvatarFallback className="bg-blue-600 text-white text-lg font-bold">
                          {getInitials(user.name || 'User')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-blue-700">Data Contributor</p>
                        <Badge variant="secondary" className="mt-1 text-xs bg-blue-200 text-blue-800">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {user.email && (
                      <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <Mail className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 mb-0.5">Email Address</p>
                          <p className="text-sm text-gray-900 truncate">{user.email}</p>
                        </div>
                      </div>
                    )}

                    {user.phone && (
                      <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <Phone className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 mb-0.5">Phone Number</p>
                          <p className="text-sm text-gray-900">{user.phone}</p>
                        </div>
                      </div>
                    )}

                    {user.region && (
                      <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 mb-0.5">Region</p>
                          <p className="text-sm text-gray-900">{user.region}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="p-3 space-y-1">
                    <Link href="/dashboard/profile" onClick={() => setIsPopoverOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start hover:bg-blue-50 hover:text-blue-700">
                        <UserCircle className="h-4 w-4 mr-2" />
                        View Full Profile
                      </Button>
                    </Link>
                    {/* <Link href="/dashboard/settings" onClick={() => setIsPopoverOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start hover:bg-blue-50 hover:text-blue-700">
                        <Settings className="h-4 w-4 mr-2" />
                        Account Settings
                      </Button>
                    </Link> */}
                    <Separator className="my-2" />
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </>
  );
};