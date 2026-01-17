"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sidebar } from '../components/sidebar';
import { CheckCircle, XCircle, Clock, TrendingUp, Activity, RefreshCw } from 'lucide-react';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import { getUserSubmissions } from '@/lib/db-client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Submission {
  id: string;
  file_name: string;
  file_type: 'image' | 'audio' | 'video' | 'document';
  file_size: number;
  user_email: string;
  created_at: string;
  status: string;
}

const SubmissionStatus = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    loadSubmissions();
  }, [router]);

  const loadSubmissions = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const dbSubmissions = await getUserSubmissions(currentUser.email);
      setSubmissions(dbSubmissions);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submission status');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'successful':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'successful':
        return <Badge className="bg-green-100 text-green-800">Successful</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
    }
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const getStatusMessage = (status: string, fileType: string): string => {
    if (status === 'successful') {
      return `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} file uploaded successfully`;
    } else if (status === 'failed') {
      return `Failed to process ${fileType} file`;
    }
    return `Processing ${fileType} file...`;
  };

  // Calculate statistics
  const total = submissions.length;
  const successful = submissions.filter(s => s.status === 'successful').length;
  const failed = submissions.filter(s => s.status === 'failed').length;
  const processing = submissions.filter(s => s.status !== 'successful' && s.status !== 'failed').length;
  
  const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;

  // Today's submissions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySubmissions = submissions.filter(s => {
    const subDate = new Date(s.created_at);
    subDate.setHours(0, 0, 0, 0);
    return subDate.getTime() === today.getTime();
  });
  const todaySuccessful = todaySubmissions.filter(s => s.status === 'successful').length;
  const todaySuccessRate = todaySubmissions.length > 0 
    ? Math.round((todaySuccessful / todaySubmissions.length) * 100) 
    : 0;

  // Recent submissions (last 5)
  const recentSubmissions = submissions.slice(0, 5);

  if (!user || isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar activeItem="Submission Status" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading status...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeItem="Submission Status" />

      {/* Main Content */}
      <div className="flex-1" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Submission Status</h1>
              <p className="text-gray-600">Track the status of your data submissions in real-time.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSubmissions}
              disabled={isLoading}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          {/* Overall Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{total}</div>
                <p className="text-xs text-muted-foreground">
                  +{todaySubmissions.length} today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{successRate}%</div>
                <Progress value={successRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{successful}</div>
                <p className="text-xs text-muted-foreground">
                  {total > 0 ? Math.round((successful / total) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{failed}</div>
                <p className="text-xs text-muted-foreground">
                  {total > 0 ? Math.round((failed / total) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Submissions Status */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Submission Status</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSubmissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No submissions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSubmissions.map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(submission.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{submission.id}</span>
                            {getStatusBadge(submission.status)}
                          </div>
                          <p className="text-sm text-gray-600">
                            {getStatusMessage(submission.status, submission.file_type)}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{getTimeAgo(submission.created_at)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Status */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Submissions Today</span>
                  <span className="font-medium">{todaySubmissions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-medium text-green-600">{todaySuccessRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Processing</span>
                  <span className="font-medium">{processing}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage Service</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Processing Queue</span>
                  <Badge className={processing > 0 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                    <Clock className="h-3 w-3 mr-1" />
                    {processing > 0 ? 'Busy' : 'Idle'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionStatus;
