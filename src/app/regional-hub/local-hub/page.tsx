"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RegionalSidebar } from '../components/sidebar';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import {
  Server,
  Database,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Upload,
  Download,
  RefreshCw,
  Filter,
  Search,
  FileCheck,
  AlertTriangle,
  Wifi,
  HardDrive,
  Activity,
  Send,
  Loader2,
  Eye,
  Settings,
  BarChart3,
  TrendingUp,
  Users,
  MapPin,
  Zap,
  Package,
  CheckCircle2,
  AlertCircle,
  Circle,
  Play,
  Pause
} from 'lucide-react';
import { toast } from 'sonner';

interface Submission {
  id: string;
  fileName: string;
  fileType: 'image' | 'audio' | 'video' | 'document';
  fileSize: number;
  sourceDevice: string;
  region: string;
  uploadedAt: string;
  status: 'pending' | 'validating' | 'validated' | 'rejected' | 'forwarded';
  validationScore: number;
  errors: string[];
}

interface EdgeDevice {
  id: string;
  name: string;
  region: string;
  status: 'online' | 'offline';
  submissionsToday: number;
  lastSync: string;
}

export default function LocalHubDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoValidate, setAutoValidate] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Demo data - Submissions from Edge Databases (Level 0)
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: 'SUB-001',
      fileName: 'regional_data_north_01.jpg',
      fileType: 'image',
      fileSize: 2456789,
      sourceDevice: 'Edge-North-01',
      region: 'North Region',
      uploadedAt: '2 mins ago',
      status: 'pending',
      validationScore: 0,
      errors: []
    },
    {
      id: 'SUB-002',
      fileName: 'audio_sample_south_05.mp3',
      fileType: 'audio',
      fileSize: 5234567,
      sourceDevice: 'Edge-South-02',
      region: 'South Region',
      uploadedAt: '5 mins ago',
      status: 'validating',
      validationScore: 75,
      errors: []
    },
    {
      id: 'SUB-003',
      fileName: 'video_capture_east_12.mp4',
      fileType: 'video',
      fileSize: 15678901,
      sourceDevice: 'Edge-East-01',
      region: 'East Region',
      uploadedAt: '8 mins ago',
      status: 'validated',
      validationScore: 95,
      errors: []
    },
    {
      id: 'SUB-004',
      fileName: 'document_west_report.pdf',
      fileType: 'document',
      fileSize: 1234567,
      sourceDevice: 'Edge-West-03',
      region: 'West Region',
      uploadedAt: '12 mins ago',
      status: 'validated',
      validationScore: 88,
      errors: []
    },
    {
      id: 'SUB-005',
      fileName: 'corrupted_file_north.jpg',
      fileType: 'image',
      fileSize: 456789,
      sourceDevice: 'Edge-North-02',
      region: 'North Region',
      uploadedAt: '15 mins ago',
      status: 'rejected',
      validationScore: 35,
      errors: ['File corrupted', 'Invalid format', 'Missing metadata']
    },
    {
      id: 'SUB-006',
      fileName: 'validated_audio_central.wav',
      fileType: 'audio',
      fileSize: 8901234,
      sourceDevice: 'Edge-Central-01',
      region: 'Central Region',
      uploadedAt: '20 mins ago',
      status: 'forwarded',
      validationScore: 92,
      errors: []
    },
    {
      id: 'SUB-007',
      fileName: 'regional_survey_south.json',
      fileType: 'document',
      fileSize: 234567,
      sourceDevice: 'Edge-South-01',
      region: 'South Region',
      uploadedAt: '25 mins ago',
      status: 'validated',
      validationScore: 98,
      errors: []
    },
    {
      id: 'SUB-008',
      fileName: 'processing_image_west.png',
      fileType: 'image',
      fileSize: 3456789,
      sourceDevice: 'Edge-West-01',
      region: 'West Region',
      uploadedAt: '28 mins ago',
      status: 'validating',
      validationScore: 60,
      errors: []
    }
  ]);

  // Edge Devices connected to Local Hub
  const [edgeDevices] = useState<EdgeDevice[]>([
    { id: 'edge-n1', name: 'Edge-North-01', region: 'North', status: 'online', submissionsToday: 45, lastSync: '2 mins' },
    { id: 'edge-n2', name: 'Edge-North-02', region: 'North', status: 'online', submissionsToday: 38, lastSync: '5 mins' },
    { id: 'edge-s1', name: 'Edge-South-01', region: 'South', status: 'online', submissionsToday: 52, lastSync: '1 min' },
    { id: 'edge-s2', name: 'Edge-South-02', region: 'South', status: 'online', submissionsToday: 41, lastSync: '3 mins' },
    { id: 'edge-e1', name: 'Edge-East-01', region: 'East', status: 'online', submissionsToday: 35, lastSync: '8 mins' },
    { id: 'edge-w1', name: 'Edge-West-01', region: 'West', status: 'online', submissionsToday: 29, lastSync: '4 mins' },
    { id: 'edge-w3', name: 'Edge-West-03', region: 'West', status: 'online', submissionsToday: 33, lastSync: '6 mins' },
    { id: 'edge-c1', name: 'Edge-Central-01', region: 'Central', status: 'offline', submissionsToday: 0, lastSync: '2 hours' },
  ]);

  useEffect(() => {
    validateAndLoadUser();
  }, [router]);

  const validateAndLoadUser = () => {
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

  const stats = {
    totalSubmissions: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    validating: submissions.filter(s => s.status === 'validating').length,
    validated: submissions.filter(s => s.status === 'validated').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
    forwarded: submissions.filter(s => s.status === 'forwarded').length,
    avgValidationScore: Math.round(
      submissions.reduce((acc, s) => acc + s.validationScore, 0) / submissions.length
    ),
    totalEdgeDevices: edgeDevices.length,
    onlineDevices: edgeDevices.filter(d => d.status === 'online').length
  };

  const handleValidateSubmission = (id: string) => {
    setSubmissions(prev =>
      prev.map(sub =>
        sub.id === id
          ? { ...sub, status: 'validating', validationScore: 50 }
          : sub
      )
    );

    setTimeout(() => {
      setSubmissions(prev =>
        prev.map(sub =>
          sub.id === id
            ? {
                ...sub,
                status: Math.random() > 0.2 ? 'validated' : 'rejected',
                validationScore: Math.random() > 0.2 ? 85 + Math.floor(Math.random() * 15) : 30 + Math.floor(Math.random() * 30),
                errors: Math.random() > 0.2 ? [] : ['Quality check failed', 'Metadata incomplete']
              }
            : sub
        )
      );
      toast.success('Validation completed');
    }, 2000);
  };

  const handleForwardToIAD = (id: string) => {
    const submission = submissions.find(s => s.id === id);
    if (submission?.status !== 'validated') {
      toast.error('Only validated submissions can be forwarded');
      return;
    }

    setSubmissions(prev =>
      prev.map(sub =>
        sub.id === id ? { ...sub, status: 'forwarded' } : sub
      )
    );
    toast.success('Forwarded to IAD (Level 3) successfully');
  };

  const handleBulkValidate = () => {
    setIsProcessing(true);
    const pendingSubmissions = submissions.filter(s => s.status === 'pending');
    
    toast.info(`Validating ${pendingSubmissions.length} submissions...`);

    pendingSubmissions.forEach((sub, index) => {
      setTimeout(() => {
        handleValidateSubmission(sub.id);
      }, index * 1000);
    });

    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Bulk validation completed');
    }, pendingSubmissions.length * 1000 + 500);
  };

  const handleBulkForward = () => {
    const validatedSubmissions = submissions.filter(s => s.status === 'validated');
    
    if (validatedSubmissions.length === 0) {
      toast.error('No validated submissions to forward');
      return;
    }

    validatedSubmissions.forEach(sub => {
      handleForwardToIAD(sub.id);
    });
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock },
      validating: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Loader2 },
      validated: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
      forwarded: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Send }
    };

    const { color, icon: Icon } = config[status as keyof typeof config] || config.pending;

    return (
      <Badge className={color}>
        <Icon className={`h-3 w-3 mr-1 ${status === 'validating' ? 'animate-spin' : ''}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sub.sourceDevice.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || sub.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <RegionalSidebar activeItem="Local Hub" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--regional-sidebar-width, 256px)' }}>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="text-gray-600 font-medium">Loading Local Hub...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-gray-50">
      <RegionalSidebar activeItem="Local Hub" />

      <div className="flex-1" style={{ marginLeft: 'var(--regional-sidebar-width, 256px)' }}>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                    <Server className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">Local Hub</h1>
                      <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-sm">
                        Level 2
                      </Badge>
                    </div>
                    <p className="text-gray-600">Data validation and processing center</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoValidate(!autoValidate)}
                  >
                    {autoValidate ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    {autoValidate ? 'Auto: ON' : 'Auto: OFF'}
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* System Architecture Flow */}
              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 rounded-lg bg-gray-700 flex items-center justify-center mb-2">
                          <HardDrive className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="outline" className="text-xs">Level 0</Badge>
                        <span className="text-xs text-gray-600 mt-1">Edge DB</span>
                      </div>
                      
                      <ArrowRight className="h-6 w-6 text-indigo-600" />
                      
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 rounded-lg bg-indigo-600 flex items-center justify-center mb-2 ring-4 ring-indigo-200">
                          <Server className="h-6 w-6 text-white" />
                        </div>
                        <Badge className="bg-indigo-100 text-indigo-800 text-xs">Level 2</Badge>
                        <span className="text-xs font-semibold text-indigo-900 mt-1">Local Hub</span>
                      </div>
                      
                      <ArrowRight className="h-6 w-6 text-indigo-600" />
                      
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 rounded-lg bg-purple-600 flex items-center justify-center mb-2">
                          <Database className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="outline" className="text-xs">Level 3</Badge>
                        <span className="text-xs text-gray-600 mt-1">IAD System</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Incoming</p>
                        <p className="text-2xl font-bold text-indigo-900">{stats.pending + stats.validating}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Validated</p>
                        <p className="text-2xl font-bold text-emerald-600">{stats.validated}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Forwarded</p>
                        <p className="text-2xl font-bold text-purple-600">{stats.forwarded}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Pending Validation</p>
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-xs text-amber-600 font-medium mt-2">Awaiting processing</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Validating Now</p>
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.validating}</p>
                <Progress value={(stats.validating / stats.totalSubmissions) * 100} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Validated</p>
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-emerald-600">{stats.validated}</p>
                <p className="text-xs text-emerald-600 font-medium mt-2">Ready to forward</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Forwarded to IAD</p>
                  <Send className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-purple-600">{stats.forwarded}</p>
                <p className="text-xs text-purple-600 font-medium mt-2">Sent to Level 3</p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg Score</p>
                    <p className="text-2xl font-bold text-indigo-600">{stats.avgValidationScore}%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Edge Devices</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.onlineDevices}/{stats.totalEdgeDevices}</p>
                  </div>
                  <Server className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {Math.round((stats.validated / (stats.validated + stats.rejected || 1)) * 100)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="submissions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="submissions" className="gap-2">
                <Package className="h-4 w-4" />
                Submissions ({submissions.length})
              </TabsTrigger>
              <TabsTrigger value="devices" className="gap-2">
                <Server className="h-4 w-4" />
                Edge Devices ({edgeDevices.length})
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Submissions Tab */}
            <TabsContent value="submissions" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-indigo-600" />
                        Submission Queue
                      </CardTitle>
                      <CardDescription>Manage incoming submissions from edge devices</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleBulkValidate}
                        disabled={isProcessing || stats.pending === 0}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Validate All ({stats.pending})
                      </Button>
                      <Button
                        onClick={handleBulkForward}
                        disabled={stats.validated === 0}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Forward All ({stats.validated})
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by filename or device..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="validating">Validating</option>
                      <option value="validated">Validated</option>
                      <option value="rejected">Rejected</option>
                      <option value="forwarded">Forwarded</option>
                    </select>
                  </div>

                  {/* Submissions Table */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>File Name</TableHead>
                          <TableHead>Source Device</TableHead>
                          <TableHead>Region</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Uploaded</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubmissions.map((submission) => (
                          <TableRow key={submission.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <FileCheck className="h-4 w-4 text-gray-400" />
                                <span className="truncate max-w-[200px]">{submission.fileName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Server className="h-3.5 w-3.5 text-indigo-600" />
                                {submission.sourceDevice}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-blue-600" />
                                {submission.region}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {formatFileSize(submission.fileSize)}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {submission.uploadedAt}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={submission.validationScore} className="h-2 w-16" />
                                <span className="text-sm font-medium">{submission.validationScore}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(submission.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center gap-1 justify-end">
                                {submission.status === 'pending' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleValidateSubmission(submission.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Validate
                                  </Button>
                                )}
                                {submission.status === 'validated' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleForwardToIAD(submission.id)}
                                    className="text-purple-600 border-purple-300 hover:bg-purple-50"
                                  >
                                    <Send className="h-4 w-4 mr-1" />
                                    Forward
                                  </Button>
                                )}
                                {submission.status === 'rejected' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-300"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View Errors
                                  </Button>
                                )}
                                {submission.status === 'forwarded' && (
                                  <Badge className="bg-purple-100 text-purple-800">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Sent
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Edge Devices Tab */}
            <TabsContent value="devices">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-indigo-600" />
                    Connected Edge Devices
                  </CardTitle>
                  <CardDescription>Monitor edge devices connected to this local hub</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {edgeDevices.map((device) => (
                      <Card key={device.id} className="border-2 hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                device.status === 'online' ? 'bg-emerald-100' : 'bg-red-100'
                              }`}>
                                <Server className={`h-5 w-5 ${
                                  device.status === 'online' ? 'text-emerald-600' : 'text-red-600'
                                }`} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{device.name}</h4>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {device.region} Region
                                </p>
                              </div>
                            </div>
                            <Badge className={
                              device.status === 'online'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-red-100 text-red-800 border-red-200'
                            }>
                              {device.status === 'online' ? (
                                <Wifi className="h-3 w-3 mr-1" />
                              ) : (
                                <Circle className="h-3 w-3 mr-1" />
                              )}
                              {device.status}
                            </Badge>
                          </div>

                          <Separator className="my-3" />

                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Submissions Today</p>
                              <p className="text-lg font-bold text-gray-900">{device.submissionsToday}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Last Sync</p>
                              <p className="text-lg font-bold text-gray-900">{device.lastSync}</p>
                            </div>
                          </div>

                          <Button variant="outline" size="sm" className="w-full mt-3">
                            <Settings className="h-4 w-4 mr-2" />
                            Manage Device
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-indigo-600" />
                      Validation Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-emerald-900">Success Rate</span>
                        <span className="text-2xl font-bold text-emerald-900">
                          {Math.round((stats.validated / (stats.validated + stats.rejected || 1)) * 100)}%
                        </span>
                      </div>
                      <Progress value={Math.round((stats.validated / (stats.validated + stats.rejected || 1)) * 100)} className="h-3" />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Average Validation Score</span>
                        <span className="text-lg font-bold text-indigo-600">{stats.avgValidationScore}%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Total Processed</span>
                        <span className="text-lg font-bold text-gray-900">
                          {stats.validated + stats.rejected + stats.forwarded}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Processing Time (Avg)</span>
                        <span className="text-lg font-bold text-gray-900">2.3s</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-indigo-600" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">Hub Status</span>
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                          <Zap className="h-3 w-3 mr-1" />
                          Operational
                        </Badge>
                      </div>
                      <p className="text-xs text-blue-700">All systems running normally</p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm text-gray-700">Edge Devices Online</span>
                        </div>
                        <span className="text-lg font-bold text-emerald-600">
                          {stats.onlineDevices}/{stats.totalEdgeDevices}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-indigo-600" />
                          <span className="text-sm text-gray-700">Queue Size</span>
                        </div>
                        <span className="text-lg font-bold text-indigo-600">
                          {stats.pending + stats.validating}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-gray-700">Processing Rate</span>
                        </div>
                        <span className="text-lg font-bold text-purple-600">45/min</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}