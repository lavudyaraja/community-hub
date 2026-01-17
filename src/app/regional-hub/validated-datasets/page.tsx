"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
  CheckCircle2,
  RefreshCw,
  Eye,
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  Database,
  Star,
  TrendingUp,
  BarChart3,
  Image,
  Music,
  Video,
  FileIcon,
  Loader2,
  ArrowUpRight,
  Shield,
  Award,
  Zap,
  Package,
  HardDrive,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ValidatedDataset {
  id: string;
  fileName: string;
  fileType: 'image' | 'audio' | 'video' | 'document';
  fileSize: number;
  sourceLevel: string;
  validatedAt: string;
  validatedBy: string;
  qualityScore: number;
  validationChecks: {
    formatCheck: boolean;
    integrityCheck: boolean;
    qualityCheck: boolean;
    metadataCheck: boolean;
  };
  metadata: {
    resolution?: string;
    duration?: string;
    format: string;
    encoding?: string;
  };
  region: string;
  contributor: string;
  status: 'validated' | 'archived' | 'in-use';
  downloads: number;
  views: number;
}

export default function ValidatedDatasets() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [selectedDataset, setSelectedDataset] = useState<ValidatedDataset | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'name'>('date');

  // Demo validated datasets from Level 1 (Raw Storage System)
  const [datasets] = useState<ValidatedDataset[]>([
    {
      id: 'VAL-001',
      fileName: 'regional_survey_north_2024_01_15.json',
      fileType: 'document',
      fileSize: 2456789,
      sourceLevel: 'Level 1 - Raw Storage',
      validatedAt: '2024-01-15 14:30:22',
      validatedBy: 'Validation System v2.1',
      qualityScore: 9.2,
      validationChecks: {
        formatCheck: true,
        integrityCheck: true,
        qualityCheck: true,
        metadataCheck: true
      },
      metadata: {
        format: 'JSON',
        encoding: 'UTF-8'
      },
      region: 'North Region',
      contributor: 'Regional Office North',
      status: 'validated',
      downloads: 45,
      views: 123
    },
    {
      id: 'VAL-002',
      fileName: 'cultural_images_south_batch_012.jpg',
      fileType: 'image',
      fileSize: 5234567,
      sourceLevel: 'Level 1 - Raw Storage',
      validatedAt: '2024-01-15 13:45:10',
      validatedBy: 'Validation System v2.1',
      qualityScore: 8.8,
      validationChecks: {
        formatCheck: true,
        integrityCheck: true,
        qualityCheck: true,
        metadataCheck: true
      },
      metadata: {
        resolution: '4096x3072',
        format: 'JPEG',
        encoding: 'sRGB'
      },
      region: 'South Region',
      contributor: 'Community Contributor',
      status: 'validated',
      downloads: 78,
      views: 234
    },
    {
      id: 'VAL-003',
      fileName: 'traditional_music_east_collection.mp3',
      fileType: 'audio',
      fileSize: 8901234,
      sourceLevel: 'Level 1 - Raw Storage',
      validatedAt: '2024-01-15 12:20:45',
      validatedBy: 'Validation System v2.1',
      qualityScore: 9.5,
      validationChecks: {
        formatCheck: true,
        integrityCheck: true,
        qualityCheck: true,
        metadataCheck: true
      },
      metadata: {
        duration: '15:42',
        format: 'MP3',
        encoding: '320kbps'
      },
      region: 'East Region',
      contributor: 'Cultural Heritage Team',
      status: 'in-use',
      downloads: 156,
      views: 456
    },
    {
      id: 'VAL-004',
      fileName: 'documentary_west_heritage_2024.mp4',
      fileType: 'video',
      fileSize: 125678901,
      sourceLevel: 'Level 1 - Raw Storage',
      validatedAt: '2024-01-15 11:15:33',
      validatedBy: 'Validation System v2.1',
      qualityScore: 9.7,
      validationChecks: {
        formatCheck: true,
        integrityCheck: true,
        qualityCheck: true,
        metadataCheck: true
      },
      metadata: {
        resolution: '1920x1080',
        duration: '28:45',
        format: 'MP4',
        encoding: 'H.264'
      },
      region: 'West Region',
      contributor: 'Media Production Unit',
      status: 'validated',
      downloads: 89,
      views: 312
    },
    {
      id: 'VAL-005',
      fileName: 'census_data_central_q4_2023.csv',
      fileType: 'document',
      fileSize: 1234567,
      sourceLevel: 'Level 1 - Raw Storage',
      validatedAt: '2024-01-15 10:50:18',
      validatedBy: 'Validation System v2.1',
      qualityScore: 8.5,
      validationChecks: {
        formatCheck: true,
        integrityCheck: true,
        qualityCheck: true,
        metadataCheck: false
      },
      metadata: {
        format: 'CSV',
        encoding: 'UTF-8'
      },
      region: 'Central Region',
      contributor: 'Statistics Department',
      status: 'validated',
      downloads: 34,
      views: 98
    },
    {
      id: 'VAL-006',
      fileName: 'agricultural_survey_images_batch_05.png',
      fileType: 'image',
      fileSize: 3456789,
      sourceLevel: 'Level 1 - Raw Storage',
      validatedAt: '2024-01-15 09:30:55',
      validatedBy: 'Validation System v2.1',
      qualityScore: 9.1,
      validationChecks: {
        formatCheck: true,
        integrityCheck: true,
        qualityCheck: true,
        metadataCheck: true
      },
      metadata: {
        resolution: '2048x1536',
        format: 'PNG',
        encoding: 'RGB'
      },
      region: 'North Region',
      contributor: 'Agriculture Department',
      status: 'validated',
      downloads: 67,
      views: 189
    },
    {
      id: 'VAL-007',
      fileName: 'oral_history_interviews_south.wav',
      fileType: 'audio',
      fileSize: 15678901,
      sourceLevel: 'Level 1 - Raw Storage',
      validatedAt: '2024-01-14 16:45:30',
      validatedBy: 'Validation System v2.1',
      qualityScore: 8.9,
      validationChecks: {
        formatCheck: true,
        integrityCheck: true,
        qualityCheck: true,
        metadataCheck: true
      },
      metadata: {
        duration: '42:18',
        format: 'WAV',
        encoding: '44.1kHz'
      },
      region: 'South Region',
      contributor: 'Heritage Archive',
      status: 'archived',
      downloads: 23,
      views: 67
    },
    {
      id: 'VAL-008',
      fileName: 'educational_content_east_series_ep01.mp4',
      fileType: 'video',
      fileSize: 89012345,
      sourceLevel: 'Level 1 - Raw Storage',
      validatedAt: '2024-01-14 15:20:12',
      validatedBy: 'Validation System v2.1',
      qualityScore: 9.3,
      validationChecks: {
        formatCheck: true,
        integrityCheck: true,
        qualityCheck: true,
        metadataCheck: true
      },
      metadata: {
        resolution: '1280x720',
        duration: '18:30',
        format: 'MP4',
        encoding: 'H.264'
      },
      region: 'East Region',
      contributor: 'Education Department',
      status: 'in-use',
      downloads: 145,
      views: 478
    },
    {
      id: 'VAL-009',
      fileName: 'health_survey_data_west_2024.json',
      fileType: 'document',
      fileSize: 2345678,
      sourceLevel: 'Level 1 - Raw Storage',
      validatedAt: '2024-01-14 14:10:45',
      validatedBy: 'Validation System v2.1',
      qualityScore: 8.7,
      validationChecks: {
        formatCheck: true,
        integrityCheck: true,
        qualityCheck: true,
        metadataCheck: true
      },
      metadata: {
        format: 'JSON',
        encoding: 'UTF-8'
      },
      region: 'West Region',
      contributor: 'Health Ministry',
      status: 'validated',
      downloads: 56,
      views: 167
    },
    {
      id: 'VAL-010',
      fileName: 'infrastructure_images_central_2024.jpg',
      fileType: 'image',
      fileSize: 4567890,
      sourceLevel: 'Level 1 - Raw Storage',
      validatedAt: '2024-01-14 13:05:22',
      validatedBy: 'Validation System v2.1',
      qualityScore: 9.0,
      validationChecks: {
        formatCheck: true,
        integrityCheck: true,
        qualityCheck: true,
        metadataCheck: true
      },
      metadata: {
        resolution: '3840x2160',
        format: 'JPEG',
        encoding: 'sRGB'
      },
      region: 'Central Region',
      contributor: 'Infrastructure Department',
      status: 'validated',
      downloads: 92,
      views: 278
    }
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
    totalValidated: datasets.length,
    thisWeek: datasets.filter(d => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(d.validatedAt) >= weekAgo;
    }).length,
    today: datasets.filter(d => {
      const today = new Date().toDateString();
      return new Date(d.validatedAt).toDateString() === today;
    }).length,
    avgQualityScore: (datasets.reduce((acc, d) => acc + d.qualityScore, 0) / datasets.length).toFixed(1),
    totalDownloads: datasets.reduce((acc, d) => acc + d.downloads, 0),
    totalViews: datasets.reduce((acc, d) => acc + d.views, 0),
    byType: {
      image: datasets.filter(d => d.fileType === 'image').length,
      audio: datasets.filter(d => d.fileType === 'audio').length,
      video: datasets.filter(d => d.fileType === 'video').length,
      document: datasets.filter(d => d.fileType === 'document').length,
    }
  };

  const filteredDatasets = datasets
    .filter(d => {
      const matchesSearch = d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           d.contributor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           d.region.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || d.fileType === filterType;
      const matchesRegion = filterRegion === 'all' || d.region === filterRegion;
      return matchesSearch && matchesType && matchesRegion;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.validatedAt).getTime() - new Date(a.validatedAt).getTime();
      } else if (sortBy === 'score') {
        return b.qualityScore - a.qualityScore;
      } else {
        return a.fileName.localeCompare(b.fileName);
      }
    });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-5 w-5 text-blue-600" />;
      case 'audio':
        return <Music className="h-5 w-5 text-purple-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-600" />;
      default:
        return <FileIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      validated: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle },
      'in-use': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Zap },
      archived: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Package }
    };
    const { color, icon: Icon } = config[status as keyof typeof config] || config.validated;
    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleViewDetails = (dataset: ValidatedDataset) => {
    setSelectedDataset(dataset);
    setIsDetailDialogOpen(true);
  };

  const handleExport = (dataset: ValidatedDataset) => {
    toast.success(`Exporting ${dataset.fileName}`, {
      description: 'Download will start shortly'
    });
  };

  const handleBulkExport = () => {
    if (filteredDatasets.length === 0) {
      toast.error('No datasets to export');
      return;
    }
    toast.success(`Exporting ${filteredDatasets.length} datasets`, {
      description: 'Preparing download package...'
    });
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <RegionalSidebar activeItem="Validated Datasets" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--regional-sidebar-width, 256px)' }}>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            <p className="text-gray-600 font-medium">Loading validated datasets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-gray-50">
      <RegionalSidebar activeItem="Validated Datasets" />

      <div className="flex-1" style={{ marginLeft: 'var(--regional-sidebar-width, 256px)' }}>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">Validated Datasets</h1>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      From Level 1
                    </Badge>
                  </div>
                  <p className="text-gray-600">High-quality validated datasets ready for use</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkExport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Data Flow Indicator */}
            <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-5 w-5 text-gray-700" />
                      <span className="text-sm font-medium text-gray-700">Level 1: Raw Storage</span>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-900">Validation System</span>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-900">Validated Repository</span>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    All Checks Passed
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Total Validated</p>
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalValidated}</p>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs text-emerald-600 font-medium">Quality verified</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.thisWeek}</p>
                <p className="text-xs text-blue-600 font-medium mt-2">Last 7 days</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Today</p>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.today}</p>
                <p className="text-xs text-purple-600 font-medium mt-2">Validated today</p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  <Award className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Avg Quality Score</p>
                <p className="text-2xl font-bold text-amber-600">{stats.avgQualityScore}/10</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <Download className="h-5 w-5 text-indigo-600" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Total Downloads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-5 w-5 text-teal-600" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <Database className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-sm text-gray-600 mb-1">In Active Use</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {datasets.filter(d => d.status === 'in-use').length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* File Type Distribution */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
                Dataset Type Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Image className="h-6 w-6 text-blue-600" />
                    <p className="text-sm font-medium text-blue-900">Images</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{stats.byType.image}</p>
                  <Progress
                    value={(stats.byType.image / stats.totalValidated) * 100}
                    className="h-2 mt-2"
                  />
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Music className="h-6 w-6 text-purple-600" />
                    <p className="text-sm font-medium text-purple-900">Audio</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{stats.byType.audio}</p>
                  <Progress
                    value={(stats.byType.audio / stats.totalValidated) * 100}
                    className="h-2 mt-2"
                  />
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Video className="h-6 w-6 text-red-600" />
                    <p className="text-sm font-medium text-red-900">Videos</p>
                  </div>
                  <p className="text-2xl font-bold text-red-900">{stats.byType.video}</p>
                  <Progress
                    value={(stats.byType.video / stats.totalValidated) * 100}
                    className="h-2 mt-2"
                  />
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-6 w-6 text-gray-600" />
                    <p className="text-sm font-medium text-gray-900">Documents</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.byType.document}</p>
                  <Progress
                    value={(stats.byType.document / stats.totalValidated) * 100}
                    className="h-2 mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Dataset Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-emerald-600" />
                    Validated Datasets Repository
                  </CardTitle>
                  <CardDescription>Browse and manage validated datasets from Level 1</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col lg:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search datasets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Types</option>
                  <option value="image">Images</option>
                  <option value="audio">Audio</option>
                  <option value="video">Videos</option>
                  <option value="document">Documents</option>
                </select>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Regions</option>
                  <option value="North Region">North</option>
                  <option value="South Region">South</option>
                  <option value="East Region">East</option>
                  <option value="West Region">West</option>
                  <option value="Central Region">Central</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'name')}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="date">Latest First</option>
                  <option value="score">Highest Score</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>

              {/* Dataset Grid */}
              <div className="space-y-4">
                {filteredDatasets.map((dataset) => (
                  <Card key={dataset.id} className="border-2 hover:shadow-lg transition-all hover:border-emerald-300">
                    <CardContent className="p-5">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            {getFileTypeIcon(dataset.fileType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate mb-1">{dataset.fileName}</h4>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    {dataset.contributor}
                                  </span>
                                  <span>•</span>
                                  <span>{dataset.region}</span>
                                  <span>•</span>
                                  <span>{formatFileSize(dataset.fileSize)}</span>
                                </div>
                              </div>
                              {getStatusBadge(dataset.status)}
                            </div>

                            <div className="flex items-center gap-6 mt-3">
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-amber-500" />
                                <span className="text-sm font-semibold text-amber-600">
                                  {dataset.qualityScore}/10
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Download className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">{dataset.downloads}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">{dataset.views}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(dataset.validatedAt).toLocaleDateString()}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex lg:flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 lg:flex-none"
                            onClick={() => handleViewDetails(dataset)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 lg:flex-none text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                            onClick={() => handleExport(dataset)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredDatasets.length === 0 && (
                <div className="text-center py-12">
                  <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No datasets found</p>
                  <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dataset Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Dataset Details
            </DialogTitle>
            <DialogDescription>Complete information about this validated dataset</DialogDescription>
          </DialogHeader>

          {selectedDataset && (
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">File Name</p>
                    <p className="font-medium text-gray-900 break-all">{selectedDataset.fileName}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">File Type</p>
                    <p className="font-medium text-gray-900 capitalize">{selectedDataset.fileType}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">File Size</p>
                    <p className="font-medium text-gray-900">{formatFileSize(selectedDataset.fileSize)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Quality Score</p>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-500" />
                      <p className="font-bold text-amber-600 text-lg">{selectedDataset.qualityScore}/10</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Validation Checks */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Validation Checks</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg border-2 ${
                    selectedDataset.validationChecks.formatCheck
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      {selectedDataset.validationChecks.formatCheck ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="text-sm font-medium">Format Check</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border-2 ${
                    selectedDataset.validationChecks.integrityCheck
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      {selectedDataset.validationChecks.integrityCheck ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="text-sm font-medium">Integrity Check</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border-2 ${
                    selectedDataset.validationChecks.qualityCheck
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      {selectedDataset.validationChecks.qualityCheck ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="text-sm font-medium">Quality Check</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border-2 ${
                    selectedDataset.validationChecks.metadataCheck
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      {selectedDataset.validationChecks.metadataCheck ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                      )}
                      <span className="text-sm font-medium">Metadata Check</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Metadata */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Metadata</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedDataset.metadata.resolution && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700 mb-1">Resolution</p>
                      <p className="font-medium text-blue-900">{selectedDataset.metadata.resolution}</p>
                    </div>
                  )}
                  {selectedDataset.metadata.duration && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm text-purple-700 mb-1">Duration</p>
                      <p className="font-medium text-purple-900">{selectedDataset.metadata.duration}</p>
                    </div>
                  )}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Format</p>
                    <p className="font-medium text-gray-900">{selectedDataset.metadata.format}</p>
                  </div>
                  {selectedDataset.metadata.encoding && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Encoding</p>
                      <p className="font-medium text-gray-900">{selectedDataset.metadata.encoding}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Additional Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Additional Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Source Level</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedDataset.sourceLevel}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Validated By</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedDataset.validatedBy}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Validated At</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(selectedDataset.validatedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Region</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedDataset.region}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Contributor</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedDataset.contributor}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleExport(selectedDataset)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Dataset
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}