"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  User,
  UserCircle,
  Mail,
  MapPin,
  Shield,
  LogOut,
  Menu,
  X,
  FlaskConical
} from 'lucide-react';

interface AdminSidebarProps {
  activeItem: string;
}

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin-dashboard'
  },
  {
    id: 'pending',
    label: 'Pending Submissions',
    icon: Clock,
    href: '/admin-dashboard/pending-submissions'
  },
  {
    id: 'validated',
    label: 'Validated Submissions',
    icon: CheckCircle2,
    href: '/admin-dashboard/validated-submissions'
  },
  {
    id: 'rejected',
    label: 'Rejected Submissions',
    icon: XCircle,
    href: '/admin-dashboard/rejected-submissions'
  },
  {
    id: 'validation-queue',
    label: 'Validation Queue',
    icon: ListChecks,
    href: '/admin-dashboard/validation-queue'
  },
  {
    id: 'validation-hub',
    label: 'Validation Hub',
    icon: FlaskConical,
    href: '/admin-dashboard/new-file'
  },
  {
    id: 'volunteers',
    label: 'Volunteers',
    icon: Users,
    href: '/admin-dashboard/volunteers'
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    href: '/admin-dashboard/reports'
  },
  {
    id: 'guidelines',
    label: 'Guidelines / Ethics',
    icon: FileText,
    href: '/admin-dashboard/guidelines'
  }
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeItem }) => {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved sidebar state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adminSidebarCollapsed');
      if (saved !== null) {
        const isCollapsedSaved = JSON.parse(saved);
        setIsCollapsed(isCollapsedSaved);
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--admin-sidebar-width', isCollapsedSaved ? '64px' : '256px');
        }
      } else {
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--admin-sidebar-width', '256px');
        }
      }
    }
  }, []);

  // Enhanced validation and admin loading
  useEffect(() => {
    const validateAndLoadAdmin = () => {
      try {
        // Check if admin is authenticated
        if (!isAdminAuthenticated()) {
          router.push('/auth/admin-auth/login');
          return;
        }

        // Get current admin
        const currentAdmin = getCurrentAdmin();
        
        // Validate admin data
        if (!currentAdmin) {
          router.push('/auth/admin-auth/login');
          return;
        }

        // Validate required fields
        if (!currentAdmin.email || !currentAdmin.name) {
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
  }, [router]);

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
      document.documentElement.style.setProperty('--admin-sidebar-width', newState ? '64px' : '256px');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800 border-r border-slate-600/50 flex items-center justify-center">
        <div className="text-sm text-slate-300">Loading...</div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div 
      className={`fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800 border-r border-slate-600/50 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo/Header with Menu Icon */}
        <div className={`flex items-center h-16 border-b border-slate-600/50 ${
          isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
        }`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">Admin Panel</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={`hover:bg-slate-700/50 text-slate-300 hover:text-white ${isCollapsed ? '' : 'ml-auto'}`}
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
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                          : "hover:bg-slate-700/50 text-slate-300 hover:text-white"
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
        <div className={`px-4 py-4 border-t border-slate-600/50 ${isCollapsed ? 'px-2' : ''}`}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full hover:bg-slate-700/50 text-slate-300 hover:text-white ${
                  isCollapsed ? 'justify-center px-0' : 'justify-start'
                }`}
                title={isCollapsed ? admin.name || 'Admin' : ''}
              >
                <Avatar className={`h-8 w-8 ${isCollapsed ? '' : 'mr-3'}`}>
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                    {getInitials(admin.name || 'Admin')}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate text-white">{admin.name || 'Admin'}</span>
                    <UserCircle className="h-4 w-4 ml-2 text-slate-300" />
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 border-0 bg-white/95 backdrop-blur-sm" align="start" side="right">
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {getInitials(admin.name || 'Admin')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {admin.name || 'Admin'}
                    </p>
                    <p className="text-xs text-slate-600 capitalize">
                      {admin.adminRole?.replace('_', ' ') || 'Administrator'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {admin.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="text-sm text-slate-900 truncate">{admin.email}</p>
                      </div>
                    </div>
                  )}

                  {admin.country && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500">Country / Region</p>
                        <p className="text-sm text-slate-900">{admin.country}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-slate-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500">Account Status</p>
                      <Badge className={admin.accountStatus === 'active' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'}>
                        {admin.accountStatus || 'pending'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <Link href="/admin-dashboard/profile">
                    <Button variant="outline" className="w-full justify-start border-slate-200 hover:bg-slate-50">
                      <UserCircle className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 border-0"
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
