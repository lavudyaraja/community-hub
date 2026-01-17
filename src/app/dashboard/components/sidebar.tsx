"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Eye
} from 'lucide-react';

interface SidebarProps {
  activeItem: string;
}

const menuItems = [
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
  const [isLoading, setIsLoading] = useState(true);

  // Load saved sidebar state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved !== null) {
        const isCollapsedSaved = JSON.parse(saved);
        setIsCollapsed(isCollapsedSaved);
        // Set CSS variable
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--sidebar-width', isCollapsedSaved ? '64px' : '256px');
        }
      } else {
        // Default: set CSS variable for expanded state
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--sidebar-width', '256px');
        }
      }
    }
  }, []);

  // Enhanced validation and user loading
  useEffect(() => {
    const validateAndLoadUser = () => {
      try {
        // Check if user is authenticated
        if (!isAuthenticated()) {
          router.push('/auth/login');
          return;
        }

        // Get current user
        const currentUser = getCurrentUser();
        
        // Validate user data
        if (!currentUser) {
          router.push('/auth/login');
          return;
        }

        // Validate required fields
        if (!currentUser.email || !currentUser.name) {
          router.push('/auth/login');
          return;
        }

        setUser(currentUser);
        setIsLoading(false);
      } catch (error) {
        console.error('Error validating user:', error);
        router.push('/auth/login');
      }
    };

    validateAndLoadUser();
  }, [router]);

  const handleLogout = () => {
    authLogout();
    router.push('/auth/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    // Store state in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    }
    // Update CSS variable for main content
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--sidebar-width', newState ? '64px' : '256px');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div 
      className={`fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo/Header with Menu Icon */}
        <div className={`flex items-center h-16 border-b border-gray-200 ${
          isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
        }`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">DataHub</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={`hover:bg-gray-100 ${isCollapsed ? '' : 'ml-auto'}`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <Menu className="h-5 w-5 text-gray-700" />
            ) : (
              <X className="h-5 w-5 text-gray-700" />
            )}
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className={`flex-1 py-4 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.label;

              return (
                <li key={item.id}>
                  <Link href={item.href} title={isCollapsed ? item.label : ''}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full ${
                        isCollapsed ? "justify-center px-0" : "justify-start"
                      } ${
                        isActive
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Profile Button with Popover */}
        <div className={`px-4 py-4 border-t border-gray-200 ${isCollapsed ? 'px-2' : ''}`}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full hover:bg-gray-100 text-gray-700 ${
                  isCollapsed ? 'justify-center px-0' : 'justify-start'
                }`}
                title={isCollapsed ? user.name || 'User' : ''}
              >
                <Avatar className={`h-8 w-8 ${isCollapsed ? '' : 'mr-3'}`}>
                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                    {getInitials(user.name || 'User')}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{user.name || 'User'}</span>
                    <UserCircle className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start" side="right">
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getInitials(user.name || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">Data Contributor</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {user.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm text-gray-900 truncate">{user.email}</p>
                      </div>
                    </div>
                  )}

                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm text-gray-900">{user.phone}</p>
                      </div>
                    </div>
                  )}

                  {user.region && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Region</p>
                        <p className="text-sm text-gray-900">{user.region}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Link href="/dashboard/profile">
                    <Button variant="outline" className="w-full justify-start">
                      <UserCircle className="h-4 w-4 mr-2" />
                      View Full Profile
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

      </div>
    </div>
  );
};