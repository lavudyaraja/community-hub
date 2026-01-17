"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AdminSidebar } from '../components/sidebar';
import { getCurrentAdmin, isAdminAuthenticated } from '@/lib/auth';
import { Clock, FileText, Eye, CheckCircle2, XCircle, Image as ImageIcon, Video, Music, AlertCircle, Loader2, RefreshCw, CheckSquare, MessageSquare, Send as SendIcon, User, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface SubmissionDetails {
  id: string;
  fileName?: string;
  file_name?: string;
  fileType?: string;
  file_type?: string;
  fileSize?: number;
  file_size?: number;
  userEmail?: string;
  user_email?: string;
  date?: string;
  created_at?: string;
  status?: string;
  preview?: string;
}

interface Comment {
  id: number;
  submission_id: string;
  author_email: string;
  author_type: 'user' | 'admin';
  comment_text: string;
  parent_comment_id?: number | null;
  created_at: string;
  updated_at: string;
}

const PendingSubmissions = () => {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [submissions, setSubmissions] = useState<SubmissionDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetails | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set());
  const [isBulkValidating, setIsBulkValidating] = useState(false);
  
  // Rejection dialog state
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectingSubmissionId, setRejectingSubmissionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [rejectionFeedback, setRejectionFeedback] = useState<string>('');
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

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
    loadPendingSubmissions();
  }, [router]);

  const loadPendingSubmissions = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch('/api/submissions/pending', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const pending = await response.json();
      
      if (Array.isArray(pending)) {
        setSubmissions(pending);
        if (pending.length === 0 && !isRefresh) {
          toast.info('No pending submissions found');
        }
      } else {
        setSubmissions([]);
      }
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setError('Request timeout - database may be slow');
        toast.error('Request timeout. Please refresh.');
      } else {
        setError(error.message || 'Failed to load submissions');
        toast.error('Failed to load submissions');
      }
      console.error('Load error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleValidate = useCallback(async (id: string) => {
    if (!admin || !admin.email) {
      toast.error('Admin information not found');
      return;
    }

    try {
      // Add to validation queue in database
      const response = await fetch('/api/validation-queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: id,
          adminEmail: admin.email
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add to validation queue');
      }

      console.log('Navigating to validation hub with submissionId:', id);
      router.push(`/admin-dashboard/new-file?submissionId=${id}`);
    } catch (error: any) {
      console.error('Error adding to validation queue:', error);
      toast.error('Failed to add to validation queue');
    }
  }, [router, admin]);

  const handleBulkValidate = useCallback(async () => {
    if (selectedSubmissions.size === 0) {
      toast.error('Please select at least one submission');
      return;
    }

    if (!admin || !admin.email) {
      toast.error('Admin information not found');
      return;
    }

    const selectedIds = Array.from(selectedSubmissions);
    
    try {
      // Add all selected submissions to validation queue in database
      const response = await fetch('/api/validation-queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionIds: selectedIds,
          adminEmail: admin.email
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add to validation queue');
      }

      // Navigate to validation hub with the first submission ID
      // The validation hub will load all from database
      router.push(`/admin-dashboard/new-file?submissionId=${selectedIds[0]}&bulk=true&count=${selectedIds.length}`);
    } catch (error: any) {
      console.error('Error adding to validation queue:', error);
      toast.error('Failed to add to validation queue');
    }
  }, [selectedSubmissions, router, admin]);

  const handleBulkReject = useCallback(async () => {
    if (selectedSubmissions.size === 0) {
      toast.error('Please select at least one submission');
      return;
    }

    if (!admin || !admin.email) {
      toast.error('Admin information not found');
      return;
    }

    if (!confirm(`Are you sure you want to reject ${selectedSubmissions.size} submission(s)?`)) {
      return;
    }

    setActionLoading('bulk');
    const selectedIds = Array.from(selectedSubmissions);
    
    try {
      const rejectPromises = selectedIds.map(id => 
        fetch(`/api/submissions/${id}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminEmail: admin.email
          })
        })
      );

      const results = await Promise.allSettled(rejectPromises);
      
      const successful = results.filter((r, index) => 
        r.status === 'fulfilled' && r.value.ok
      ).length;
      
      const failed = results.length - successful;

      if (successful > 0) {
        toast.success(`Successfully rejected ${successful} submission(s)`);
        setSubmissions(prev => prev.filter(s => !selectedSubmissions.has(s.id)));
        setSelectedSubmissions(new Set());
      }
      
      if (failed > 0) {
        toast.error(`Failed to reject ${failed} submission(s)`);
      }

      if (isPreviewOpen && selectedSubmission && selectedSubmissions.has(selectedSubmission.id)) {
        setIsPreviewOpen(false);
      }
    } catch (error: any) {
      toast.error('Failed to reject submissions');
    } finally {
      setActionLoading(null);
    }
  }, [selectedSubmissions, isPreviewOpen, selectedSubmission]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedSubmissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedSubmissions.size === submissions.length) {
      setSelectedSubmissions(new Set());
    } else {
      setSelectedSubmissions(new Set(submissions.map(s => s.id)));
    }
  }, [selectedSubmissions, submissions]);

  const handleReject = useCallback(async (id: string) => {
    // Show rejection dialog instead of directly rejecting
    setRejectingSubmissionId(id);
    setRejectionReason('');
    setRejectionFeedback('');
    setShowRejectDialog(true);
  }, []);

  const handleRejectWithFeedback = useCallback(async () => {
    if (!rejectingSubmissionId || !admin || !admin.email) {
      toast.error('Admin information not found');
      return;
    }

    if (!rejectionReason && !rejectionFeedback) {
      toast.error('Please provide a rejection reason or feedback');
      return;
    }

    if (actionLoading) return;
    setActionLoading(rejectingSubmissionId);
    
    try {
      const response = await fetch(`/api/submissions/${rejectingSubmissionId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: admin.email,
          rejectionReason: rejectionReason || null,
          rejectionFeedback: rejectionFeedback || null
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject submission');
      }
      
      toast.success('Submission rejected with feedback');
      setSubmissions(prev => prev.filter(s => s.id !== rejectingSubmissionId));
      
      if (isPreviewOpen && selectedSubmission?.id === rejectingSubmissionId) {
        setIsPreviewOpen(false);
      }
      
      setShowRejectDialog(false);
      setRejectingSubmissionId(null);
      setRejectionReason('');
      setRejectionFeedback('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject submission');
    } finally {
      setActionLoading(null);
    }
  }, [rejectingSubmissionId, admin, rejectionReason, rejectionFeedback, actionLoading, isPreviewOpen, selectedSubmission]);

  // Load comments when submission is selected
  useEffect(() => {
    if (selectedSubmission && isPreviewOpen) {
      loadComments(selectedSubmission.id);
    }
  }, [selectedSubmission, isPreviewOpen]);

  const loadComments = useCallback(async (submissionId: string) => {
    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/submissions/${submissionId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data || []);
      } else {
        console.error('Failed to load comments');
        setComments([]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  }, []);

  const handlePostComment = useCallback(async () => {
    if (!selectedSubmission || !newComment.trim() || !admin) return;

    setIsPostingComment(true);
    try {
      const response = await fetch(`/api/submissions/${selectedSubmission.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment_text: newComment.trim(),
          author_email: admin.email,
          author_type: 'admin',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to post comment');
      }

      const newCommentData = await response.json();
      setComments(prev => [...prev, newCommentData]);
      setNewComment('');
      toast.success('Comment posted successfully');
      
      // Reload comments
      loadComments(selectedSubmission.id);
    } catch (error: any) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment', {
        description: error.message || 'Please try again later.',
      });
    } finally {
      setIsPostingComment(false);
    }
  }, [selectedSubmission, newComment, admin, loadComments]);

  const handleView = useCallback(async (submission: SubmissionDetails) => {
    setSelectedSubmission(submission);
    setIsPreviewOpen(true);
    setImageLoadError(false);
    setPreviewLoading(true);
    
    // Fetch preview data on-demand if not already loaded
    if (!submission.preview) {
      try {
        const response = await fetch(`/api/submissions/${submission.id}/preview`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.preview) {
            // Update the submission with preview data
            setSelectedSubmission(prev => prev ? { ...prev, preview: data.preview } : null);
          }
        }
      } catch (error: any) {
        console.error('Error fetching preview:', error);
        toast.error('Failed to load preview');
      } finally {
        setPreviewLoading(false);
      }
    } else {
      setPreviewLoading(false);
    }
  }, []);

  // Reset image error and preview loading when selected submission changes
  useEffect(() => {
    if (selectedSubmission) {
      setImageLoadError(false);
      setPreviewLoading(false);
    }
  }, [selectedSubmission?.id]);

  // Reset preview loading when dialog closes
  useEffect(() => {
    if (!isPreviewOpen) {
      setPreviewLoading(false);
      setImageLoadError(false);
    }
  }, [isPreviewOpen]);

  const formatFileSize = useCallback((bytes: number): string => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }, []);

  const getFileTypeLabel = useCallback((type: string): string => {
    const labels: Record<string, string> = {
      image: 'Image',
      audio: 'Audio',
      video: 'Video',
      document: 'Document'
    };
    return labels[type] || 'File';
  }, []);

  const getFileTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'audio': return Music;
      default: return FileText;
    }
  }, []);

  const renderPreviewContent = useMemo(() => {
    if (!selectedSubmission) return null;

    const fileType = selectedSubmission.fileType || selectedSubmission.file_type || 'document';
    const preview = selectedSubmission.preview;
    const fileName = selectedSubmission.fileName || selectedSubmission.file_name || 'Unknown';

    // Show loading state while fetching preview
    if (previewLoading) {
      return (
        <div className="w-full bg-gray-50 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading preview...</p>
          </div>
        </div>
      );
    }

    // Helper function to validate and format base64 image data
    const getImageSrc = (previewData: string | undefined): string | null => {
      if (!previewData) return null;
      
      // If it's already a data URL, return as is
      if (previewData.startsWith('data:')) {
        return previewData;
      }
      
      // If it's base64 without data URL prefix, try to detect mime type and add prefix
      // Check if it looks like base64
      const base64Pattern = /^[A-Za-z0-9+/=]+$/;
      if (base64Pattern.test(previewData.replace(/\s/g, ''))) {
        // Try to detect image type from file name or default to jpeg
        const fileName = selectedSubmission.fileName || selectedSubmission.file_name || '';
        let mimeType = 'image/jpeg'; // default
        if (fileName.toLowerCase().endsWith('.png')) mimeType = 'image/png';
        else if (fileName.toLowerCase().endsWith('.gif')) mimeType = 'image/gif';
        else if (fileName.toLowerCase().endsWith('.webp')) mimeType = 'image/webp';
        else if (fileName.toLowerCase().endsWith('.svg')) mimeType = 'image/svg+xml';
        
        return `data:${mimeType};base64,${previewData}`;
      }
      
      return previewData;
    };

    switch (fileType) {
      case 'image':
        const imageSrc = getImageSrc(preview);
        return (
          <div className="w-full bg-gray-50 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
            {imageSrc && !imageLoadError ? (
              <img 
                src={imageSrc} 
                alt={fileName}
                className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg"
                loading="eager"
                onError={(e) => {
                  console.error('Image failed to load:', {
                    src: imageSrc.substring(0, 100),
                    fileName,
                    previewLength: preview?.length
                  });
                  setImageLoadError(true);
                }}
                onLoad={() => {
                  setImageLoadError(false);
                }}
              />
            ) : (
              <div className="text-center text-gray-400">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-lg font-medium mb-1">Image Preview Unavailable</p>
                <p className="text-sm">The image preview could not be loaded</p>
                {preview && (
                  <p className="text-xs mt-2 text-gray-400 break-all max-w-md mx-auto">
                    Preview data length: {preview.length} characters
                    {preview.length < 200 && (
                      <span className="block mt-1">Preview: {preview.substring(0, 100)}...</span>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      
      case 'video':
        return (
          <div className="w-full bg-black rounded-lg p-4 min-h-[400px] flex items-center justify-center">
            {preview ? (
              <video 
                src={preview} 
                controls
                preload="metadata"
                className="max-w-full max-h-[500px] rounded-lg"
                onError={(e) => {
                  console.error('Video playback error:', e);
                  console.error('Preview data:', preview?.substring(0, 100));
                  toast.error('Video cannot be played. Preview data may be invalid or corrupted.');
                }}
                onLoadStart={() => {
                  console.log('Video loading started');
                }}
                onLoadedData={() => {
                  console.log('Video data loaded successfully');
                }}
                onLoadedMetadata={() => {
                  console.log('Video metadata loaded');
                }}
              />
            ) : (
              <div className="text-center text-gray-400">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="h-12 w-12 text-gray-500" />
                </div>
                <p className="text-lg font-medium mb-1">Video Preview Unavailable</p>
                <p className="text-sm text-gray-500">Video preview data is missing or invalid.</p>
              </div>
            )}
          </div>
        );
      
      case 'audio':
        return (
          <div className="w-full bg-gray-50 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
            <div className="w-full max-w-2xl">
              {preview ? (
                <div className="space-y-4">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Music className="h-12 w-12 text-blue-600" />
                  </div>
                  <audio 
                    src={preview} 
                    controls
                    preload="metadata"
                    className="w-full"
                  />
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Music className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium mb-1">Audio Preview Unavailable</p>
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="w-full bg-gray-50 rounded-lg p-8 min-h-[300px]">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-700 mb-2">Document Preview</p>
              {preview && preview.length < 10000 ? (
                <div className="bg-white rounded-lg p-6 text-left max-h-[400px] overflow-auto mt-4 border">
                  <pre className="text-sm whitespace-pre-wrap break-words text-gray-700">{preview}</pre>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Preview not available for this document</p>
              )}
            </div>
          </div>
        );
    }
  }, [selectedSubmission, imageLoadError, previewLoading]);

  if (!admin) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar activeItem="Pending Submissions" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activeItem="Pending Submissions" />
      <div className="flex-1" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Submissions</h1>
              <p className="text-gray-600">Review and validate pending submissions</p>
            </div>
            <div className="flex items-center gap-2">
              {selectedSubmissions.size > 0 && (
                <div className="flex items-center gap-2 mr-4">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {selectedSubmissions.size} selected
                  </Badge>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleBulkValidate}
                    disabled={isBulkValidating || isRefreshing}
                  >
                    {isBulkValidating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Validate Selected ({selectedSubmissions.size})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={handleBulkReject}
                    disabled={actionLoading === 'bulk' || isRefreshing}
                  >
                    {actionLoading === 'bulk' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Reject Selected
                  </Button>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => loadPendingSubmissions(true)}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading submissions...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => loadPendingSubmissions()}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : submissions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending submissions found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Select All Header */}
              {submissions.length > 0 && (
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedSubmissions.size === submissions.length && submissions.length > 0}
                        onCheckedChange={toggleSelectAll}
                        id="select-all"
                      />
                      <label
                        htmlFor="select-all"
                        className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2"
                      >
                        <CheckSquare className="h-4 w-4" />
                        Select All ({submissions.length} submissions)
                      </label>
                      {selectedSubmissions.size > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSubmissions(new Set())}
                          className="ml-auto text-xs"
                        >
                          Clear Selection
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {submissions.map((submission) => {
                const Icon = getFileTypeIcon(submission.fileType || submission.file_type || 'document');
                const isRejecting = actionLoading === submission.id;
                const isSelected = selectedSubmissions.has(submission.id);
                
                return (
                  <Card 
                    key={submission.id}
                    className={isSelected ? 'border-blue-500 bg-blue-50/50' : ''}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelection(submission.id)}
                            id={`select-${submission.id}`}
                            className="mr-2"
                          />
                          <Icon className="h-5 w-5 text-gray-400" />
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {submission.fileName || submission.file_name || 'Untitled'}
                            </CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                              {submission.userEmail || submission.user_email || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            {getFileTypeLabel(submission.fileType || submission.file_type || '')} • {formatFileSize(submission.fileSize || submission.file_size || 0)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(submission.date || submission.created_at || Date.now()).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(submission)}
                            disabled={isRejecting}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleValidate(submission.id)}
                            disabled={isRejecting}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Validate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleReject(submission.id)}
                            disabled={isRejecting}
                          >
                            {isRejecting ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Submission Preview</DialogTitle>
            <DialogDescription>Review submission details before validation</DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6 mt-4">
              {/* File Information Header */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {(() => {
                    const Icon = getFileTypeIcon(selectedSubmission.fileType || selectedSubmission.file_type || 'document');
                    return <Icon className="h-6 w-6 text-blue-600" />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg truncate">
                    {selectedSubmission.fileName || selectedSubmission.file_name || 'Untitled'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getFileTypeLabel(selectedSubmission.fileType || selectedSubmission.file_type || 'document')}
                  </p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 flex-shrink-0">Pending</Badge>
              </div>

              {/* Preview Content - Full Width */}
              <div className="border rounded-lg overflow-hidden">
                {renderPreviewContent}
              </div>

              {/* Submission Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-white">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">File Size</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {formatFileSize(selectedSubmission.fileSize || selectedSubmission.file_size || 0)}
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-white">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">File Type</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {getFileTypeLabel(selectedSubmission.fileType || selectedSubmission.file_type || 'document')}
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-white">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Submitted By</p>
                  <p className="font-semibold text-gray-900 truncate">
                    {selectedSubmission.userEmail || selectedSubmission.user_email || 'Unknown'}
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-white">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Submission Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedSubmission.date || selectedSubmission.created_at || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Comments Section */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5 text-gray-600" />
                  <h4 className="font-semibold text-gray-900">Comments & Discussion</h4>
                  {comments.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                    </Badge>
                  )}
                </div>

                {/* Comments List */}
                <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto pr-2">
                  {isLoadingComments ? (
                    <div className="text-center py-8 text-gray-500">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Loading comments...</p>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No comments yet. Start the conversation!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-3 rounded-lg border ${
                          comment.author_type === 'admin'
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          {comment.author_type === 'admin' ? (
                            <Shield className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <User className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-gray-900">
                                {comment.author_type === 'admin' ? 'Admin' : comment.author_email}
                              </span>
                              <Badge
                                variant={comment.author_type === 'admin' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {comment.author_type === 'admin' ? 'Admin' : 'User'}
                              </Badge>
                              <span className="text-xs text-gray-500 ml-auto">
                                {new Date(comment.created_at).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.comment_text}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Form */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a comment or respond to the user..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] resize-none"
                    disabled={isPostingComment}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handlePostComment}
                      disabled={!newComment.trim() || isPostingComment || !admin}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isPostingComment ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <SendIcon className="h-4 w-4 mr-2" />
                          Post Comment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="default"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12"
                  onClick={() => {
                    setIsPreviewOpen(false);
                    handleValidate(selectedSubmission.id);
                  }}
                  disabled={actionLoading === selectedSubmission.id}
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Validate & Process
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50 h-12"
                  onClick={() => handleReject(selectedSubmission.id)}
                  disabled={actionLoading === selectedSubmission.id}
                >
                  {actionLoading === selectedSubmission.id ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-5 w-5 mr-2" />
                  )}
                  Reject
                </Button>
                <Button
                  variant="outline"
                  className="h-12"
                  onClick={() => {
                    setIsPreviewOpen(false);
                    setNewComment('');
                    setComments([]);
                  }}
                  disabled={actionLoading === selectedSubmission.id}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">Reject Submission</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this submission. This feedback will be sent to the user.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Rejection Reason Options */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Rejection Reason *</Label>
              <RadioGroup value={rejectionReason} onValueChange={setRejectionReason}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="data_quality" id="reason1" />
                    <Label htmlFor="reason1" className="flex-1 cursor-pointer">
                      <div className="font-medium">Data Quality Issues</div>
                      <div className="text-xs text-gray-500">Poor quality, corrupted, or incomplete data</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="format_incorrect" id="reason2" />
                    <Label htmlFor="reason2" className="flex-1 cursor-pointer">
                      <div className="font-medium">Incorrect Format</div>
                      <div className="text-xs text-gray-500">File format doesn't match requirements</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="content_inappropriate" id="reason3" />
                    <Label htmlFor="reason3" className="flex-1 cursor-pointer">
                      <div className="font-medium">Inappropriate Content</div>
                      <div className="text-xs text-gray-500">Content violates guidelines or policies</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="duplicate" id="reason4" />
                    <Label htmlFor="reason4" className="flex-1 cursor-pointer">
                      <div className="font-medium">Duplicate Submission</div>
                      <div className="text-xs text-gray-500">This data has already been submitted</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="metadata_missing" id="reason5" />
                    <Label htmlFor="reason5" className="flex-1 cursor-pointer">
                      <div className="font-medium">Missing Metadata</div>
                      <div className="text-xs text-gray-500">Required metadata or information is missing</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="other" id="reason6" />
                    <Label htmlFor="reason6" className="flex-1 cursor-pointer">
                      <div className="font-medium">Other</div>
                      <div className="text-xs text-gray-500">Specify reason in comments below</div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Additional Comments */}
            <div className="space-y-2">
              <Label htmlFor="rejection-feedback" className="text-sm font-semibold">
                Additional Comments / Feedback
              </Label>
              <Textarea
                id="rejection-feedback"
                placeholder="Provide detailed feedback to help the user understand why the submission was rejected and how they can improve it..."
                value={rejectionFeedback}
                onChange={(e) => setRejectionFeedback(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-gray-500">
                This feedback will be visible to the user who submitted this dataset.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason('');
                  setRejectionFeedback('');
                  setRejectingSubmissionId(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectWithFeedback}
                disabled={(!rejectionReason && !rejectionFeedback) || actionLoading === rejectingSubmissionId}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {actionLoading === rejectingSubmissionId ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Submission
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingSubmissions;