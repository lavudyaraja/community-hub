"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RegionalSidebar } from './components/sidebar';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import {
  Inbox, Cpu, Users, CheckCircle2, XCircle, Brain,
  TrendingUp, RefreshCw, Activity, ArrowUpRight, AlertCircle,
  TrendingDown, Clock, Database, Zap, BarChart3, FileText,
  CheckCircle, AlertTriangle, Eye, ArrowRight, Calendar,
  Loader2, Server, HardDrive, Wifi, Shield, LineChart, PieChart,
  ImageIcon, Music, Video, File, Download, Settings, Bell,
  MapPin, Globe, Sparkles, Target, Award, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { BarChart, Bar, LineChart as RechartsLineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface ActivityItem {
  id: string;
  type: 'validation' | 'rejection' | 'approval' | 'system';
  message: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface ChartDataPoint {
  date: string;
  day: string;
  incoming: number;
  validated: number;
  rejected: number;
  pending: number;
  qualityScore: number;
}

const generateMockActivities = (): ActivityItem[] => {
  const activities = [
    { type: 'validation' as const, message: 'Dataset "medical_images_batch_045.jpg" validated successfully', status: 'success' as const },
    { type: 'rejection' as const, message: 'Dataset "audio_sample_789.mp3" rejected - Low quality', status: 'error' as const },
    { type: 'approval' as const, message: 'ML Model v3.5 approved for production', status: 'success' as const },
    { type: 'system' as const, message: 'System backup completed - 2.4TB archived', status: 'info' as const },
    { type: 'validation' as const, message: 'Batch validation completed: 312 datasets processed', status: 'success' as const },
    { type: 'system' as const, message: 'Auto-scaling triggered - 3 new nodes added', status: 'warning' as const },
    { type: 'approval' as const, message: 'Coordinator approved 28 datasets for distribution', status: 'success' as const },
    { type: 'validation' as const, message: 'Dataset "video_surgical_012.mp4" passed validation', status: 'success' as const },
    { type: 'rejection' as const, message: 'Dataset "document_scan_456.pdf" rejected - Invalid format', status: 'error' as const },
    { type: 'system' as const, message: 'Database optimization improved query speed by 35%', status: 'info' as const },
    { type: 'validation' as const, message: 'AI quality check completed on 156 files', status: 'success' as const },
    { type: 'approval' as const, message: 'New data contributor onboarded: Dr. Sarah Chen', status: 'success' as const }
  ];

  return activities.map((activity, i) => ({
    id: `activity-${i + 1}`,
    ...activity,
    timestamp: new Date(Date.now() - Math.random() * 3 * 60 * 60 * 1000)
  }));
};

const generateChartData = (): ChartDataPoint[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const baseValues = {
    Mon: { incoming: 920, validated: 780, rejected: 48 },
    Tue: { incoming: 1050, validated: 890, rejected: 55 },
    Wed: { incoming: 1250, validated: 1080, rejected: 68 },
    Thu: { incoming: 1180, validated: 1020, rejected: 62 },
    Fri: { incoming: 1100, validated: 950, rejected: 58 },
    Sat: { incoming: 850, validated: 720, rejected: 45 },
    Sun: { incoming: 780, validated: 680, rejected: 42 }
  };
  
  return days.map((day, idx) => {
    const base = baseValues[day as keyof typeof baseValues];
    const variation = Math.floor(Math.random() * 60) - 30;
    const incoming = Math.max(100, base.incoming + variation);
    const validated = Math.max(100, base.validated + variation);
    const rejected = Math.max(10, base.rejected + Math.floor(variation / 3));
    return {
      date: day,
      day: `${day} ${idx + 1}`,
      incoming,
      validated,
      rejected,
      pending: Math.max(20, incoming - validated - rejected),
      qualityScore: 7.8 + Math.random() * 1.8
    };
  });
};

const generateFileTypeDistribution = () => {
  return [
    { name: 'Images', value: 48, color: '#3b82f6', count: 4320 },
    { name: 'Audio', value: 28, color: '#10b981', count: 2520 },
    { name: 'Video', value: 18, color: '#f59e0b', count: 1620 },
    { name: 'Documents', value: 6, color: '#ef4444', count: 540 }
  ];
};

const generateRegionalStats = () => {
  return [
    { region: 'North America', datasets: 3245, contributors: 156, avgQuality: 8.9 },
    { region: 'Europe', datasets: 2890, contributors: 142, avgQuality: 9.1 },
    { region: 'Asia Pacific', datasets: 4120, contributors: 198, avgQuality: 8.7 },
    { region: 'Latin America', datasets: 1650, contributors: 89, avgQuality: 8.5 },
    { region: 'Middle East', datasets: 980, contributors: 54, avgQuality: 8.8 }
  ];
};

export default function RegionalHubDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [fileTypeDistribution, setFileTypeDistribution] = useState(generateFileTypeDistribution());
  const [regionalStats, setRegionalStats] = useState(generateRegionalStats());
  const [stats, setStats] = useState({
    incoming: 1567,
    mlQueue: 423,
    validated: 9845,
    rejected: 156,
    activeModels: 7,
    trainingModels: 3,
    avgAccuracy: 95.4,
    avgQualityScore: 8.9,
    highQuality: 89,
    needsReview: 11,
    processingRate: 287,
    uptime: 99.92,
    activeAlerts: 1,
    totalContributors: 639,
    totalSize: 15.7,
    avgResponseTime: 1.2
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
    loadDashboardData();
  }, [router]);

  const loadDashboardData = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setActivities(generateMockActivities());
      setChartData(generateChartData());
      setFileTypeDistribution(generateFileTypeDistribution());
      setRegionalStats(generateRegionalStats());
      setIsLoading(false);
    }, 600);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setActivities(generateMockActivities());
      setChartData(generateChartData());
      setFileTypeDistribution(generateFileTypeDistribution());
      setRegionalStats(generateRegionalStats());
      setStats(prev => ({
        ...prev,
        incoming: prev.incoming + Math.floor(Math.random() * 30) - 15,
        mlQueue: prev.mlQueue + Math.floor(Math.random() * 15) - 7,
        validated: prev.validated + Math.floor(Math.random() * 60) - 30,
        rejected: prev.rejected + Math.floor(Math.random() * 8) - 4
      }));
      setIsRefreshing(false);
      toast.success('Dashboard data refreshed successfully');
    }, 800);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'validation': return CheckCircle;
      case 'rejection': return XCircle;
      case 'approval': return CheckCircle2;
      case 'system': return Server;
      default: return Activity;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'error': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen bg-white">
        <RegionalSidebar activeItem="Dashboard" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--regional-sidebar-width, 256px)' }}>
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading Regional Hub Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <RegionalSidebar activeItem="Dashboard" />
      <div className="flex-1" style={{ marginLeft: 'var(--regional-sidebar-width, 256px)' }}>
        <div className="p-6 max-w-[1800px] mx-auto">
          {/* Header Section */}
          <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Globe className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    Regional Hub Dashboard
                    <Sparkles className="h-6 w-6 text-yellow-500" />
                  </h1>
                  <p className="text-gray-600 mt-1">Real-time monitoring and analytics for regional data operations</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="border-gray-300">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" size="sm" className="border-gray-300">
                  <Bell className="h-4 w-4 mr-2" />
                  Alerts
                  {stats.activeAlerts > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5">{stats.activeAlerts}</Badge>
                  )}
                </Button>
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
                <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </div>
            </div>

            {/* Performance Metrics Summary */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Performance Metrics Summary</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                    <Activity className="h-3 w-3 mr-1" />
                    Real-time
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <p className="text-xs text-gray-600 font-medium">Processing Speed</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{stats.processingRate}</p>
                  <p className="text-xs text-gray-500 mt-1">datasets/min</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <p className="text-xs text-gray-600 font-medium">Success Rate</p>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{stats.highQuality}%</p>
                  <p className="text-xs text-gray-500 mt-1">validation rate</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <p className="text-xs text-gray-600 font-medium">AI Accuracy</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{stats.avgAccuracy}%</p>
                  <p className="text-xs text-gray-500 mt-1">model average</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <p className="text-xs text-gray-600 font-medium">Response Time</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{stats.avgResponseTime}</p>
                  <p className="text-xs text-gray-500 mt-1">seconds avg</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-teal-50 to-white border border-teal-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4 text-teal-600" />
                    <p className="text-xs text-gray-600 font-medium">Total Storage</p>
                  </div>
                  <p className="text-2xl font-bold text-teal-600">{stats.totalSize}</p>
                  <p className="text-xs text-gray-500 mt-1">terabytes</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-pink-50 to-white border border-pink-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-pink-600" />
                    <p className="text-xs text-gray-600 font-medium">Contributors</p>
                  </div>
                  <p className="text-2xl font-bold text-pink-600">{stats.totalContributors}</p>
                  <p className="text-xs text-gray-500 mt-1">active users</p>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border border-gray-200 bg-white hover:border-blue-300 transition-colors cursor-pointer" onClick={() => router.push('/regional-hub/incoming-datasets')}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                    <Inbox className="h-6 w-6 text-blue-600" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Incoming Datasets</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stats.incoming.toLocaleString()}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Awaiting processing</span>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white hover:border-purple-300 transition-colors cursor-pointer" onClick={() => router.push('/regional-hub/ml-validation-queue')}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100">
                    <Cpu className="h-6 w-6 text-purple-600" />
                  </div>
                  <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">ML Validation Queue</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stats.mlQueue.toLocaleString()}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">In validation pipeline</span>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white hover:border-emerald-300 transition-colors cursor-pointer" onClick={() => router.push('/regional-hub/validated-datasets')}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.3%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Validated Datasets</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stats.validated.toLocaleString()}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Ready for distribution</span>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white hover:border-red-300 transition-colors cursor-pointer" onClick={() => router.push('/regional-hub/rejected-datasets')}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-red-50 flex items-center justify-center border border-red-100">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -5.2%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rejected Datasets</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stats.rejected.toLocaleString()}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Quality issues detected</span>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Weekly Activity Chart - Takes 2 columns */}
            <div className="lg:col-span-2">
              <Card className="border border-gray-200 bg-white h-full">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Weekly Dataset Flow
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs">This Week</Badge>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <ChartContainer
                    config={{
                      incoming: { label: "Incoming", color: "#3b82f6" },
                      validated: { label: "Validated", color: "#10b981" },
                      rejected: { label: "Rejected", color: "#ef4444" },
                      pending: { label: "Pending", color: "#f59e0b" },
                    }}
                    className="h-[320px]"
                  >
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                      <XAxis 
                        dataKey="date" 
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        className="text-xs"
                      />
                      <YAxis 
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        className="text-xs"
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="incoming" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="validated" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="rejected" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* File Type Distribution */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  File Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ChartContainer
                  config={{
                    Images: { label: "Images", color: "#3b82f6" },
                    Audio: { label: "Audio", color: "#10b981" },
                    Video: { label: "Video", color: "#f59e0b" },
                    Documents: { label: "Documents", color: "#ef4444" },
                  }}
                  className="h-[220px]"
                >
                  <RechartsPieChart>
                    <Pie
                      data={fileTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {fileTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RechartsPieChart>
                </ChartContainer>
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                  {fileTypeDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quality Score and System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Quality Score Trend */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  Quality Score Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ChartContainer
                  config={{
                    qualityScore: { label: "Quality Score", color: "#f59e0b" },
                  }}
                  className="h-[180px]"
                >
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      className="text-xs"
                    />
                    <YAxis 
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      domain={[0, 10]}
                      className="text-xs"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="qualityScore" 
                      stroke="#f59e0b" 
                      fill="#f59e0b"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Average Score</span>
                    <span className="text-lg font-bold text-orange-600">{stats.avgQualityScore}/10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Target Achievement</span>
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Target className="h-3 w-3 mr-1" />
                      112%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ML Models Status */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Brain className="h-5 w-5 text-indigo-600" />
                  ML Models Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Active Models</p>
                      <p className="text-xs text-gray-600">Production ready</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-emerald-600">{stats.activeModels}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Cpu className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Training</p>
                      <p className="text-xs text-gray-600">In progress</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-amber-600">{stats.trainingModels}</span>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Avg Accuracy</span>
                    <span className="text-sm font-bold text-emerald-600">{stats.avgAccuracy}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${stats.avgAccuracy}%` }} />
                  </div>
                </div>

                <Button variant="outline" className="w-full border-gray-300" size="sm" onClick={() => router.push('/regional-hub/ml-models-status')}>
                  View All Models
                  <ArrowRight className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* System Health Monitor */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Shield className="h-5 w-5 text-green-600" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm text-gray-600">Uptime</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">{stats.uptime}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${stats.uptime}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">CPU Usage</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">68%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-600">Storage</span>
                    </div>
                    <span className="text-sm font-bold text-purple-600">45%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-gray-600">Memory</span>
                    </div>
                    <span className="text-sm font-bold text-orange-600">74%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '74%' }} />
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Alerts</span>
                  <Badge className={stats.activeAlerts > 0 ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}>
                    {stats.activeAlerts > 0 ? `${stats.activeAlerts} Active` : 'All Clear'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Regional Statistics and Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Regional Performance */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Regional Performance
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {regionalStats.map((region, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                            <Globe className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{region.region}</p>
                            <p className="text-xs text-gray-500">{region.contributors} contributors</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
                          <Award className="h-3 w-3 mr-1" />
                          {region.avgQuality}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-2 bg-gray-50 rounded border border-gray-100">
                          <p className="text-xs text-gray-500">Datasets</p>
                          <p className="text-sm font-bold text-gray-900">{region.datasets.toLocaleString()}</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded border border-gray-100">
                          <p className="text-xs text-gray-500">Quality</p>
                          <p className="text-sm font-bold text-emerald-600">{region.avgQuality}/10</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Feed */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Activity className="h-5 w-5 text-gray-600" />
                    Recent Activity
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => router.push('/regional-hub/activity-logs')}>
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {activities.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    const colorClass = getActivityColor(activity.status);
                    
                    return (
                      <div key={activity.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                        <div className={`p-2 rounded-lg border ${colorClass} flex-shrink-0`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 leading-relaxed">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}