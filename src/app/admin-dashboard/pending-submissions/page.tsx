"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AdminSidebar } from '../components/sidebar';
import { getCurrentAdmin, isAdminAuthenticated } from '@/lib/auth';
import { Clock, FileText, Eye, CheckCircle2, XCircle, Image as ImageIcon, Video, Music, AlertCircle } from 'lucide-react';
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

const PendingSubmissions = () => {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetails | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<SubmissionDetails | null>(null);

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

  const loadPendingSubmissions = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/submissions/pending');
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending submissions');
      }
      const pending = await response.json();
      setSubmissions(pending);
    } catch (error: any) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load pending submissions');
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = (id: string) => {
    // Redirect to validation hub with submission ID
    router.push(`/admin-dashboard/new-file?submissionId=${id}`);
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/submissions/${id}/reject`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject submission');
      }
      
      toast.success('Submission rejected');
      loadPendingSubmissions();
      if (isPreviewOpen) {
        setIsPreviewOpen(false);
      }
    } catch (error: any) {
      console.error('Error rejecting submission:', error);
      toast.error(error.message || 'Failed to reject submission');
    }
  };

  const handleView = async (submission: any) => {
    // Set the submission and open dialog immediately with available data
    setSelectedSubmission(submission);
    setPreviewData(submission); // Use available data immediately
    setIsPreviewOpen(true);
    setIsLoadingPreview(true);
    
    // Try to fetch additional details in the background (non-blocking)
    try {
      // Fetch full submission details from API
      const response = await fetch(`/api/submissions/${submission.id}`);
      
      if (response.ok) {
        const data = await response.json();
        // Update with fresh data if available
        setPreviewData(data);
        setSelectedSubmission(data);
      }
      // If API fails, we already have the submission data displayed
    } catch (error: any) {
      // Silently handle errors - we already have the data displayed
      // Only log to console for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('Could not fetch additional details, using available data:', error.message);
      }
      
      // Don't show error toast - the dialog is already open with available data
      // The user can still see and work with the submission
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileTypeLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
      image: 'Image Data',
      audio: 'Audio Data',
      video: 'Video Data',
      document: 'Document Data'
    };
    return labels[type] || type || 'Unknown';
  };

  const renderPreviewContent = () => {
    if (!previewData) return null;

    const fileType = previewData.fileType || previewData.file_type || 'document';
    const preview = previewData.preview;
    const fileName = previewData.fileName || previewData.file_name || 'Unknown';

    switch (fileType) {
      case 'image':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4 min-h-[300px]">
              {preview ? (
                <img 
                  src={preview} 
                  alt={fileName}
                  className="max-w-full max-h-[500px] object-contain rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlIFByZXZpZXc8L3RleHQ+PC9zdmc+';
                  }}
                />
              ) : (
                <div className="text-center text-gray-400">
                  <ImageIcon className="h-16 w-16 mx-auto mb-2" />
                  <p>No image preview available</p>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center bg-black rounded-lg p-4 min-h-[300px]">
              {preview ? (
                <video 
                  src={preview} 
                  controls
                  className="max-w-full max-h-[500px] rounded-lg"
                  onError={() => {
                    toast.error('Video cannot be played');
                  }}
                />
              ) : (
                <div className="text-center text-gray-400">
                  <Video className="h-16 w-16 mx-auto mb-2" />
                  <p>No video preview available</p>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'audio':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center bg-gray-50 rounded-lg p-8 min-h-[200px]">
              {preview ? (
                <audio 
                  src={preview} 
                  controls
                  className="w-full max-w-md"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <Music className="h-16 w-16 mx-auto mb-2" />
                  <p>No audio preview available</p>
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-8 min-h-[200px]">
              <div className="text-center text-gray-400">
                <FileText className="h-16 w-16 mx-auto mb-2" />
                <p className="mb-4">Document Preview</p>
                {preview ? (
                  <div className="bg-white rounded p-4 text-left max-h-[400px] overflow-auto">
                    <pre className="text-xs whitespace-pre-wrap break-words">{preview}</pre>
                  </div>
                ) : (
                  <p>No preview available for this document</p>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  if (!admin) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar activeItem="Pending Submissions" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activeItem="Pending Submissions" />
      <div className="flex-1" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Submissions</h1>
            <p className="text-gray-600">Review and validate pending submissions</p>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">Loading submissions...</p>
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
              {submissions.map((submission) => (
                <Card key={submission.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <CardTitle className="text-lg">{submission.fileName || submission.file_name || 'Untitled'}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            Submitted by: {submission.userEmail || submission.user_email || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Type: <span className="font-medium">{submission.fileType || submission.file_type || 'Unknown'}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Date: <span className="font-medium">
                            {new Date(submission.date || submission.created_at).toLocaleString()}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(submission)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleValidate(submission.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Validate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleReject(submission.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Submission Preview</DialogTitle>
            <DialogDescription>
              Review submission details before validation
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingPreview ? (
            <div className="flex items-center justify-center p-8">
              <Clock className="h-8 w-8 animate-spin text-gray-400" />
              <p className="ml-2 text-gray-600">Loading preview...</p>
            </div>
          ) : previewData ? (
            <div className="space-y-6 mt-4">
              {/* File Information Header */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  {previewData.fileType === 'image' || previewData.file_type === 'image' ? (
                    <ImageIcon className="h-6 w-6 text-blue-600" />
                  ) : previewData.fileType === 'video' || previewData.file_type === 'video' ? (
                    <Video className="h-6 w-6 text-blue-600" />
                  ) : previewData.fileType === 'audio' || previewData.file_type === 'audio' ? (
                    <Music className="h-6 w-6 text-blue-600" />
                  ) : (
                    <FileText className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {previewData.fileName || previewData.file_name || 'Untitled'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getFileTypeLabel(previewData.fileType || previewData.file_type || 'document')}
                  </p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
              </div>

              {/* Preview Content */}
              {renderPreviewContent()}

              {/* Submission Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">File Size</p>
                  <p className="font-semibold text-gray-900">
                    {formatFileSize(previewData.fileSize || previewData.file_size || 0)}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">File Type</p>
                  <p className="font-semibold text-gray-900">
                    {getFileTypeLabel(previewData.fileType || previewData.file_type || 'document')}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Submitted By</p>
                  <p className="font-semibold text-gray-900">
                    {previewData.userEmail || previewData.user_email || 'Unknown'}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Submission Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(previewData.date || previewData.created_at || Date.now()).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Submission ID */}
              <div className="p-4 border rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Submission ID</p>
                <p className="font-semibold text-gray-900 text-xs break-all">{previewData.id}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="default"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    setIsPreviewOpen(false);
                    handleValidate(previewData.id);
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Validate
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => handleReject(previewData.id)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8">
              <AlertCircle className="h-8 w-8 text-red-400" />
              <p className="ml-2 text-gray-600">Failed to load submission details</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingSubmissions;
