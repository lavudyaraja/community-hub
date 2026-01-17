"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  LogOut
} from 'lucide-react';

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState({
    totalSubmissions: 0,
    successfulSubmissions: 0,
    failedSubmissions: 0,
    todaySubmissions: 0,
    latestSubmission: {
      status: 'none',
      time: 'No submissions yet'
    },
    recentActivities: [] as string[],
  });

  useEffect(() => {
    // Check authentication
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
    loadDashboardData(currentUser.email);
  }, [router]);

  const loadDashboardData = async (userEmail: string) => {
    try {
      const { getUserSubmissions } = await import('@/lib/db-client');
      const dbSubmissions = await getUserSubmissions(userEmail);
      
      // Transform database format
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
      
      const today = new Date().toDateString();
      const todaySubs = userSubmissions.filter((s: any) => {
        const subDate = new Date(s.date).toDateString();
        return subDate === today;
      });

      const successful = userSubmissions.filter((s: any) => s.status === 'successful');
      const failed = userSubmissions.filter((s: any) => s.status === 'failed');

      // Get latest submission
      const latest = userSubmissions.length > 0 
        ? userSubmissions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
        : null;

      // Generate recent activities
      const activities = userSubmissions.slice(0, 3).map((s: any) => {
        const time = new Date(s.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        if (s.status === 'successful') {
          return `You submitted data at ${time} - Submission successful`;
        } else if (s.status === 'failed') {
          return `You submitted data at ${time} - Submission failed`;
        }
        return `You submitted data at ${time}`;
      });

    setDashboardData({
      totalSubmissions: userSubmissions.length,
      successfulSubmissions: successful.length,
      failedSubmissions: failed.length,
      todaySubmissions: todaySubs.length,
      latestSubmission: latest ? {
        status: latest.status,
        time: new Date(latest.date).toLocaleString()
      } : {
        status: 'none',
        time: 'No submissions yet'
      },
      recentActivities: activities.length > 0 ? activities : ['No recent activity']
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'successful':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Successful</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Processing</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar activeItem="Dashboard" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeItem="Dashboard" />

      {/* Main Content */}
      <div className="flex-1" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your submission overview.</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalSubmissions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful Submissions</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{dashboardData.successfulSubmissions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Submissions</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{dashboardData.failedSubmissions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Submissions</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{dashboardData.todaySubmissions}</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Status and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Status */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Quick Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Latest Submission Status</span>
                    {getStatusBadge(dashboardData.latestSubmission.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Last Submission Time</span>
                    <span className="text-sm text-gray-600">{dashboardData.latestSubmission.time}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{activity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Info Card */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Your Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500">Data Contributor</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user?.region || 'Not set'}</p>
                      <p className="text-xs text-gray-500">Region</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Data
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View My Submissions
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