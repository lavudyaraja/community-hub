"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminSidebar } from '../components/sidebar';
import { getCurrentAdmin, isAdminAuthenticated } from '@/lib/auth';
import { BarChart3, FileText, Download, TrendingUp, Users, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Reports = () => {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [reportData, setReportData] = useState({
    totalSubmissions: 0,
    validated: 0,
    rejected: 0,
    pending: 0,
    totalVolunteers: 0,
    todaySubmissions: 0,
  });

  useEffect(() => {
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
    loadReportData();
  }, [router]);

  const loadReportData = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      const data = await response.json();
      setReportData({
        totalSubmissions: data.totalSubmissions || 0,
        validated: data.validatedSubmissions || 0,
        rejected: data.rejectedSubmissions || 0,
        pending: data.pendingSubmissions || 0,
        totalVolunteers: data.totalVolunteers || 0,
        todaySubmissions: data.todaySubmissions || 0,
      });
    } catch (error) {
      console.error('Error loading report data:', error);
      setReportData({
        totalSubmissions: 0,
        validated: 0,
        rejected: 0,
        pending: 0,
        totalVolunteers: 0,
        todaySubmissions: 0,
      });
    }
  };

  const handleExportReport = () => {
    // In production, this would generate and download a report file
    toast.success('Report export started');
  };

  if (!admin) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar activeItem="Reports" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activeItem="Reports" />
      <div className="flex-1" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
              <p className="text-gray-600">View analytics and generate reports</p>
            </div>
            <Button onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totalSubmissions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Validated</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{reportData.validated}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{reportData.rejected}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{reportData.pending}</div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Submission Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Volunteers</span>
                    <span className="font-semibold">{reportData.totalVolunteers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Today's Submissions</span>
                    <span className="font-semibold">{reportData.todaySubmissions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Validation Rate</span>
                    <span className="font-semibold">
                      {reportData.totalSubmissions > 0 
                        ? ((reportData.validated / reportData.totalSubmissions) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rejection Rate</span>
                    <span className="font-semibold">
                      {reportData.totalSubmissions > 0 
                        ? ((reportData.rejected / reportData.totalSubmissions) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Activity Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Validated</span>
                      <span className="text-sm font-semibold">{reportData.validated}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: `${reportData.totalSubmissions > 0 ? (reportData.validated / reportData.totalSubmissions) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Rejected</span>
                      <span className="text-sm font-semibold">{reportData.rejected}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ 
                          width: `${reportData.totalSubmissions > 0 ? (reportData.rejected / reportData.totalSubmissions) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Pending</span>
                      <span className="text-sm font-semibold">{reportData.pending}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full" 
                        style={{ 
                          width: `${reportData.totalSubmissions > 0 ? (reportData.pending / reportData.totalSubmissions) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
