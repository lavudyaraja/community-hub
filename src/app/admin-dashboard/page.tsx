"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  ListChecks,
  RefreshCw,
  Eye,
  ArrowRight,
  Activity,
  Zap,
  Image as ImageIcon,
  Video,
  Music,
  FileCheck,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface RecentSubmission {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  userEmail: string;
  status: string;
  createdAt: string;
}

interface FileTypeStat {
  type: string;
  count: number;
}

interface WeeklyTrend {
  date: string;
  count: number;
}

const AdminDashboard = () => {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalSubmissions: 0,
    pendingSubmissions: 0,
    validatedSubmissions: 0,
    rejectedSubmissions: 0,
    totalVolunteers: 0,
    todaySubmissions: 0,
    validationQueue: 0,
    recentSubmissions: [] as RecentSubmission[],
    fileTypeStats: [] as FileTypeStat[],
    weeklyTrend: [] as WeeklyTrend[],
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
    // Don't block UI - show content immediately while loading
    setIsLoading(false);
    // Fetch data in background
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      // Use faster fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout (optimized API should respond faster)
      
      const response = await fetch('/api/admin/stats', { 
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch dashboard data');
      }
      const data = await response.json();
      console.log('Dashboard Data Received:', data);
      console.log('Total Submissions:', data.totalSubmissions);
      console.log('Pending Submissions:', data.pendingSubmissions);
      console.log('Validated Submissions:', data.validatedSubmissions);
      
      // Check if API returned an error
      if (data.error) {
        throw new Error(data.error + (data.details ? `: ${data.details}` : ''));
      }
      
      // Parse numbers explicitly to ensure they're not strings
      const parsedData = {
        totalSubmissions: Number(data.totalSubmissions) || 0,
        pendingSubmissions: Number(data.pendingSubmissions) || 0,
        validatedSubmissions: Number(data.validatedSubmissions) || 0,
        rejectedSubmissions: Number(data.rejectedSubmissions) || 0,
        totalVolunteers: Number(data.totalVolunteers) || 0,
        todaySubmissions: Number(data.todaySubmissions) || 0,
        validationQueue: Number(data.validationQueue) || 0,
        recentSubmissions: Array.isArray(data.recentSubmissions) ? data.recentSubmissions : [],
        fileTypeStats: Array.isArray(data.fileTypeStats) ? data.fileTypeStats : [],
        weeklyTrend: Array.isArray(data.weeklyTrend) ? data.weeklyTrend : [],
      };
      
      console.log('Parsed Data:', parsedData);
      
      // Update state with parsed data
      setDashboardData(parsedData);
      if (showToast) {
        toast.success('Dashboard refreshed successfully');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Request timeout');
        toast.error('Request timeout - please try again');
      } else {
        console.error('Error loading dashboard data:', error);
        console.error('Error details:', error.message);
        toast.error(`Failed to load dashboard data: ${error.message}`);
      }
      // Don't reset data on error - keep existing data
    } finally {
      if (showToast) setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'audio': return Music;
      default: return FileText;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
      case 'successful':
        return (
          <Badge className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-700 hover:from-green-100 hover:to-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Validated
          </Badge>
        );
      case 'rejected':
      case 'failed':
        return (
          <Badge className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-700 hover:from-red-100 hover:to-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'submitted':
        return (
          <Badge className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200">
            Submitted
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 text-amber-700 hover:from-amber-100 hover:to-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getValidationRate = () => {
    const total = dashboardData.totalSubmissions;
    if (total === 0) return 0;
    return Math.round((dashboardData.validatedSubmissions / total) * 100);
  };

  if (!admin) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <AdminSidebar activeItem="Dashboard" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-slate-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading...</p>
          </div>
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">Admin Dashboard</h1>
              <p className="text-slate-600">Welcome back, {admin.name}! Here's your overview.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border border-blue-200 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Total Submissions</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">{dashboardData.totalSubmissions}</div>
                <p className="text-xs text-blue-800 mt-1">
                  All time submissions
                </p>
              </CardContent>
            </Card>

            <Card className="border border-amber-200 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-700">Pending Submissions</CardTitle>
                <Clock className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700">{dashboardData.pendingSubmissions}</div>
                <p className="text-xs text-amber-800 mt-1">
                  Awaiting validation
                </p>
              </CardContent>
            </Card>

            <Card className="border border-emerald-200 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700">Validated Submissions</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-700">{dashboardData.validatedSubmissions}</div>
                <p className="text-xs text-emerald-800 mt-1">
                  Approved submissions
                </p>
              </CardContent>
            </Card>

            <Card className="border border-rose-200 shadow-sm bg-gradient-to-br from-rose-50 to-rose-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-rose-700">Rejected Submissions</CardTitle>
                <XCircle className="h-4 w-4 text-rose-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-700">{dashboardData.rejectedSubmissions}</div>
                <p className="text-xs text-rose-800 mt-1">
                  Rejected submissions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border border-cyan-200 shadow-sm bg-gradient-to-br from-cyan-50 to-cyan-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-cyan-700">Validation Queue</CardTitle>
                <AlertCircle className="h-4 w-4 text-cyan-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-700">{dashboardData.validationQueue}</div>
                <p className="text-xs text-cyan-800 mt-1">
                  Items in queue
                </p>
              </CardContent>
            </Card>

            <Card className="border border-purple-200 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Total Volunteers</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">{dashboardData.totalVolunteers}</div>
                <p className="text-xs text-purple-800 mt-1">
                  Registered users
                </p>
              </CardContent>
            </Card>

            <Card className="border border-emerald-200 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700">Today's Submissions</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-700">{dashboardData.todaySubmissions}</div>
                <p className="text-xs text-emerald-800 mt-1">
                  Submissions today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8 border-0 shadow-sm bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin-dashboard/pending-submissions">
                  <Button variant="outline" className="w-full justify-start h-auto p-4 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm">Review Pending</p>
                        <p className="text-xs text-gray-500">{dashboardData.pendingSubmissions} items</p>
                      </div>
                    </div>
                  </Button>
                </Link>
                <Link href="/admin-dashboard/validation-queue">
                  <Button variant="outline" className="w-full justify-start h-auto p-4 hover:bg-purple-50 hover:border-purple-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <ListChecks className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm">Validation Queue</p>
                        <p className="text-xs text-gray-500">{dashboardData.validationQueue} in queue</p>
                      </div>
                    </div>
                  </Button>
                </Link>
                <Link href="/admin-dashboard/volunteers">
                  <Button variant="outline" className="w-full justify-start h-auto p-4 hover:bg-green-50 hover:border-green-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm">Manage Volunteers</p>
                        <p className="text-xs text-gray-500">{dashboardData.totalVolunteers} users</p>
                      </div>
                    </div>
                  </Button>
                </Link>
                <Link href="/admin-dashboard/reports">
                  <Button variant="outline" className="w-full justify-start h-auto p-4 hover:bg-indigo-50 hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm">View Reports</p>
                        <p className="text-xs text-gray-500">Analytics & insights</p>
                      </div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Submissions */}
            <Card className="lg:col-span-2 border-0 shadow-sm bg-white/80 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Recent Submissions
                </CardTitle>
                <Link href="/admin-dashboard/pending-submissions">
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {dashboardData.recentSubmissions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No submissions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.recentSubmissions.slice(0, 5).map((submission) => {
                      const Icon = getFileTypeIcon(submission.fileType);
                      return (
                        <div
                          key={submission.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                              <Icon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 truncate">
                                {submission.fileName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-gray-500 truncate">
                                  {submission.userEmail}
                                </p>
                                <span className="text-gray-300">•</span>
                                <p className="text-xs text-gray-500">
                                  {new Date(submission.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {getStatusBadge(submission.status)}
                            <Link href={`/admin-dashboard/pending-submissions`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics & Insights */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-500" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Validation Rate */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Validation Rate</p>
                    <p className="text-sm font-bold text-indigo-600">{getValidationRate()}%</p>
                  </div>
                  <Progress value={getValidationRate()} className="h-2" />
                </div>

                {/* File Type Distribution */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">File Type Distribution</p>
                  <div className="space-y-3">
                    {dashboardData.fileTypeStats.map((stat) => {
                      const percentage = dashboardData.totalSubmissions > 0
                        ? Math.round((stat.count / dashboardData.totalSubmissions) * 100)
                        : 0;
                      const Icon = getFileTypeIcon(stat.type);
                      return (
                        <div key={stat.type}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-gray-500" />
                              <span className="text-xs font-medium text-gray-700 capitalize">
                                {stat.type}
                              </span>
                            </div>
                            <span className="text-xs text-gray-600">{stat.count} ({percentage}%)</span>
                          </div>
                          <Progress value={percentage} className="h-1.5" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Weekly Trend */}
                {dashboardData.weeklyTrend.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Last 7 Days</p>
                    <div className="space-y-2">
                      {dashboardData.weeklyTrend.slice(-7).map((day, index) => {
                        const maxCount = Math.max(...dashboardData.weeklyTrend.map(d => d.count), 1);
                        const height = (day.count / maxCount) * 100;
                        return (
                          <div key={index} className="flex items-end gap-2">
                            <div className="flex-1">
                              <div
                                className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all"
                                style={{ height: `${Math.max(height, 5)}%`, minHeight: '4px' }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-12 text-right">
                              {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-xs font-medium text-gray-700 w-8 text-right">
                              {day.count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Summary */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-500" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <FileCheck className="h-5 w-5 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-700">{dashboardData.validatedSubmissions}</span>
                  </div>
                  <p className="text-sm text-blue-800 font-medium">Validated Today</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <span className="text-2xl font-bold text-amber-700">{dashboardData.pendingSubmissions}</span>
                  </div>
                  <p className="text-sm text-amber-800 font-medium">Awaiting Review</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    <span className="text-2xl font-bold text-emerald-700">{dashboardData.todaySubmissions}</span>
                  </div>
                  <p className="text-sm text-emerald-800 font-medium">Submissions Today</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-700">{dashboardData.totalVolunteers}</span>
                  </div>
                  <p className="text-sm text-purple-800 font-medium">Active Volunteers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
