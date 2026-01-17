"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Sidebar } from './components/sidebar';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  User,
  MapPin,
  Upload,
  Eye,
  BarChart3,
  HelpCircle,
  RefreshCw,
  TrendingUp,
  Activity,
  Calendar,
  Loader2,
  ArrowUpRight,
  FileCheck,
  AlertCircle,
  Zap,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardData {
  totalSubmissions: number;
  successfulSubmissions: number;
  failedSubmissions: number;
  pendingSubmissions: number;
  todaySubmissions: number;
  thisWeekSubmissions: number;
  thisMonthSubmissions: number;
  latestSubmission: {
    status: string;
    time: string;
    fileName?: string;
  };
  recentActivities: Array<{
    text: string;
    time: string;
    status: string;
  }>;
  successRate: number;
  totalSize: number;
}

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSubmissions: 0,
    successfulSubmissions: 0,
    failedSubmissions: 0,
    pendingSubmissions: 0,
    todaySubmissions: 0,
    thisWeekSubmissions: 0,
    thisMonthSubmissions: 0,
    latestSubmission: {
      status: 'none',
      time: 'No submissions yet'
    },
    recentActivities: [],
    successRate: 0,
    totalSize: 0
  });

  useEffect(() => {
    validateAndLoadUser();
  }, [router]);

  const validateAndLoadUser = async () => {
    try {
      if (!isAuthenticated()) {
        router.push('/auth/login');
        return;
      }

      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }

      setUser(currentUser);
      await loadDashboardData(currentUser.email);
    } catch (error) {
      console.error('Error loading user:', error);
      toast.error('Failed to load user data');
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async (userEmail: string, showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);

      const { getUserSubmissions } = await import('@/lib/db-client');
      const dbSubmissions = await getUserSubmissions(userEmail);
      
      const userSubmissions = dbSubmissions.map((s: any) => ({
        id: s.id,
        fileName: s.file_name,
        fileType: s.file_type,
        fileSize: s.file_size,
        userEmail: s.user_email,
        date: s.created_at,
        status: s.status,
        preview: s.preview,
      }));

      const now = new Date();
      const today = now.toDateString();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const todaySubs = userSubmissions.filter((s: any) => 
        new Date(s.date).toDateString() === today
      );
      
      const weekSubs = userSubmissions.filter((s: any) => 
        new Date(s.date) >= weekAgo
      );
      
      const monthSubs = userSubmissions.filter((s: any) => 
        new Date(s.date) >= monthAgo
      );

      const successful = userSubmissions.filter((s: any) => s.status === 'successful');
      const failed = userSubmissions.filter((s: any) => s.status === 'failed');
      const pending = userSubmissions.filter((s: any) => s.status === 'pending');

      const successRate = userSubmissions.length > 0 
        ? Math.round((successful.length / userSubmissions.length) * 100)
        : 0;

      const totalSize = userSubmissions.reduce((acc: number, s: any) => acc + (s.fileSize || 0), 0);

      const latest = userSubmissions.length > 0 
        ? userSubmissions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
        : null;

      const activities = userSubmissions
        .slice(0, 5)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((s: any) => {
          const time = new Date(s.date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          
          let text = '';
          if (s.status === 'successful') {
            text = `Successfully uploaded ${s.fileName}`;
          } else if (s.status === 'failed') {
            text = `Failed to upload ${s.fileName}`;
          } else {
            text = `Uploaded ${s.fileName} (pending validation)`;
          }
          
          return { text, time, status: s.status };
        });

      setDashboardData({
        totalSubmissions: userSubmissions.length,
        successfulSubmissions: successful.length,
        failedSubmissions: failed.length,
        pendingSubmissions: pending.length,
        todaySubmissions: todaySubs.length,
        thisWeekSubmissions: weekSubs.length,
        thisMonthSubmissions: monthSubs.length,
        latestSubmission: latest ? {
          status: latest.status,
          time: new Date(latest.date).toLocaleString(),
          fileName: latest.fileName
        } : {
          status: 'none',
          time: 'No submissions yet'
        },
        recentActivities: activities.length > 0 ? activities : [],
        successRate,
        totalSize
      });

      if (showToast) {
        toast.success('Dashboard refreshed successfully');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      if (showToast) setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (user) {
      loadDashboardData(user.email, true);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'successful':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Successful
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'successful':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-amber-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar activeItem="Dashboard" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="text-gray-600 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar activeItem="Dashboard" />

      <div className="flex-1" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
                </h1>
                <p className="text-gray-600">Here's your submission overview and recent activity.</p>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                className="border-gray-300 hover:bg-gray-100"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Submissions</CardTitle>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{dashboardData.totalSubmissions}</div>
                <p className="text-xs text-gray-600 mt-1">All time submissions</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Successful</CardTitle>
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">{dashboardData.successfulSubmissions}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={dashboardData.successRate} className="h-1.5 flex-1" />
                  <span className="text-xs font-medium text-emerald-600">{dashboardData.successRate}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Pending</CardTitle>
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">{dashboardData.pendingSubmissions}</div>
                <p className="text-xs text-gray-600 mt-1">Awaiting validation</p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Failed</CardTitle>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{dashboardData.failedSubmissions}</div>
                <p className="text-xs text-gray-600 mt-1">Need attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardData.todaySubmissions}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardData.thisWeekSubmissions}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Size</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{formatFileSize(dashboardData.totalSize)}</p>
                  </div>
                  <Download className="h-8 w-8 text-teal-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Latest Submission & Recent Activity */}
            <div className="lg:col-span-2 space-y-6">
              {/* Latest Submission */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    Latest Submission
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {dashboardData.latestSubmission.status !== 'none' ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileCheck className="h-4 w-4 text-gray-500" />
                            <p className="text-sm font-medium text-gray-900">
                              {dashboardData.latestSubmission.fileName || 'File uploaded'}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 ml-6">
                            {dashboardData.latestSubmission.time}
                          </p>
                        </div>
                        {getStatusBadge(dashboardData.latestSubmission.status)}
                      </div>
                      <Separator />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => router.push('/dashboard/submissions')}
                      >
                        View All Submissions
                        <ArrowUpRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 mb-4">No submissions yet</p>
                      <Button
                        size="sm"
                        onClick={() => router.push('/dashboard/upload')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Your First File
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {dashboardData.recentActivities.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="mt-0.5">
                            {getActivityIcon(activity.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 font-medium truncate">
                              {activity.text}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Profile & Quick Actions */}
            <div className="space-y-6">
              {/* User Profile Card */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">Data Contributor</p>
                    </div>
                  </div>

                  {user?.email && (
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <User className="h-4 w-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm text-gray-900 truncate">{user.email}</p>
                      </div>
                    </div>
                  )}

                  {user?.region && (
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Region</p>
                        <p className="text-sm text-gray-900">{user.region}</p>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push('/dashboard/profile')}
                  >
                    View Full Profile
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <Button
                    className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    onClick={() => router.push('/dashboard/upload')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Data
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-gray-50"
                    onClick={() => router.push('/dashboard/submissions')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View My Submissions
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-gray-50"
                    onClick={() => router.push('/dashboard/dataset-preview')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Dataset Preview
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-gray-50"
                    onClick={() => router.push('/dashboard/help')}
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help & Guidelines
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;