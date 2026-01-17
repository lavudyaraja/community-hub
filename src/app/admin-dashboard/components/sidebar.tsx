"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { getCurrentAdmin, isAdminAuthenticated, logoutAdmin, AdminData } from '@/lib/auth';
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  XCircle,
  ListChecks,
  Users,
  BarChart3,
  FileText,
  UserCircle,
  Mail,
  MapPin,
  Shield,
  LogOut,
  Menu,
  X,
  FlaskConical,
  Settings,
  AlertCircle,
} from 'lucide-react';

interface AdminSidebarProps {
  activeItem: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  category: string;
  badge?: { count: number; color: string };
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin-dashboard',
    category: 'main'
  },
  {
    id: 'pending',
    label: 'Pending Submissions',
    icon: Clock,
    href: '/admin-dashboard/pending-submissions',
    category: 'submissions'
  },
  {
    id: 'validated',
    label: 'Validated Submissions',
    icon: CheckCircle2,
    href: '/admin-dashboard/validated-submissions',
    category: 'submissions'
  },
  {
    id: 'rejected',
    label: 'Rejected Submissions',
    icon: XCircle,
    href: '/admin-dashboard/rejected-submissions',
    category: 'submissions'
  },
  {
    id: 'validation-queue',
    label: 'Validation Queue',
    icon: ListChecks,
    href: '/admin-dashboard/validation-queue',
    category: 'validation'
  },
  {
    id: 'validation-hub',
    label: 'Validation Hub',
    icon: FlaskConical,
    href: '/admin-dashboard/new-file',
    category: 'validation'
  },
  {
    id: 'volunteers',
    label: 'Volunteers',
    icon: Users,
    href: '/admin-dashboard/volunteers',
    category: 'management'
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    href: '/admin-dashboard/reports',
    category: 'analytics'
  },
  {
    id: 'guidelines',
    label: 'Guidelines / Ethics',
    icon: FileText,
    href: '/admin-dashboard/guidelines',
    category: 'management'
  }
];


export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeItem }) => {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved sidebar state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adminSidebarCollapsed');
      if (saved !== null) {
        const isCollapsedSaved = JSON.parse(saved);
        setIsCollapsed(isCollapsedSaved);
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--admin-sidebar-width', isCollapsedSaved ? '64px' : '280px');
        }
      } else {
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--admin-sidebar-width', '280px');
        }
      }
    }
  }, []);

  // Validate and load admin
  useEffect(() => {
    const validateAndLoadAdmin = () => {
      try {
        if (!isAdminAuthenticated()) {
          router.push('/auth/admin-auth/login');
          return;
        }

        const currentAdmin = getCurrentAdmin();
        
        if (!currentAdmin || !currentAdmin.email || !currentAdmin.name) {
          router.push('/auth/admin-auth/login');
          return;
        }

        setAdmin(currentAdmin);
        setIsLoading(false);
      } catch (error) {
        console.error('Error validating admin:', error);
        router.push('/auth/admin-auth/login');
      }
    };

    validateAndLoadAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    router.push('/auth/admin-auth/login');
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminSidebarCollapsed', JSON.stringify(newState));
    }
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--admin-sidebar-width', newState ? '64px' : '280px');
    }
  };

  const getBadgeColor = (color: string) => {
    const colors: Record<string, string> = {
      orange: 'bg-orange-500 text-white border-0',
      green: 'bg-green-500 text-white border-0',
      red: 'bg-red-500 text-white border-0',
      blue: 'bg-blue-500 text-white border-0',
      purple: 'bg-purple-500 text-white border-0'
    };
    return colors[color] || 'bg-gray-500 text-white border-0';
  };


  if (isLoading) {
    return (
      <div className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800 border-r-2 border-slate-600 flex items-center justify-center">
        <div className="text-sm text-slate-300">Loading...</div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div 
      className={`fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800 border-r-2 border-slate-600 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-72'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={`flex items-center h-16 border-b-2 border-slate-600 ${
          isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
        }`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center border-2 border-blue-400">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-slate-400">Control Center</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={`hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border-2 border-transparent hover:border-slate-500 ${isCollapsed ? '' : ''}`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <Menu className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className={`flex-1 overflow-y-auto py-4 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.label;

              return (
                <li key={item.id}>
                  <Link href={item.href} title={item.label}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full ${isCollapsed ? 'justify-center px-0' : 'justify-start'} relative ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-2 border-blue-400"
                          : "hover:bg-slate-700 text-slate-300 hover:text-white border-2 border-transparent hover:border-slate-500"
                      } transition-all`}
                    >
                      <Icon className={isCollapsed ? "h-5 w-5" : "h-4 w-4 mr-3"} />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <Badge className={`ml-2 ${getBadgeColor(item.badge.color)} text-xs px-2`}>
                              {item.badge.count}
                            </Badge>
                          )}
                        </>
                      )}
                      {isCollapsed && item.badge && (
                        <span className={`absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center rounded-full ${getBadgeColor(item.badge.color)}`}>
                          {item.badge.count > 99 ? '99+' : item.badge.count}
                        </span>
                      )}
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Profile Section */}
        <div className={`px-4 py-4 border-t-2 border-slate-600 ${isCollapsed ? 'px-2' : ''}`}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full hover:bg-slate-700 text-slate-300 hover:text-white border-2 border-transparent hover:border-slate-500 transition-all ${
                  isCollapsed ? 'justify-center px-0' : 'justify-start'
                }`}
                title={isCollapsed ? admin.name || 'Admin' : ''}
              >
                <Avatar className={`h-8 w-8 border-2 border-blue-400 ${isCollapsed ? '' : 'mr-3'}`}>
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold">
                    {getInitials(admin.name || 'Admin')}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-white truncate">{admin.name || 'Admin'}</p>
                      <p className="text-xs text-slate-400 capitalize">{admin.adminRole?.replace('_', ' ') || 'Admin'}</p>
                    </div>
                    <UserCircle className="h-4 w-4 ml-2 text-slate-400" />
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 border-2 border-slate-200 bg-white p-0" align="start" side="right">
              <div className="p-4">
                {/* Profile Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                  <Avatar className="h-12 w-12 border-2 border-blue-400 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                      {getInitials(admin.name || 'Admin')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-slate-900 truncate">
                      {admin.name || 'Admin'}
                    </p>
                    <p className="text-sm text-slate-600 capitalize mt-0.5">
                      {admin.adminRole?.replace('_', ' ') || 'Administrator'}
                    </p>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="space-y-2.5 pt-4">
                  {admin.email && (
                    <div className="flex items-start gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="p-1.5 bg-blue-500 rounded-md flex-shrink-0">
                        <Mail className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 mb-0.5">Email Address</p>
                        <p className="text-sm text-slate-900 truncate">{admin.email}</p>
                      </div>
                    </div>
                  )}

                  {admin.country && (
                    <div className="flex items-start gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="p-1.5 bg-purple-500 rounded-md flex-shrink-0">
                        <MapPin className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 mb-0.5">Location</p>
                        <p className="text-sm text-slate-900">{admin.country}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="p-1.5 bg-green-500 rounded-md flex-shrink-0">
                      <Shield className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-500 mb-0.5">Account Status</p>
                      <Badge className={`mt-0.5 ${admin.accountStatus === 'active' ? 'bg-green-500 text-white border-0' : 'bg-orange-500 text-white border-0'}`}>
                        {(admin.accountStatus || 'pending').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-200" />

              {/* Action Buttons */}
              <div className="p-4 space-y-2">
                <Link href="/admin-dashboard/profile" className="block">
                  <Button variant="outline" className="w-full justify-start border border-slate-200 hover:bg-slate-50 hover:border-blue-400 transition-colors">
                    <UserCircle className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </Link>
                <Link href="/admin-dashboard/settings" className="block">
                  <Button variant="outline" className="w-full justify-start border border-slate-200 hover:bg-slate-50 hover:border-purple-400 transition-colors">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 border-0 transition-all"
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
  );
};