"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RegionalSidebar } from '../components/sidebar';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import {
  MapPin,
  RefreshCw,
  TrendingUp,
  Activity,
  Server,
  Users,
  Database,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  PieChart,
  Loader2,
  Signal,
  HardDrive,
  Cpu,
  Download,
  Upload,
  Eye,
  Settings,
  Filter,
  Calendar,
  Globe,
  Zap,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface EdgeDevice {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  uptime: number;
  dataProcessed: number;
  lastSync: string;
  cpuUsage: number;
  memoryUsage: number;
  storageUsed: number;
}

interface RegionalStats {
  totalDatasets: number;
  edgeDevices: number;
  activeDevices: number;
  processingRate: number;
  successRate: number;
  totalStorage: number;
  storageUsed: number;
  bandwidth: {
    upload: number;
    download: number;
  };
  regions: Array<{
    name: string;
    datasets: number;
    devices: number;
    status: 'active' | 'warning' | 'critical';
  }>;
}

export default function RegionalOverview() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Demo data
  const [regionalStats] = useState<RegionalStats>({
    totalDatasets: 12456,
    edgeDevices: 142,
    activeDevices: 138,
    processingRate: 245,
    successRate: 94.2,
    totalStorage: 5000,
    storageUsed: 3245,
    bandwidth: {
      upload: 125.5,
      download: 342.8
    },
    regions: [
      { name: 'North Region', datasets: 3245, devices: 35, status: 'active' },
      { name: 'South Region', datasets: 4123, devices: 42, status: 'active' },
      { name: 'East Region', datasets: 2876, devices: 38, status: 'warning' },
      { name: 'West Region', datasets: 2212, devices: 27, status: 'active' },
    ]
  });

  const [edgeDevices] = useState<EdgeDevice[]>([
    {
      id: 'edge-001',
      name: 'Edge Server - North-01',
      location: 'Northern District',
      status: 'online',
      uptime: 99.8,
      dataProcessed: 15234,
      lastSync: '2 mins ago',
      cpuUsage: 45,
      memoryUsage: 62,
      storageUsed: 78
    },
    {
      id: 'edge-002',
      name: 'Edge Server - South-01',
      location: 'Southern District',
      status: 'online',
      uptime: 98.5,
      dataProcessed: 18456,
      lastSync: '5 mins ago',
      cpuUsage: 38,
      memoryUsage: 55,
      storageUsed: 65
    },
    {
      id: 'edge-003',
      name: 'Edge Server - East-01',
      location: 'Eastern District',
      status: 'warning',
      uptime: 95.2,
      dataProcessed: 12876,
      lastSync: '15 mins ago',
      cpuUsage: 72,
      memoryUsage: 85,
      storageUsed: 92
    },
    {
      id: 'edge-004',
      name: 'Edge Server - West-01',
      location: 'Western District',
      status: 'online',
      uptime: 99.2,
      dataProcessed: 14532,
      lastSync: '3 mins ago',
      cpuUsage: 52,
      memoryUsage: 68,
      storageUsed: 71
    },
    {
      id: 'edge-005',
      name: 'Edge Server - Central-01',
      location: 'Central District',
      status: 'offline',
      uptime: 0,
      dataProcessed: 0,
      lastSync: '2 hours ago',
      cpuUsage: 0,
      memoryUsage: 0,
      storageUsed: 0
    }
  ]);

  const [recentActivity] = useState([
    { time: '2 mins ago', action: 'Dataset uploaded', region: 'North Region', status: 'success' },
    { time: '5 mins ago', action: 'Edge device synchronized', region: 'South Region', status: 'success' },
    { time: '15 mins ago', action: 'High CPU usage detected', region: 'East Region', status: 'warning' },
    { time: '32 mins ago', action: 'Backup completed', region: 'West Region', status: 'success' },
    { time: '1 hour ago', action: 'Device offline', region: 'Central Region', status: 'error' },
  ]);

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
    } catch (error) {
      console.error('Error loading user:', error);
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Dashboard refreshed successfully');
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
      case 'success':
        return 'text-emerald-600 bg-emerald-100 border-emerald-200';
      case 'warning':
        return 'text-amber-600 bg-amber-100 border-amber-200';
      case 'offline':
      case 'critical':
      case 'error':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
      case 'success':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'offline':
      case 'critical':
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <RegionalSidebar activeItem="Region Overview" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--regional-sidebar-width, 256px)' }}>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="text-gray-600 font-medium">Loading regional dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const storagePercentage = (regionalStats.storageUsed / regionalStats.totalStorage) * 100;
  const onlinePercentage = (regionalStats.activeDevices / regionalStats.edgeDevices) * 100;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <RegionalSidebar activeItem="Region Overview" />
      
      <div className="flex-1" style={{ marginLeft: 'var(--regional-sidebar-width, 256px)' }}>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  Regional Overview Dashboard
                </h1>
                <p className="text-gray-600">Real-time regional statistics and edge device monitoring</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last 7 Days
                </Button>
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Alert Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">1 edge device requires attention</p>
                <p className="text-xs text-amber-700 mt-1">Edge Server - East-01 is experiencing high resource usage</p>
              </div>
              <Button variant="outline" size="sm" className="text-amber-700 border-amber-300 hover:bg-amber-100">
                View Details
              </Button>
            </div>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Datasets</p>
                    <p className="text-3xl font-bold text-gray-900">{regionalStats.totalDatasets.toLocaleString()}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Database className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs text-emerald-600 font-medium">+12.5% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Edge Devices</p>
                    <p className="text-3xl font-bold text-gray-900">{regionalStats.edgeDevices}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-1">
                      {regionalStats.activeDevices} online
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Server className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <Progress value={onlinePercentage} className="h-2" />
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Processing Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{regionalStats.processingRate}</p>
                    <p className="text-xs text-gray-600 mt-1">datasets/min</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium">Real-time processing</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Success Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{regionalStats.successRate}%</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-teal-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-teal-600" />
                  </div>
                </div>
                <Progress value={regionalStats.successRate} className="h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Storage Usage</p>
                  <HardDrive className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {regionalStats.storageUsed}
                    </span>
                    <span className="text-sm text-gray-600">/ {regionalStats.totalStorage} GB</span>
                  </div>
                  <Progress value={storagePercentage} className="h-2" />
                  <p className="text-xs text-gray-500">{storagePercentage.toFixed(1)}% utilized</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Upload Speed</p>
                  <Upload className="h-5 w-5 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {regionalStats.bandwidth.upload}
                    </span>
                    <span className="text-sm text-gray-600">MB/s</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  <p className="text-xs text-gray-500">Average across all devices</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Download Speed</p>
                  <Download className="h-5 w-5 text-green-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {regionalStats.bandwidth.download}
                    </span>
                    <span className="text-sm text-gray-600">MB/s</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-gray-500">Average across all devices</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="devices" className="gap-2">
                <Server className="h-4 w-4" />
                <span className="hidden sm:inline">Devices</span>
              </TabsTrigger>
              <TabsTrigger value="regions" className="gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Regions</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-blue-600" />
                      Regional Distribution
                    </CardTitle>
                    <CardDescription>Dataset distribution across regions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {regionalStats.regions.map((region, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{region.name}</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {region.datasets.toLocaleString()} datasets
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress
                            value={(region.datasets / regionalStats.totalDatasets) * 100}
                            className="flex-1"
                          />
                          <Badge className={getStatusColor(region.status)}>
                            {getStatusIcon(region.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Signal className="h-5 w-5 text-emerald-600" />
                      System Health
                    </CardTitle>
                    <CardDescription>Overall system performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-emerald-900">Overall Health</span>
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                          Excellent
                        </Badge>
                      </div>
                      <Progress value={95} className="h-3 mb-2" />
                      <p className="text-xs text-emerald-700">95% of systems operating normally</p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Cpu className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-700">Avg CPU Usage</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">52%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <HardDrive className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-gray-700">Avg Memory Usage</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">68%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Wifi className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-700">Network Latency</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">12ms</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Devices Tab */}
            <TabsContent value="devices">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-blue-600" />
                        Edge Devices
                      </CardTitle>
                      <CardDescription>Monitor and manage edge computing devices</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {edgeDevices.map((device) => (
                      <Card key={device.id} className="border-2 hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-1">{device.name}</h4>
                                  <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {device.location}
                                  </p>
                                </div>
                                <Badge className={getStatusColor(device.status)}>
                                  {device.status === 'online' && <Wifi className="h-3 w-3 mr-1" />}
                                  {device.status === 'offline' && <WifiOff className="h-3 w-3 mr-1" />}
                                  {device.status === 'warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                  {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Uptime</p>
                                  <p className="text-sm font-semibold text-gray-900">{device.uptime}%</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Processed</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {device.dataProcessed.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Last Sync</p>
                                  <p className="text-sm font-semibold text-gray-900">{device.lastSync}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Status</p>
                                  <p className="text-sm font-semibold text-emerald-600">Active</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-600">CPU</span>
                                    <span className="text-xs font-medium text-gray-900">{device.cpuUsage}%</span>
                                  </div>
                                  <Progress value={device.cpuUsage} className="h-1.5" />
                                </div>
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-600">Memory</span>
                                    <span className="text-xs font-medium text-gray-900">{device.memoryUsage}%</span>
                                  </div>
                                  <Progress value={device.memoryUsage} className="h-1.5" />
                                </div>
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-600">Storage</span>
                                    <span className="text-xs font-medium text-gray-900">{device.storageUsed}%</span>
                                  </div>
                                  <Progress value={device.storageUsed} className="h-1.5" />
                                </div>
                              </div>
                            </div>

                            <div className="flex lg:flex-col gap-2">
                              <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                                <Eye className="h-4 w-4 mr-2" />
                                Details
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                                <Settings className="h-4 w-4 mr-2" />
                                Config
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Regions Tab */}
            <TabsContent value="regions">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {regionalStats.regions.map((region, index) => (
                  <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-blue-600" />
                          {region.name}
                        </CardTitle>
                        <Badge className={getStatusColor(region.status)}>
                          {getStatusIcon(region.status)}
                          <span className="ml-1 capitalize">{region.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Database className="h-4 w-4 text-blue-600" />
                            <p className="text-xs font-medium text-blue-900">Datasets</p>
                          </div>
                          <p className="text-2xl font-bold text-blue-900">
                            {region.datasets.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Server className="h-4 w-4 text-purple-600" />
                            <p className="text-xs font-medium text-purple-900">Devices</p>
                          </div>
                          <p className="text-2xl font-bold text-purple-900">{region.devices}</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">Contribution Rate</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {((region.datasets / regionalStats.totalDatasets) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">Active Devices</span>
                          <span className="text-sm font-semibold text-emerald-600">
                            {Math.floor(region.devices * 0.95)} / {region.devices}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">Avg Processing</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {Math.floor(regionalStats.processingRate / regionalStats.regions.length)}/min
                          </span>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Region Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest events and system activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="mt-1">
                          {activity.status === 'success' && (
                            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            </div>
                          )}
                          {activity.status === 'warning' && (
                            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                            </div>
                          )}
                          {activity.status === 'error' && (
                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-1">{activity.action}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {activity.region}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {activity.time}
                            </span>
                          </div>
                        </div>
                        <Badge
                          className={
                            activity.status === 'success'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : activity.status === 'warning'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}