"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RegionalSidebar } from '../components/sidebar';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import { 
  XCircle, RefreshCw, Eye, FileText, AlertTriangle, 
  Search, Trash2, RotateCcw, Download, Filter,
  Clock, TrendingDown, AlertCircle, Loader2,
  Database, Calendar, User, FileX
} from 'lucide-react';
import { toast } from 'sonner';

interface RejectionReason {
  category: 'quality' | 'format' | 'content' | 'policy' | 'technical';
  message: string;
  details?: string;
}

interface RejectedDataset {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  submittedBy: string;
  submittedDate: Date;
  rejectedDate: Date;
  rejectedBy: string;
  reasons: RejectionReason[];
  qualityScore?: number;
  reviewNotes?: string;
  canResubmit: boolean;
  previousAttempts: number;
}

// Mock data generator
const generateMockRejectedDatasets = (): RejectedDataset[] => {
  const fileTypes = ['image', 'audio', 'video', 'document'];
  const users = ['john@example.com', 'sarah@example.com', 'mike@example.com', 'emma@example.com'];
  const reviewers = ['admin@example.com', 'reviewer1@example.com', 'reviewer2@example.com'];
  
  const rejectionReasons: RejectionReason[][] = [
    [
      { category: 'quality', message: 'Quality score below threshold', details: 'Score: 42/100. Minimum required: 70/100' },
      { category: 'technical', message: 'Poor resolution', details: 'Resolution: 320x240. Required: 1280x720 minimum' }
    ],
    [
      { category: 'format', message: 'Invalid file format', details: 'File format not supported for this category' },
      { category: 'technical', message: 'Corrupted file detected', details: 'File integrity check failed' }
    ],
    [
      { category: 'content', message: 'Inappropriate content detected', details: 'Content violates community guidelines' }
    ],
    [
      { category: 'policy', message: 'Copyright violation', details: 'Content appears to be copyrighted material' },
      { category: 'policy', message: 'Terms of service violation' }
    ],
    [
      { category: 'quality', message: 'Duplicate submission', details: 'This dataset already exists in the system' }
    ],
    [
      { category: 'technical', message: 'File size exceeds limit', details: 'Size: 520MB. Maximum allowed: 500MB' }
    ],
    [
      { category: 'format', message: 'Missing required metadata', details: 'Required fields: author, license, description' }
    ],
    [
      { category: 'quality', message: 'Insufficient data points', details: 'Contains 50 samples. Minimum required: 100' }
    ]
  ];

  return Array.from({ length: 30 }, (_, i) => {
    const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const submittedDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const rejectedDate = new Date(submittedDate.getTime() + Math.random() * 24 * 60 * 60 * 1000);
    const reasons = rejectionReasons[i % rejectionReasons.length];
    const previousAttempts = Math.floor(Math.random() * 3);
    
    return {
      id: `rejected-${i + 1}`,
      fileName: `${fileType}_dataset_2024_${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}_${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}_${String(i + 1).padStart(3, '0')}.${fileType === 'image' ? 'jpg' : fileType === 'audio' ? 'mp3' : fileType === 'video' ? 'mp4' : 'json'}`,
      fileType,
      fileSize: Math.floor(Math.random() * 500000000) + 100000,
      submittedBy: users[Math.floor(Math.random() * users.length)],
      submittedDate,
      rejectedDate,
      rejectedBy: reviewers[Math.floor(Math.random() * reviewers.length)],
      reasons,
      qualityScore: reasons.some(r => r.category === 'quality') ? Math.floor(Math.random() * 50) + 20 : undefined,
      reviewNotes: Math.random() > 0.5 ? 'Please address the quality issues and resubmit.' : undefined,
      canResubmit: reasons.every(r => r.category !== 'policy' && r.category !== 'content'),
      previousAttempts
    };
  });
};

export default function RejectedDatasets() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [datasets, setDatasets] = useState<RejectedDataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<RejectedDataset | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const itemsPerPage = 10;

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
    loadRejectedDatasets();
  }, [router]);

  const loadRejectedDatasets = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setDatasets(generateMockRejectedDatasets());
      setIsLoading(false);
    }, 800);
  }, []);

  const stats = useMemo(() => {
    const categoryCount = (category: string) => 
      datasets.filter(d => d.reasons.some(r => r.category === category)).length;
    
    return {
      total: datasets.length,
      quality: categoryCount('quality'),
      format: categoryCount('format'),
      content: categoryCount('content'),
      policy: categoryCount('policy'),
      technical: categoryCount('technical'),
      canResubmit: datasets.filter(d => d.canResubmit).length,
      avgPreviousAttempts: Math.round(
        datasets.reduce((sum, d) => sum + d.previousAttempts, 0) / datasets.length * 10
      ) / 10
    };
  }, [datasets]);

  const filteredDatasets = useMemo(() => {
    let filtered = datasets;

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(d => 
        d.reasons.some(r => r.category === categoryFilter)
      );
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(d =>
        d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.submittedBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return b.rejectedDate.getTime() - a.rejectedDate.getTime();
      } else {
        return a.fileName.localeCompare(b.fileName);
      }
    });

    return filtered;
  }, [datasets, categoryFilter, searchQuery, sortBy]);

  const paginatedDatasets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDatasets.slice(start, start + itemsPerPage);
  }, [filteredDatasets, currentPage]);

  const totalPages = Math.ceil(filteredDatasets.length / itemsPerPage);

  const handleViewDetails = (dataset: RejectedDataset) => {
    setSelectedDataset(dataset);
    setIsDetailOpen(true);
  };

  const handleResubmit = async (id: string) => {
    setActionLoading(id);
    setTimeout(() => {
      setDatasets(prev => prev.filter(d => d.id !== id));
      toast.success('Dataset marked for resubmission');
      setActionLoading(null);
      setIsDetailOpen(false);
    }, 1000);
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    setTimeout(() => {
      setDatasets(prev => prev.filter(d => d.id !== id));
      toast.success('Dataset deleted successfully');
      setActionLoading(null);
      setIsDetailOpen(false);
    }, 1000);
  };

  const formatFileSize = (bytes: number): string => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 }
    ];
    
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
      }
    }
    return 'just now';
  };

  const getCategoryBadge = (category: string) => {
    const configs = {
      quality: { className: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      format: { className: 'bg-purple-100 text-purple-800', icon: FileX },
      content: { className: 'bg-red-100 text-red-800', icon: AlertCircle },
      policy: { className: 'bg-pink-100 text-pink-800', icon: XCircle },
      technical: { className: 'bg-blue-100 text-blue-800', icon: AlertTriangle }
    };
    const config = configs[category as keyof typeof configs] || configs.quality;
    const Icon = config.icon;
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  const getFileTypeColor = (type: string) => {
    const colors = {
      image: 'bg-purple-100 text-purple-600',
      audio: 'bg-blue-100 text-blue-600',
      video: 'bg-pink-100 text-pink-600',
      document: 'bg-gray-100 text-gray-600'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <RegionalSidebar activeItem="Rejected Datasets" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--regional-sidebar-width, 256px)' }}>
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <RegionalSidebar activeItem="Rejected Datasets" />
      <div className="flex-1" style={{ marginLeft: 'var(--regional-sidebar-width, 256px)' }}>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Rejected Datasets</h1>
              <p className="text-gray-600">Datasets that failed validation</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadRejectedDatasets}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Rejected</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-xs text-red-600 mt-1 flex items-center">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Last 30 days
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Can Resubmit</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.canResubmit}</p>
                    <p className="text-xs text-blue-600 mt-1 flex items-center">
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Eligible for retry
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <RotateCcw className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quality Issues</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.quality}</p>
                    <p className="text-xs text-orange-600 mt-1 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Most common
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg Attempts</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.avgPreviousAttempts}</p>
                    <p className="text-xs text-gray-600 mt-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Before rejection
                    </p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Clock className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Rejection Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.quality}</div>
                  <p className="text-sm text-gray-600 mt-1">Quality</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.format}</div>
                  <p className="text-sm text-gray-600 mt-1">Format</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.content}</div>
                  <p className="text-sm text-gray-600 mt-1">Content</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">{stats.policy}</div>
                  <p className="text-sm text-gray-600 mt-1">Policy</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.technical}</div>
                  <p className="text-sm text-gray-600 mt-1">Technical</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by filename or user..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg bg-white"
                >
                  <option value="all">All Categories</option>
                  <option value="quality">Quality Issues</option>
                  <option value="format">Format Issues</option>
                  <option value="content">Content Issues</option>
                  <option value="policy">Policy Violations</option>
                  <option value="technical">Technical Issues</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
                  className="px-4 py-2 border rounded-lg bg-white"
                >
                  <option value="date">Recent First</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Datasets List */}
          <Card>
            <CardHeader>
              <CardTitle>Rejected Datasets ({filteredDatasets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {paginatedDatasets.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No rejected datasets found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedDatasets.map((dataset) => (
                    <div key={dataset.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${getFileTypeColor(dataset.fileType)}`}>
                          <FileText className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 truncate">{dataset.fileName}</p>
                            {dataset.previousAttempts > 0 && (
                              <Badge variant="outline" className="text-xs">
                                Attempt {dataset.previousAttempts + 1}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            {dataset.reasons.slice(0, 2).map((reason, idx) => (
                              <span key={idx}>
                                {getCategoryBadge(reason.category)}
                              </span>
                            ))}
                            {dataset.reasons.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{dataset.reasons.length - 2} more
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {dataset.submittedBy}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getTimeAgo(dataset.rejectedDate)}
                            </span>
                            <span>•</span>
                            <span>{formatFileSize(dataset.fileSize)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(dataset)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredDatasets.length)} of {filteredDatasets.length}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rejection Details</DialogTitle>
            <DialogDescription>Review rejection reasons and take action</DialogDescription>
          </DialogHeader>

          {selectedDataset && (
            <div className="space-y-6 mt-4">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFileTypeColor(selectedDataset.fileType)}`}>
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedDataset.fileName}</h3>
                  <p className="text-sm text-gray-600">{formatFileSize(selectedDataset.fileSize)}</p>
                </div>
                <Badge className="bg-red-100 text-red-800">
                  <XCircle className="h-3 w-3 mr-1" />
                  Rejected
                </Badge>
              </div>

              {/* Rejection Reasons */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    Rejection Reasons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedDataset.reasons.map((reason, idx) => (
                      <div key={idx} className="p-4 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-start gap-3">
                          {getCategoryBadge(reason.category)}
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 mb-1">{reason.message}</p>
                            {reason.details && (
                              <p className="text-sm text-gray-600">{reason.details}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quality Score */}
              {selectedDataset.qualityScore !== undefined && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quality Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Score</span>
                        <span className="text-2xl font-bold text-orange-600">{selectedDataset.qualityScore}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full"
                          style={{ width: `${selectedDataset.qualityScore}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">Minimum required: 70/100</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Review Notes */}
              {selectedDataset.reviewNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reviewer Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedDataset.reviewNotes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Submitted By</p>
                    <p className="font-semibold">{selectedDataset.submittedBy}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Rejected By</p>
                    <p className="font-semibold">{selectedDataset.rejectedBy}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Submitted Date</p>
                    <p className="font-semibold">{selectedDataset.submittedDate.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Rejected Date</p>
                    <p className="font-semibold">{selectedDataset.rejectedDate.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Previous Attempts */}
              {selectedDataset.previousAttempts > 0 && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        This dataset has been submitted <strong>{selectedDataset.previousAttempts}</strong> time{selectedDataset.previousAttempts !== 1 ? 's' : ''} before
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedDataset.canResubmit ? (
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleResubmit(selectedDataset.id)}
                    disabled={actionLoading === selectedDataset.id}
                  >
                    {actionLoading === selectedDataset.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    Mark for Resubmission
                  </Button>
                ) : (
                  <div className="flex-1 p-3 bg-gray-100 rounded-lg text-center text-sm text-gray-600">
                    <XCircle className="h-4 w-4 inline mr-2" />
                    Cannot be resubmitted due to policy/content violations
                  </div>
                )}
                <Button
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(selectedDataset.id)}
                  disabled={actionLoading === selectedDataset.id}
                >
                  {actionLoading === selectedDataset.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete Permanently
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}