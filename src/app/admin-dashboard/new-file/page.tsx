"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdminSidebar } from '../components/sidebar';
import { getCurrentAdmin, isAdminAuthenticated } from '@/lib/auth';
import { 
  Shield, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Filter,
  Download,
  Upload,
  RefreshCw,
  X,
  Eye,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  Trash2,
  Clock,
  CheckSquare,
  XSquare,
  MoreVertical,
  SortAsc,
  Loader2,
  Grid3x3,
  List,
  Calendar,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { RejectionDialog } from '@/components/admin/rejection-dialog';

// Types
interface DataFile {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video' | 'document';
  status: 'scanning' | 'anomaly' | 'queued' | 'approved' | 'rejected';
  size?: number;
  uploadedAt?: string;
  thumbnail: string;
  selected?: boolean;
}

interface Metrics {
  totalFiles: number;
  approved: number;
  rejected: number;
  pending: number;
  successRate: number;
}


// Main Component
function ValidationHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('submissionId');
  const isBulk = searchParams.get('bulk') === 'true';
  const bulkCount = parseInt(searchParams.get('count') || '0');
  const [admin, setAdmin] = useState<any>(null);
  
  const [validationMode, setValidationMode] = useState<'auto' | 'manual'>('auto');
  const [isValidating, setIsValidating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [dataFiles, setDataFiles] = useState<DataFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [bulkSubmissionIds, setBulkSubmissionIds] = useState<string[]>([]);
  const [currentBulkIndex, setCurrentBulkIndex] = useState(0);
  
  const [metrics, setMetrics] = useState<Metrics>({
    totalFiles: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    successRate: 0
  });

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<DataFile | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'audio' | 'video' | 'document'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('date');
  
  // Rejection dialog state
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectingFileId, setRejectingFileId] = useState<string | null>(null);
  

  // Check admin authentication
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
  }, [router]);

  // Load submission data - memoized function
  const loadSubmissionData = useCallback(async () => {
    if (!submissionId) {
      console.log('No submissionId provided');
      return;
    }
    
    setIsLoading(true);
    console.log('Fetching submission data for:', submissionId);
    try {
      const response = await fetch(`/api/submissions/${submissionId}`);
      console.log('Submission API response:', response.status, response.ok);
      if (response.ok) {
        const data = await response.json();
        console.log('Submission data loaded:', data);
        setSubmissionData(data);
        
        // Try to load preview if not present
        let preview = data.preview || '';
        if (!preview) {
          try {
            const previewResponse = await fetch(`/api/submissions/${submissionId}/preview`);
            if (previewResponse.ok) {
              const previewData = await previewResponse.json();
              preview = previewData.preview || '';
              
              // Validate video preview format
              if (data.file_type === 'video' && preview) {
                // Ensure it's a valid data URL or blob URL
                if (!preview.startsWith('data:') && !preview.startsWith('blob:') && !preview.startsWith('http')) {
                  // Try to format as data URL
                  const mimeType = data.mime_type || 'video/mp4';
                  preview = `data:${mimeType};base64,${preview}`;
                }
              }
            }
          } catch (error) {
            console.error('Error loading preview:', error);
          }
        } else if (data.file_type === 'video' && preview && !preview.startsWith('data:') && !preview.startsWith('blob:')) {
          // Format existing preview if it's not already a data URL
          const mimeType = data.mime_type || 'video/mp4';
          preview = `data:${mimeType};base64,${preview}`;
        }
        
        // Map database status to UI status
        const mapStatus = (dbStatus: string): 'scanning' | 'anomaly' | 'queued' | 'approved' | 'rejected' => {
          if (dbStatus === 'validated' || dbStatus === 'successful') return 'approved';
          if (dbStatus === 'rejected' || dbStatus === 'failed') return 'rejected';
          if (dbStatus === 'submitted') return 'queued';
          return 'scanning';
        };

        const fileData: DataFile = {
          id: data.id,
          name: data.file_name || data.fileName || 'Unknown',
          type: (data.file_type || data.fileType || 'document') as 'image' | 'audio' | 'video' | 'document',
          status: mapStatus(data.status || 'pending'),
          size: data.file_size || data.fileSize,
          uploadedAt: data.created_at || new Date().toISOString(),
          thumbnail: preview,
        };
        
        setDataFiles([fileData]);
        toast.success('Submission loaded successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load submission:', errorData);
        toast.error(errorData.error || 'Failed to load submission data');
      }
    } catch (error) {
      console.error('Error loading submission:', error);
      toast.error('Error loading submission data');
    } finally {
      setIsLoading(false);
    }
  }, [submissionId]);

  // Load bulk submission IDs from sessionStorage if in bulk mode
  const loadBulkSubmissions = useCallback(async (ids: string[]) => {
    try {
      // Load submission data
      const submissionPromises = ids.map(id => 
        fetch(`/api/submissions/${id}`).then(res => res.ok ? res.json() : null)
      );
      
      const submissions = await Promise.all(submissionPromises);
      const validSubmissions = submissions.filter(s => s !== null);
      
      // Load previews for each submission
      const filesDataPromises = validSubmissions.map(async (data: any) => {
        let preview = data.preview || '';
        
        // If no preview in submission data, try to fetch it
        if (!preview) {
          try {
            const previewResponse = await fetch(`/api/submissions/${data.id}/preview`);
            if (previewResponse.ok) {
              const previewData = await previewResponse.json();
              preview = previewData.preview || '';
              
              // Validate video preview format
              if (data.file_type === 'video' && preview) {
                // Ensure it's a valid data URL or blob URL
                if (!preview.startsWith('data:') && !preview.startsWith('blob:') && !preview.startsWith('http')) {
                  // Try to format as data URL
                  const mimeType = data.mime_type || 'video/mp4';
                  preview = `data:${mimeType};base64,${preview}`;
                }
              }
            }
          } catch (error) {
            console.error(`Error loading preview for ${data.id}:`, error);
          }
        } else if (data.file_type === 'video' && preview && !preview.startsWith('data:') && !preview.startsWith('blob:')) {
          // Format existing preview if it's not already a data URL
          const mimeType = data.mime_type || 'video/mp4';
          preview = `data:${mimeType};base64,${preview}`;
        }
        
        // Map database status to UI status
        const mapStatus = (dbStatus: string): 'scanning' | 'anomaly' | 'queued' | 'approved' | 'rejected' => {
          if (dbStatus === 'validated' || dbStatus === 'successful') return 'approved';
          if (dbStatus === 'rejected' || dbStatus === 'failed') return 'rejected';
          if (dbStatus === 'submitted') return 'queued';
          return 'scanning';
        };

        return {
          id: data.id,
          name: data.file_name || data.fileName || 'Unknown',
          type: (data.file_type || data.fileType || 'document') as 'image' | 'audio' | 'video' | 'document',
          status: mapStatus(data.status || 'pending'),
          size: data.file_size || data.fileSize,
          uploadedAt: data.created_at || new Date().toISOString(),
          thumbnail: preview,
        };
      });
      
      const filesData = await Promise.all(filesDataPromises);
      setDataFiles(filesData);
      
      if (validSubmissions.length > 0) {
        setSubmissionData(validSubmissions[0]); // Set first as primary
      }
      
      if (validSubmissions.length < ids.length) {
        toast.warning(`Loaded ${validSubmissions.length} of ${ids.length} submissions`);
      } else {
        toast.success(`Loaded ${validSubmissions.length} submission(s) for validation`);
      }
    } catch (error) {
      console.error('Error loading bulk submissions:', error);
      toast.error('Error loading submissions');
    }
  }, []);

  // Load bulk submission IDs from database if in bulk mode
  useEffect(() => {
    if (isBulk && admin?.email) {
      const loadFromDatabase = async () => {
        try {
          const response = await fetch(`/api/validation-queue?adminEmail=${encodeURIComponent(admin.email)}`);
          if (response.ok) {
            const queueItems = await response.json();
            const ids = queueItems.map((item: any) => item.submission_id);
            if (ids.length > 0) {
              setBulkSubmissionIds(ids);
              loadBulkSubmissions(ids);
            } else {
              toast.warning('No submissions found in validation queue');
            }
          } else {
            console.error('Failed to load validation queue');
            toast.error('Failed to load validation queue');
          }
        } catch (error) {
          console.error('Error loading validation queue:', error);
          toast.error('Error loading validation queue');
        }
      };
      loadFromDatabase();
    }
  }, [isBulk, admin, loadBulkSubmissions]);

  // Load submission data if submissionId is present or load from validation queue
  useEffect(() => {
    console.log('Validation Hub - submissionId:', submissionId, 'isBulk:', isBulk);
    if (submissionId && !isBulk) {
      console.log('Loading single submission:', submissionId);
      // Add to validation queue if not already there
      if (admin?.email) {
        fetch('/api/validation-queue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            submissionId: submissionId,
            adminEmail: admin.email
          })
        }).catch(err => console.warn('Failed to add to queue:', err));
      }
      loadSubmissionData();
    } else if (isBulk) {
      console.log('Bulk mode detected, loading from database');
    } else if (!submissionId && admin?.email) {
      // Load all pending items from validation queue if no submissionId
      const loadQueue = async () => {
        try {
          const response = await fetch(`/api/validation-queue?adminEmail=${encodeURIComponent(admin.email)}`);
          if (response.ok) {
            const queueItems = await response.json();
            if (queueItems.length > 0) {
              const ids = queueItems.map((item: any) => item.submission_id);
              setBulkSubmissionIds(ids);
              loadBulkSubmissions(ids);
            }
          }
        } catch (error) {
          console.error('Error loading validation queue:', error);
        }
      };
      loadQueue();
    }
  }, [submissionId, isBulk, loadSubmissionData, admin]);

  // Update metrics whenever dataFiles changes
  useEffect(() => {
    const totalFiles = dataFiles.length;
    const approved = dataFiles.filter(f => f.status === 'approved').length;
    const rejected = dataFiles.filter(f => f.status === 'rejected').length;
    const pending = dataFiles.filter(f => !['approved', 'rejected'].includes(f.status)).length;
    const successRate = totalFiles > 0 ? Math.round((approved / totalFiles) * 100) : 0;

    setMetrics({ totalFiles, approved, rejected, pending, successRate });
  }, [dataFiles]);


  const handleValidate = async () => {
    if (!admin || !admin.email) {
      toast.error('Admin information not found');
      return;
    }

    setIsValidating(true);
    
    try {
      // If bulk mode, validate all files in dataFiles
      if (isBulk && dataFiles.length > 0) {
        const validatePromises = dataFiles.map(file => 
          fetch(`/api/submissions/${file.id}/validate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              adminEmail: admin.email
            })
          })
        );
        
        const results = await Promise.allSettled(validatePromises);
        const successful = results.filter((r, index) => 
          r.status === 'fulfilled' && r.value.ok
        ).length;
        
        const failed = results.length - successful;
        
        if (successful > 0) {
          toast.success(`Successfully validated ${successful} submission(s)`);
          
          // Remove from validation queue in database
          try {
            await fetch('/api/validation-queue', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                submissionIds: dataFiles.map(f => f.id),
                adminEmail: admin.email
              })
            });
          } catch (error) {
            console.warn('Failed to remove from validation queue:', error);
          }
        }
        
        if (failed > 0) {
          toast.error(`Failed to validate ${failed} submission(s)`);
        }
        
        router.push('/admin-dashboard/pending-submissions');
      } else if (submissionId && submissionData) {
        // Single submission validation
        const response = await fetch(`/api/submissions/${submissionId}/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            adminEmail: admin.email
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to validate submission');
        }
        
        toast.success('Submission validated successfully');
        
        // Remove from validation queue in database
        try {
          await fetch('/api/validation-queue', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              submissionId: submissionId,
              adminEmail: admin.email
            })
          });
        } catch (error) {
          console.warn('Failed to remove from validation queue:', error);
        }
        
        router.push('/admin-dashboard/pending-submissions');
      }
    } catch (error: any) {
      console.error('Error validating submission:', error);
      toast.error(error.message || 'Failed to validate submission');
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileAction = useCallback(async (fileId: string, action: 'approve' | 'reject') => {
    if (!admin || !admin.email) {
      toast.error('Admin information not found');
      return;
    }

    // For reject action, show dialog first
    if (action === 'reject') {
      setRejectingFileId(fileId);
      setShowRejectDialog(true);
      return;
    }

    // For approve, proceed directly
    try {
      const response = await fetch(`/api/submissions/${fileId}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminEmail: admin.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve submission');
      }

      // Reload submission data from database to get updated status
      try {
        const updatedResponse = await fetch(`/api/submissions/${fileId}`);
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          const mapStatus = (dbStatus: string): 'scanning' | 'anomaly' | 'queued' | 'approved' | 'rejected' => {
            if (dbStatus === 'validated' || dbStatus === 'successful') return 'approved';
            if (dbStatus === 'rejected' || dbStatus === 'failed') return 'rejected';
            if (dbStatus === 'submitted') return 'queued';
            return 'scanning';
          };

          // Update local state with fresh data from database
          setDataFiles(prev => prev.map(file => 
            file.id === fileId ? { 
              ...file, 
              status: mapStatus(updatedData.status || 'pending')
            } : file
          ));
        }
      } catch (reloadError) {
        console.warn('Failed to reload submission data, using local update:', reloadError);
        // Fallback to local state update if reload fails
        setDataFiles(prev => prev.map(file => 
          file.id === fileId ? { ...file, status: 'approved' } : file
        ));
      }
      
      toast.success('File approved and saved to database');
    } catch (error: any) {
      console.error('Error approving file:', error);
      toast.error(error.message || 'Failed to approve file');
    }
  }, [admin]);

  const handleRejectWithFeedback = useCallback(async (
    submissionId: string,
    rejectionReason: string,
    rejectionFeedback: string
  ) => {
    if (!admin || !admin.email) {
      toast.error('Admin information not found');
      throw new Error('Admin information not found');
    }

    try {
      const response = await fetch(`/api/submissions/${submissionId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminEmail: admin.email,
          rejectionReason: rejectionReason || null,
          rejectionFeedback: rejectionFeedback || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject submission');
      }

      // Reload submission data from database to get updated status
      try {
        const updatedResponse = await fetch(`/api/submissions/${submissionId}`);
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          const mapStatus = (dbStatus: string): 'scanning' | 'anomaly' | 'queued' | 'approved' | 'rejected' => {
            if (dbStatus === 'validated' || dbStatus === 'successful') return 'approved';
            if (dbStatus === 'rejected' || dbStatus === 'failed') return 'rejected';
            if (dbStatus === 'submitted') return 'queued';
            return 'scanning';
          };

          // Update local state with fresh data from database
          setDataFiles(prev => prev.map(file => 
            file.id === submissionId ? { 
              ...file, 
              status: mapStatus(updatedData.status || 'pending')
            } : file
          ));
        }
      } catch (reloadError) {
        console.warn('Failed to reload submission data, using local update:', reloadError);
        // Fallback to local state update if reload fails
        setDataFiles(prev => prev.map(file => 
          file.id === submissionId ? { ...file, status: 'rejected' } : file
        ));
      }
      
      toast.success('Submission rejected with feedback');
      setRejectingFileId(null);
    } catch (error: any) {
      console.error('Error rejecting file:', error);
      throw error;
    }
  }, [admin]);



  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedFiles.size === 0) {
      toast.error('No files selected');
      return;
    }

    if (!admin || !admin.email) {
      toast.error('Admin information not found');
      return;
    }

    if (action === 'delete') {
      // For delete, just remove from local state (or implement delete API if needed)
      setDataFiles(prev => prev.filter(f => !selectedFiles.has(f.id)));
      toast.success(`${selectedFiles.size} file(s) deleted`);
      setSelectedFiles(new Set());
      return;
    }

    // For approve/reject, update database
    const selectedIds = Array.from(selectedFiles);
    const endpoint = action === 'approve' ? 'validate' : 'reject';
    
    try {
      const actionPromises = selectedIds.map(id => 
        fetch(`/api/submissions/${id}/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            adminEmail: admin.email
          })
        })
      );

      const results = await Promise.allSettled(actionPromises);
      const successfulIds: string[] = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.ok) {
          successfulIds.push(selectedIds[index]);
        }
      });
      
      const failed = results.length - successfulIds.length;

      if (successfulIds.length > 0) {
        // Reload data from database for successful actions
        const mapStatus = (dbStatus: string): 'scanning' | 'anomaly' | 'queued' | 'approved' | 'rejected' => {
          if (dbStatus === 'validated' || dbStatus === 'successful') return 'approved';
          if (dbStatus === 'rejected' || dbStatus === 'failed') return 'rejected';
          if (dbStatus === 'submitted') return 'queued';
          return 'scanning';
        };

        // Reload updated data from database
        const reloadPromises = successfulIds.map(async (id) => {
          try {
            const response = await fetch(`/api/submissions/${id}`);
            if (response.ok) {
              const data = await response.json();
              return { id, status: mapStatus(data.status || 'pending') };
            }
          } catch (error) {
            console.warn(`Failed to reload submission ${id}:`, error);
          }
          return null;
        });

        const reloadedData = await Promise.all(reloadPromises);
        
        // Update local state with fresh data from database
        setDataFiles(prev => prev.map(file => {
          const updated = reloadedData.find(d => d && d.id === file.id);
          if (updated) {
            return { ...file, status: updated.status };
          }
          // Fallback for files that couldn't be reloaded
          if (selectedFiles.has(file.id)) {
            return { ...file, status: action === 'approve' ? 'approved' : 'rejected' };
          }
          return file;
        }));

        toast.success(`Successfully ${action === 'approve' ? 'approved' : 'rejected'} ${successfulIds.length} file(s) and saved to database`);
      }

      if (failed > 0) {
        toast.error(`Failed to ${action} ${failed} file(s)`);
      }
    } catch (error: any) {
      console.error(`Error in bulk ${action}:`, error);
      toast.error(`Failed to ${action} files`);
    }
    
    setSelectedFiles(new Set());
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredFiles = dataFiles
    .filter(file => filterType === 'all' || file.type === filterType)
    .filter(file => searchQuery === '' || file.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') return (b.uploadedAt || '').localeCompare(a.uploadedAt || '');
      return 0;
    });

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'image': return ImageIcon;
      case 'audio': return Music;
      case 'video': return Video;
      case 'document': return FileText;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'scanning': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'anomaly': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!admin) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar activeItem="Validation Hub" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activeItem="Validation Hub" />
      
      <div className="flex-1" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <span>Dashboard</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">Validation Hub</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  File Validation Center
                  {isBulk && (
                    <Badge className="ml-3 bg-blue-100 text-blue-700 border-blue-200">
                      Bulk Mode ({dataFiles.length} submissions)
                    </Badge>
                  )}
                </h1>
                <p className="text-gray-600">
                  {isBulk 
                    ? `Review and validate ${dataFiles.length} selected submission(s)`
                    : 'Review and validate uploaded submissions efficiently'
                  }
                </p>
              </div>
              <Button variant="outline" onClick={() => router.push('/admin-dashboard/pending-submissions')}>
                <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                Back to Submissions
              </Button>
            </div>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border border-gray-200 shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Files</p>
                    <p className="text-3xl font-bold text-gray-900">{metrics.totalFiles}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Approved</p>
                    <p className="text-3xl font-bold text-green-600">{metrics.approved}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                    <p className="text-3xl font-bold text-yellow-600">{metrics.pending}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{metrics.successRate}%</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-4 lg:space-y-6">
              {/* Validation Mode Selection */}
              <Card className="border border-gray-200 shadow-none">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Validation Mode
                      </CardTitle>
                      <CardDescription>Choose how files should be validated</CardDescription>
                    </div>
                    <Badge variant="outline" className={validationMode === 'auto' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'}>
                      {validationMode === 'auto' ? 'Automatic' : 'Manual'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={validationMode} onValueChange={(v) => setValidationMode(v as any)}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="auto">Automatic Validation</TabsTrigger>
                      <TabsTrigger value="manual">Manual Review</TabsTrigger>
                    </TabsList>
                    <TabsContent value="auto" className="mt-4">
                      <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">AI-Powered Validation</h4>
                          <p className="text-sm text-gray-600">Automatically detect anomalies, verify formats, and check for duplicates using machine learning algorithms.</p>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="manual" className="mt-4">
                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <Eye className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">Manual Inspection</h4>
                          <p className="text-sm text-gray-600">Review each file individually with detailed metadata verification and visual inspection tools.</p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* File Browser */}
              <Card className="border border-gray-200 shadow-none">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Files Under Review</CardTitle>
                      <CardDescription>
                        {selectedFiles.size > 0 ? `${selectedFiles.size} file(s) selected` : `${filteredFiles.length} file(s) found`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex bg-white border border-gray-200 rounded-lg">
                        <Button
                          variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('grid')}
                          className="rounded-r-none"
                        >
                          <Grid3x3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('list')}
                          className="rounded-l-none"
                        >
                          <List className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Toolbar */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                      <SelectTrigger className="w-40">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="image">Images</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="video">Videos</SelectItem>
                        <SelectItem value="document">Documents</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                      <SelectTrigger className="w-40">
                        <SortAsc className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Sort by Date</SelectItem>
                        <SelectItem value="name">Sort by Name</SelectItem>
                        <SelectItem value="status">Sort by Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bulk Actions */}
                  {selectedFiles.size > 0 && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="text-sm font-medium text-blue-900">{selectedFiles.size} selected</span>
                      <div className="flex-1" />
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('approve')}>
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Approve All
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('reject')}>
                        <XSquare className="w-4 h-4 mr-2" />
                        Reject All
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  )}

                  {/* Files Display */}
                  {isLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-3 animate-spin" />
                      <p className="text-gray-600">Loading submission data...</p>
                    </div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">
                        {submissionId ? 'No files found for this submission' : 'No files to validate'}
                      </p>
                      {submissionId && (
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => loadSubmissionData()}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Retry Loading
                        </Button>
                      )}
                    </div>
                  ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredFiles.map((file) => {
                        const Icon = getFileIcon(file.type);
                        return (
                          <div
                            key={file.id}
                            className={cn(
                              "group relative border-2 rounded-lg overflow-hidden transition-all hover:border-blue-300",
                              selectedFiles.has(file.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                            )}
                          >
                            {/* Selection Checkbox */}
                            <div className="absolute top-3 left-3 z-10">
                              <Checkbox
                                checked={selectedFiles.has(file.id)}
                                onCheckedChange={() => toggleFileSelection(file.id)}
                                className="bg-white"
                              />
                            </div>

                            {/* Thumbnail */}
                            <div className="aspect-video bg-gray-100 relative cursor-pointer" onClick={() => { setPreviewFile(file); setShowPreviewModal(true); }}>
                              {file.type === 'image' && file.thumbnail ? (
                                <img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Icon className="w-12 h-12 text-gray-300" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Eye className="w-6 h-6 text-white" />
                              </div>
                            </div>

                            {/* File Info */}
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate text-sm">{file.name}</p>
                                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                </div>
                                <Badge variant="outline" className={cn('text-xs', getStatusColor(file.status))}>
                                  {file.status}
                                </Badge>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                                  disabled={file.status === 'approved'}
                                  onClick={(e) => { e.stopPropagation(); handleFileAction(file.id, 'approve'); }}
                                >
                                  {file.status === 'approved' ? 'Approved' : 'Approve'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                  disabled={file.status === 'rejected'}
                                  onClick={(e) => { e.stopPropagation(); handleFileAction(file.id, 'reject'); }}
                                >
                                  {file.status === 'rejected' ? 'Rejected' : 'Reject'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 border border-gray-200">
                        <Checkbox checked={selectedFiles.size === filteredFiles.length} onCheckedChange={toggleSelectAll} />
                        <div className="flex-1 grid grid-cols-5 gap-4">
                          <span>Name</span>
                          <span>Type</span>
                          <span>Size</span>
                          <span>Status</span>
                          <span className="text-right">Actions</span>
                        </div>
                      </div>
                      {filteredFiles.map((file) => {
                        const Icon = getFileIcon(file.type);
                        return (
                          <div
                            key={file.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border transition-all",
                              selectedFiles.has(file.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                            )}
                          >
                            <Checkbox
                              checked={selectedFiles.has(file.id)}
                              onCheckedChange={() => toggleFileSelection(file.id)}
                            />
                            <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                              <div className="flex items-center gap-2 min-w-0">
                                <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="truncate text-sm font-medium text-gray-900">{file.name}</span>
                              </div>
                              <span className="text-sm text-gray-600 capitalize">{file.type}</span>
                              <span className="text-sm text-gray-600">{formatFileSize(file.size)}</span>
                              <Badge variant="outline" className={cn('text-xs w-fit', getStatusColor(file.status))}>
                                {file.status}
                              </Badge>
                              <div className="flex items-center justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={() => { setPreviewFile(file); setShowPreviewModal(true); }}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-green-600 hover:bg-green-50"
                                  disabled={file.status === 'approved'}
                                  onClick={() => handleFileAction(file.id, 'approve')}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:bg-red-50"
                                  disabled={file.status === 'rejected'}
                                  onClick={() => handleFileAction(file.id, 'reject')}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-4 lg:space-y-6">
              {/* Progress Card */}
              <Card className="border border-gray-200 shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg">Validation Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Completion</span>
                      <span className="font-semibold text-gray-900">{metrics.totalFiles > 0 ? Math.round(((metrics.approved + metrics.rejected) / metrics.totalFiles) * 100) : 0}%</span>
                    </div>
                    <Progress value={metrics.totalFiles > 0 ? ((metrics.approved + metrics.rejected) / metrics.totalFiles) * 100 : 0} className="h-2" />
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Approved</span>
                      <span className="font-semibold text-green-600">{metrics.approved}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Rejected</span>
                      <span className="font-semibold text-red-600">{metrics.rejected}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending</span>
                      <span className="font-semibold text-yellow-600">{metrics.pending}</span>
                    </div>
                  </div>

                  {/* Bulk Validate Button */}
                  {(isBulk || dataFiles.length > 1) && (
                    <div className="pt-4 border-t mt-4">
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleValidate}
                        disabled={isValidating || dataFiles.length === 0}
                      >
                        {isValidating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Validating...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Validate All ({dataFiles.length})
                          </>
                        )}
                      </Button>
                      {isBulk && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Validating {dataFiles.length} submission(s) from pending queue
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Send to Local Hub Button */}
              <Card className="border border-gray-200 shadow-none">
                <CardContent className="pt-6">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      // TODO: Implement send to local hub functionality
                      toast.info('Send to Local Hub functionality will be implemented soon');
                    }}
                    disabled={metrics.approved === 0}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Approved Datasets to Local Hub
                  </Button>
                  {metrics.approved > 0 && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {metrics.approved} approved dataset(s) ready to send
                    </p>
                  )}
                  {metrics.approved === 0 && (
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      No approved datasets available
                    </p>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {previewFile && (() => {
                const Icon = getFileIcon(previewFile.type);
                return <Icon className="w-5 h-5 text-gray-600" />;
              })()}
              <span>{previewFile?.name}</span>
            </DialogTitle>
            <DialogDescription>File Preview and Details</DialogDescription>
          </DialogHeader>

          {previewFile && (
            <div className="space-y-6">
              {/* Preview */}
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {previewFile.type === 'image' && previewFile.thumbnail ? (
                  <img src={previewFile.thumbnail} alt={previewFile.name} className="w-full h-full object-contain" />
                ) : previewFile.type === 'video' && previewFile.thumbnail ? (
                  <video 
                    src={previewFile.thumbnail} 
                    controls 
                    className="w-full h-full"
                    onError={(e) => {
                      console.error('Video playback error in validation hub:', e);
                      toast.error('Video cannot be played. Preview data may be invalid.');
                    }}
                  />
                ) : previewFile.type === 'audio' && previewFile.thumbnail ? (
                  <div className="w-full h-full flex items-center justify-center p-8">
                    <audio src={previewFile.thumbnail} controls className="w-full" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {(() => {
                      const Icon = getFileIcon(previewFile.type);
                      return <Icon className="w-24 h-24 text-gray-300" />;
                    })()}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">File Name</p>
                  <p className="font-medium text-gray-900 text-sm">{previewFile.name}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">File Type</p>
                  <p className="font-medium text-gray-900 text-sm capitalize">{previewFile.type}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">File Size</p>
                  <p className="font-medium text-gray-900 text-sm">{formatFileSize(previewFile.size)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Status</p>
                  <Badge variant="outline" className={cn('text-xs', getStatusColor(previewFile.status))}>
                    {previewFile.status}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={previewFile.status === 'approved'}
                  onClick={() => {
                    handleFileAction(previewFile.id, 'approve');
                    setShowPreviewModal(false);
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {previewFile.status === 'approved' ? 'Approved' : 'Approve File'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  disabled={previewFile.status === 'rejected'}
                  onClick={() => {
                    setShowPreviewModal(false);
                    handleFileAction(previewFile.id, 'reject');
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  {previewFile.status === 'rejected' ? 'Rejected' : 'Reject File'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowPreviewModal(false);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <RejectionDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        submissionId={rejectingFileId}
        adminEmail={admin?.email || ''}
        onReject={handleRejectWithFeedback}
      />
    </div>
  );
}

export default function ValidationHub() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar activeItem="Validation Hub" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    }>
      <ValidationHubContent />
    </Suspense>
  );
}