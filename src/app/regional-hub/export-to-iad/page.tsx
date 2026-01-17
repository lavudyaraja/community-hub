"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RegionalSidebar } from '../components/sidebar';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import {
  Download, RefreshCw, CheckCircle2, Clock, XCircle, 
  Send, Database, FileText, Filter, Calendar, BarChart3,
  Loader2, ArrowRight, Package, Users, Globe, Zap,
  Settings, AlertCircle, TrendingUp, FileCheck, Archive,
  PlayCircle, PauseCircle, Eye, Edit, Trash2, ChevronRight,
  HardDrive, Activity, Server, CloudUpload
} from 'lucide-react';
import { toast } from 'sonner';

interface ExportRecord {
  id: string;
  exportName: string;
  datasetCount: number;
  fileSize: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  completedAt?: Date;
  exportedBy: string;
  region: string;
  fileTypes: string[];
}

const generateExportRecords = (): ExportRecord[] => {
  const statuses: ('pending' | 'processing' | 'completed' | 'failed')[] = ['pending', 'processing', 'completed', 'failed'];
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];
  const fileTypeOptions = [['images'], ['audio'], ['video'], ['documents'], ['images', 'audio'], ['all types']];
  
  return Array.from({ length: 15 }, (_, i) => {
    const status = i < 2 ? 'pending' : i < 5 ? 'processing' : i < 13 ? 'completed' : 'failed';
    const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    
    return {
      id: `export-${1000 + i}`,
      exportName: `Export Batch ${String(i + 1).padStart(3, '0')}`,
      datasetCount: Math.floor(Math.random() * 500) + 100,
      fileSize: Math.floor(Math.random() * 5000) + 500,
      status,
      progress: status === 'completed' ? 100 : status === 'processing' ? Math.floor(Math.random() * 80) + 10 : status === 'failed' ? 35 : 0,
      createdAt,
      completedAt: status === 'completed' ? new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000) : undefined,
      exportedBy: ['Dr. Sarah Chen', 'Dr. Michael Torres', 'Dr. Aisha Patel', 'Dr. James Wilson'][Math.floor(Math.random() * 4)],
      region: regions[Math.floor(Math.random() * regions.length)],
      fileTypes: fileTypeOptions[Math.floor(Math.random() * fileTypeOptions.length)]
    };
  });
};

export default function ExportToIAD() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportRecords, setExportRecords] = useState<ExportRecord[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    totalExports: 6847,
    pendingExports: 12,
    processingExports: 8,
    completedExports: 6810,
    failedExports: 17,
    totalDataExported: 24.5,
    avgExportTime: 3.2,
    successRate: 99.7,
    todayExports: 45
  });

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
    loadExportData();
  }, [router]);

  const loadExportData = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setExportRecords(generateExportRecords());
      setIsLoading(false);
    }, 600);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setExportRecords(generateExportRecords());
      setStats(prev => ({
        ...prev,
        totalExports: prev.totalExports + Math.floor(Math.random() * 10),
        todayExports: prev.todayExports + Math.floor(Math.random() * 5)
      }));
      setIsRefreshing(false);
      toast.success('Export data refreshed');
    }, 800);
  }, []);

  const handleCreateExport = () => {
    toast.success('Export creation initiated');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-50 text-red-700 border border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatFileSize = (mb: number) => {
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredRecords = exportRecords.filter(record => {
    if (selectedFilter === 'all') return true;
    return record.status === selectedFilter;
  });

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen bg-white">
        <RegionalSidebar activeItem="Export to IAD" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--regional-sidebar-width, 256px)' }}>
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading export data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <RegionalSidebar activeItem="Export to IAD" />
      <div className="flex-1" style={{ marginLeft: 'var(--regional-sidebar-width, 256px)' }}>
        <div className="p-6 max-w-[1800px] mx-auto">
          {/* Header Section */}
          <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <CloudUpload className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Export to IAD</h1>
                  <p className="text-gray-600 mt-1">Export validated datasets to Integrated Analytics Dashboard</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh} 
                  disabled={isRefreshing}
                  className="border-gray-300"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700" 
                  size="sm"
                  onClick={handleCreateExport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  New Export
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-5 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Total Exports</p>
                <p className="text-lg font-bold text-gray-900">{stats.totalExports.toLocaleString()}</p>
              </div>
              <div className="text-center border-l border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Success Rate</p>
                <p className="text-lg font-bold text-emerald-600">{stats.successRate}%</p>
              </div>
              <div className="text-center border-l border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Data Exported</p>
                <p className="text-lg font-bold text-gray-900">{stats.totalDataExported} TB</p>
              </div>
              <div className="text-center border-l border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Avg Time</p>
                <p className="text-lg font-bold text-gray-900">{stats.avgExportTime}h</p>
              </div>
              <div className="text-center border-l border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Today</p>
                <p className="text-lg font-bold text-blue-600">{stats.todayExports}</p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border border-gray-200 bg-white hover:border-blue-300 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                    <Send className="h-6 w-6 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                    All Time
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Exports</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalExports.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +12.5% vs last month
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white hover:border-amber-300 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs">
                    In Queue
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Exports</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingExports}</p>
                  <p className="text-xs text-gray-500 mt-2">Waiting to start</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white hover:border-purple-300 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100">
                    <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
                  </div>
                  <Badge className="bg-purple-50 text-purple-700 border border-purple-200 text-xs">
                    Active
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Processing</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.processingExports}</p>
                  <p className="text-xs text-gray-500 mt-2">Currently exporting</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white hover:border-emerald-300 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                    Success
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.completedExports.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 mt-2">
                    {stats.successRate}% success rate
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions and Export Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Quick Export Actions */}
            <Card className="lg:col-span-2 border border-gray-200 bg-white">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Quick Export Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    className="h-auto flex-col items-start p-4 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200"
                    onClick={handleCreateExport}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Download className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">Export All Validated</span>
                    </div>
                    <span className="text-xs text-blue-700">Export all validated datasets to IAD</span>
                  </Button>

                  <Button 
                    className="h-auto flex-col items-start p-4 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200"
                    onClick={() => toast.info('Custom export configuration opened')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Filter className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold">Custom Export</span>
                    </div>
                    <span className="text-xs text-purple-700">Configure specific export criteria</span>
                  </Button>

                  <Button 
                    className="h-auto flex-col items-start p-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200"
                    onClick={() => toast.info('Scheduled export setup opened')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-emerald-600" />
                      <span className="font-semibold">Schedule Export</span>
                    </div>
                    <span className="text-xs text-emerald-700">Set up automated export schedule</span>
                  </Button>

                  <Button 
                    className="h-auto flex-col items-start p-4 bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200"
                    onClick={() => toast.info('Batch export initiated')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-orange-600" />
                      <span className="font-semibold">Batch Export</span>
                    </div>
                    <span className="text-xs text-orange-700">Export multiple batches at once</span>
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <HardDrive className="h-4 w-4 text-gray-600" />
                        <span className="text-xs text-gray-600 font-medium">Storage Used</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{stats.totalDataExported} TB</p>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="h-4 w-4 text-gray-600" />
                        <span className="text-xs text-gray-600 font-medium">Avg Speed</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">2.4 GB/s</p>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Server className="h-4 w-4 text-gray-600" />
                        <span className="text-xs text-gray-600 font-medium">Active Nodes</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">12</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Settings */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Export Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700 font-medium">Auto-Export</span>
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                      Enabled
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">Automatically export validated datasets</p>
                </div>

                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700 font-medium">Compression</span>
                    <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                      Standard
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">Balanced compression ratio</p>
                </div>

                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700 font-medium">Encryption</span>
                    <Badge className="bg-purple-50 text-purple-700 border border-purple-200 text-xs">
                      AES-256
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">Military-grade encryption</p>
                </div>

                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700 font-medium">Retention</span>
                    <Badge className="bg-orange-50 text-orange-700 border border-orange-200 text-xs">
                      90 Days
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">Export history retention period</p>
                </div>

                <Button variant="outline" className="w-full border-gray-300" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Export History */}
          <Card className="border border-gray-200 bg-white">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Archive className="h-5 w-5 text-gray-600" />
                  Export History
                  <Badge className="ml-2 bg-gray-100 text-gray-700 border border-gray-200">
                    {filteredRecords.length} records
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={selectedFilter === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedFilter('all')}
                    className={selectedFilter === 'all' ? 'bg-blue-600' : 'border-gray-300'}
                  >
                    All
                  </Button>
                  <Button 
                    variant={selectedFilter === 'pending' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedFilter('pending')}
                    className={selectedFilter === 'pending' ? 'bg-amber-600' : 'border-gray-300'}
                  >
                    Pending
                  </Button>
                  <Button 
                    variant={selectedFilter === 'processing' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedFilter('processing')}
                    className={selectedFilter === 'processing' ? 'bg-purple-600' : 'border-gray-300'}
                  >
                    Processing
                  </Button>
                  <Button 
                    variant={selectedFilter === 'completed' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedFilter('completed')}
                    className={selectedFilter === 'completed' ? 'bg-emerald-600' : 'border-gray-300'}
                  >
                    Completed
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {filteredRecords.slice(0, 10).map((record) => (
                  <div 
                    key={record.id} 
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 flex-shrink-0">
                          <FileCheck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900">{record.exportName}</h3>
                            {getStatusBadge(record.status)}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {record.datasetCount} datasets
                            </span>
                            <span className="flex items-center gap-1">
                              <Database className="h-3 w-3" />
                              {formatFileSize(record.fileSize)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {record.region}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {record.exportedBy}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {record.status === 'processing' && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-gray-600">Export Progress</span>
                          <span className="text-xs font-semibold text-blue-600">{record.progress}%</span>
                        </div>
                        <Progress value={record.progress} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>Created: {formatDate(record.createdAt)}</span>
                        {record.completedAt && (
                          <>
                            <span>•</span>
                            <span>Completed: {formatDate(record.completedAt)}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {record.fileTypes.map((type, idx) => (
                          <Badge key={idx} className="bg-gray-100 text-gray-700 border border-gray-200 text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredRecords.length > 10 && (
                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                  <Button variant="outline" className="border-gray-300">
                    Load More Exports
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}

              {filteredRecords.length === 0 && (
                <div className="text-center py-12">
                  <Archive className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No exports found</p>
                  <p className="text-sm text-gray-500">Try adjusting your filter or create a new export</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}