"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminSidebar } from './components/sidebar';
import { getCurrentAdmin, isAdminAuthenticated } from '@/lib/auth';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  BarChart3,
  TrendingUp,
  AlertCircle,
  ListChecks
} from 'lucide-react';

const AdminDashboard = () => {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState({
    totalSubmissions: 0,
    pendingSubmissions: 0,
    validatedSubmissions: 0,
    rejectedSubmissions: 0,
    totalVolunteers: 0,
    todaySubmissions: 0,
    validationQueue: 0,
  });

  useEffect(() => {
    // Check admin authentication
    if (!isAdminAuthenticated()) {
      router.push('/auth/admin-auth/login');
      return;
    }

    const currentAdmin = getCurrentAdmin();
    if (!currentAdmin) {
      router.push('/auth/admin-auth/login');
      return;
    }

    setAdmin(currentAdmin);
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to empty data on error
      setDashboardData({
        totalSubmissions: 0,
        pendingSubmissions: 0,
        validatedSubmissions: 0,
        rejectedSubmissions: 0,
        totalVolunteers: 0,
        todaySubmissions: 0,
        validationQueue: 0,
      });
    }
  };

  if (!admin) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <AdminSidebar activeItem="Dashboard" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <AdminSidebar activeItem="Dashboard" />

      {/* Main Content */}
      <div className="flex-1" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">Admin Dashboard</h1>
            <p className="text-slate-600">Welcome back, {admin.name}! Here's your overview.</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-none bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">Total Submissions</CardTitle>
                <FileText className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{dashboardData.totalSubmissions}</div>
                <p className="text-xs text-white/70 mt-1">
                  All time submissions
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">Pending Submissions</CardTitle>
                <Clock className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{dashboardData.pendingSubmissions}</div>
                <p className="text-xs text-white/70 mt-1">
                  Awaiting validation
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">Validated Submissions</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{dashboardData.validatedSubmissions}</div>
                <p className="text-xs text-white/70 mt-1">
                  Approved submissions
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-gradient-to-br from-rose-500 to-pink-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">Rejected Submissions</CardTitle>
                <XCircle className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{dashboardData.rejectedSubmissions}</div>
                <p className="text-xs text-white/70 mt-1">
                  Rejected submissions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-none bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">Validation Queue</CardTitle>
                <AlertCircle className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{dashboardData.validationQueue}</div>
                <p className="text-xs text-white/70 mt-1">
                  Items in queue
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">Total Volunteers</CardTitle>
                <Users className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{dashboardData.totalVolunteers}</div>
                <p className="text-xs text-white/70 mt-1">
                  Registered users
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">Today's Submissions</CardTitle>
                <TrendingUp className="h-4 w-4 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{dashboardData.todaySubmissions}</div>
                <p className="text-xs text-white/70 mt-1">
                  Submissions today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-none bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <BarChart3 className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <a href="/admin-dashboard/pending-submissions" className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 hover:from-amber-100 hover:to-orange-100 transition-all duration-200">
                  <Clock className="h-6 w-6 text-amber-600 mb-2" />
                  <h3 className="font-semibold text-sm text-slate-800">Review Pending</h3>
                  <p className="text-xs text-slate-600 mt-1">Check pending submissions</p>
                </a>
                <a href="/admin-dashboard/validation-queue" className="p-5 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200/50 hover:from-cyan-100 hover:to-blue-100 transition-all duration-200">
                  <ListChecks className="h-6 w-6 text-cyan-600 mb-2" />
                  <h3 className="font-semibold text-sm text-slate-800">Validation Queue</h3>
                  <p className="text-xs text-slate-600 mt-1">Process validation queue</p>
                </a>
                <a href="/admin-dashboard/volunteers" className="p-5 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200/50 hover:from-violet-100 hover:to-purple-100 transition-all duration-200">
                  <Users className="h-6 w-6 text-violet-600 mb-2" />
                  <h3 className="font-semibold text-sm text-slate-800">Manage Volunteers</h3>
                  <p className="text-xs text-slate-600 mt-1">View all volunteers</p>
                </a>
                <a href="/admin-dashboard/reports" className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50 hover:from-emerald-100 hover:to-teal-100 transition-all duration-200">
                  <BarChart3 className="h-6 w-6 text-emerald-600 mb-2" />
                  <h3 className="font-semibold text-sm text-slate-800">View Reports</h3>
                  <p className="text-xs text-slate-600 mt-1">Generate reports</p>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
