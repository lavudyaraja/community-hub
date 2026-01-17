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
  Cpu, RefreshCw, Eye, FileText, Clock, CheckCircle2, 
  XCircle, AlertCircle, Search, Filter, Download, 
  TrendingUp, Database, Loader2, ChevronDown, ChevronUp,
  BarChart3, Activity, Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface MLQueueItem {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  submittedBy: string;
  submittedDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  confidence?: number;
  modelVersion?: string;
  processingTime?: number;
  predictions?: {
    label: string;
    confidence: number;
  }[];
  errors?: string[];
}

// Mock data generator
const generateMockData = (): MLQueueItem[] => {
  const statuses: MLQueueItem['status'][] = ['pending', 'processing', 'completed', 'failed'];
  const fileTypes = ['image', 'audio', 'video', 'document'];
  const modelVersions = ['v2.1', 'v2.3', 'v3.0', 'v3.2'];
  const users = ['john@example.com', 'sarah@example.com', 'mike@example.com', 'emma@example.com'];
  
  return Array.from({ length: 50 }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const confidence = status === 'completed' ? 75 + Math.random() * 25 : undefined;
    
    return {
      id: `queue-${i + 1}`,
      fileName: `${fileType}_dataset_2024_${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}_${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}_${String(i + 1).padStart(3, '0')}.${fileType === 'image' ? 'jpg' : fileType === 'audio' ? 'mp3' : fileType === 'video' ? 'mp4' : 'json'}`,
      fileType,
      fileSize: Math.floor(Math.random() * 50000000) + 100000,
      submittedBy: users[Math.floor(Math.random() * users.length)],
      submittedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      status,
      confidence: confidence ? Math.round(confidence) : undefined,
      modelVersion: status !== 'pending' ? modelVersions[Math.floor(Math.random() * modelVersions.length)] : undefined,
      processingTime: status === 'completed' || status === 'failed' ? Math.floor(Math.random() * 300) + 10 : undefined,
      predictions: status === 'completed' ? [
        { label: 'Category A', confidence: Math.round(70 + Math.random() * 30) },
        { label: 'Category B', confidence: Math.round(50 + Math.random() * 30) },
        { label: 'Category C', confidence: Math.round(30 + Math.random() * 30) }
      ] : undefined,
      errors: status === 'failed' ? ['Model timeout', 'Invalid format'] : undefined
    };
  });
};

export default function MLValidationQueue() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [queueItems, setQueueItems] = useState<MLQueueItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MLQueueItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'confidence' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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
    loadQueueData();
  }, [router]);

  const loadQueueData = useCallback(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setQueueItems(generateMockData());
      setIsLoading(false);
    }, 800);
  }, []);

  const stats = useMemo(() => {
    return {
      pending: queueItems.filter(item => item.status === 'pending').length,
      processing: queueItems.filter(item => item.status === 'processing').length,
      completed: queueItems.filter(item => item.status === 'completed').length,
      failed: queueItems.filter(item => item.status === 'failed').length,
      avgConfidence: Math.round(
        queueItems
          .filter(item => item.confidence)
          .reduce((sum, item) => sum + (item.confidence || 0), 0) /
        queueItems.filter(item => item.confidence).length || 0
      ),
      avgProcessingTime: Math.round(
        queueItems
          .filter(item => item.processingTime)
          .reduce((sum, item) => sum + (item.processingTime || 0), 0) /
        queueItems.filter(item => item.processingTime).length || 0
      )
    };
  }, [queueItems]);

  const filteredItems = useMemo(() => {
    let filtered = queueItems;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.submittedBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = a.submittedDate.getTime() - b.submittedDate.getTime();
      } else if (sortBy === 'confidence') {
        comparison = (a.confidence || 0) - (b.confidence || 0);
      } else if (sortBy === 'name') {
        comparison = a.fileName.localeCompare(b.fileName);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [queueItems, statusFilter, searchQuery, sortBy, sortOrder]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handleViewDetails = (item: MLQueueItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    // Simulate API call
    setTimeout(() => {
      setQueueItems(prev => prev.map(item =>
        item.id === id ? { ...item, status: 'completed' as const } : item
      ));
      toast.success('Item approved successfully');
      setActionLoading(null);
      setIsDetailOpen(false);
    }, 1000);
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    // Simulate API call
    setTimeout(() => {
      setQueueItems(prev => prev.filter(item => item.id !== id));
      toast.success('Item rejected successfully');
      setActionLoading(null);
      setIsDetailOpen(false);
    }, 1000);
  };

  const handleRetry = async (id: string) => {
    setActionLoading(id);
    // Simulate API call
    setTimeout(() => {
      setQueueItems(prev => prev.map(item =>
        item.id === id ? { ...item, status: 'processing' as const } : item
      ));
      toast.success('Retry initiated');
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

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { className: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      processing: { className: 'bg-blue-100 text-blue-800', label: 'Processing' },
      completed: { className: 'bg-green-100 text-green-800', label: 'Completed' },
      failed: { className: 'bg-red-100 text-red-800', label: 'Failed' }
    };
    const config = configs[status as keyof typeof configs] || configs.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'processing': return Cpu;
      case 'completed': return CheckCircle2;
      case 'failed': return XCircle;
      default: return AlertCircle;
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <RegionalSidebar activeItem="ML Validation Queue" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--regional-sidebar-width, 256px)' }}>
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <RegionalSidebar activeItem="ML Validation Queue" />
      <div className="flex-1" style={{ marginLeft: 'var(--regional-sidebar-width, 256px)' }}>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">ML Validation Queue</h1>
              <p className="text-gray-600">Datasets pending ML model validation</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadQueueData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Processing</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.processing}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Cpu className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg Confidence</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.avgConfidence}%</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy as 'date' | 'confidence' | 'name');
                    setSortOrder(newSortOrder as 'asc' | 'desc');
                  }}
                  className="px-4 py-2 border rounded-lg bg-white"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="confidence-desc">High Confidence</option>
                  <option value="confidence-asc">Low Confidence</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Queue Items List */}
          <Card>
            <CardHeader>
              <CardTitle>Queue Items ({filteredItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {paginatedItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No items found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedItems.map((item) => {
                    const StatusIcon = getStatusIcon(item.status);
                    return (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`p-3 rounded-lg ${
                            item.fileType === 'image' ? 'bg-purple-100' :
                            item.fileType === 'audio' ? 'bg-blue-100' :
                            item.fileType === 'video' ? 'bg-pink-100' : 'bg-gray-100'
                          }`}>
                            <FileText className={`h-5 w-5 ${
                              item.fileType === 'image' ? 'text-purple-600' :
                              item.fileType === 'audio' ? 'text-blue-600' :
                              item.fileType === 'video' ? 'text-pink-600' : 'text-gray-600'
                            }`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{item.fileName}</p>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                              <span>{formatFileSize(item.fileSize)}</span>
                              <span>•</span>
                              <span>{item.submittedBy}</span>
                              {item.confidence && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Activity className="h-3 w-3" />
                                    {item.confidence}%
                                  </span>
                                </>
                              )}
                              {item.modelVersion && (
                                <>
                                  <span>•</span>
                                  <span>Model {item.modelVersion}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {getStatusBadge(item.status)}
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(item)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
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
            <DialogTitle>ML Validation Details</DialogTitle>
            <DialogDescription>Review ML model validation results</DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6 mt-4">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedItem.fileName}</h3>
                  <p className="text-sm text-gray-600">{selectedItem.fileType.toUpperCase()} • {formatFileSize(selectedItem.fileSize)}</p>
                </div>
                {getStatusBadge(selectedItem.status)}
              </div>

              {/* Predictions */}
              {selectedItem.predictions && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      ML Predictions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedItem.predictions.map((pred, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{pred.label}</span>
                            <span className="text-sm font-bold text-blue-600">{pred.confidence}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${pred.confidence}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Submitted By</p>
                    <p className="font-semibold">{selectedItem.submittedBy}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Submitted Date</p>
                    <p className="font-semibold">{selectedItem.submittedDate.toLocaleString()}</p>
                  </CardContent>
                </Card>
                {selectedItem.modelVersion && (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-500 mb-1">Model Version</p>
                      <p className="font-semibold">{selectedItem.modelVersion}</p>
                    </CardContent>
                  </Card>
                )}
                {selectedItem.processingTime && (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-500 mb-1">Processing Time</p>
                      <p className="font-semibold">{selectedItem.processingTime}s</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Errors */}
              {selectedItem.errors && selectedItem.errors.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                      <AlertCircle className="h-5 w-5" />
                      Errors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-red-700">
                      {selectedItem.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedItem.status === 'completed' && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(selectedItem.id)}
                    disabled={actionLoading === selectedItem.id}
                  >
                    {actionLoading === selectedItem.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                )}
                {selectedItem.status === 'failed' && (
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleRetry(selectedItem.id)}
                    disabled={actionLoading === selectedItem.id}
                  >
                    {actionLoading === selectedItem.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Retry
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => handleReject(selectedItem.id)}
                  disabled={actionLoading === selectedItem.id}
                >
                  {actionLoading === selectedItem.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}