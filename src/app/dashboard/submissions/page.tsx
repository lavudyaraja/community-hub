"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sidebar } from '../components/sidebar';
import { CheckCircle, XCircle, Clock, FileText, RefreshCw, Eye, Send } from 'lucide-react';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import { getUserSubmissions } from '@/lib/db-client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Submission {
  id: string;
  file_name: string;
  file_type: 'image' | 'audio' | 'video' | 'document';
  file_size: number;
  user_email: string;
  created_at: string;
  status: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
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
  return labels[type] || 'Unknown';
};

const Submissions = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    loadSubmissions();
  }, [router]);

  const loadSubmissions = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    setIsLoading(true);
    
    try {
      const dbSubmissions = await getUserSubmissions(currentUser.email);
      if (dbSubmissions && dbSubmissions.length > 0) {
        setSubmissions(dbSubmissions);
      } else {
        setSubmissions([]);
      }
    } catch (error: any) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submissions from database');
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitForValidation = async () => {
    if (!selectedSubmission) return;

    setIsSubmitting(true);
    try {
      // Send submission data in request body in case it needs to be created
      const response = await fetch(`/api/submissions/${selectedSubmission.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedSubmission.id,
          userEmail: selectedSubmission.user_email,
          fileName: selectedSubmission.file_name,
          fileType: selectedSubmission.file_type,
          fileSize: selectedSubmission.file_size,
          status: selectedSubmission.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to submit');
      }

      const data = await response.json();
      
      // Update local state
      setSubmissions(prev => prev.map(s => 
        s.id === selectedSubmission.id 
          ? { ...s, status: 'submitted' }
          : s
      ));

      // Update selected submission
      setSelectedSubmission({ ...selectedSubmission, status: 'submitted' });

      toast.success('Successfully submitted', {
        description: 'Your submission has been sent for admin validation.',
      });

      // Reload submissions to get updated data
      await loadSubmissions();
    } catch (error: any) {
      console.error('Error submitting for validation:', error);
      toast.error('Failed to submit', {
        description: error.message || 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
      case 'successful':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Validated
          </Badge>
        );
      case 'rejected':
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            {status === 'rejected' ? 'Rejected' : 'Failed'}
          </Badge>
        );
      case 'submitted':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Send className="h-3 w-3 mr-1" />
            Submitted
          </Badge>
        );
      case 'pending':
      case 'processing':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            {status || 'Pending'}
          </Badge>
        );
    }
  };

  if (!user || isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar activeItem="My Submissions" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading submissions...</p>
          </div>
        </div>
      </div>
    );
  }

  const validatedCount = submissions.filter(s => s.status === 'validated' || s.status === 'successful').length;
  const rejectedCount = submissions.filter(s => s.status === 'rejected' || s.status === 'failed').length;
  const submittedCount = submissions.filter(s => s.status === 'submitted').length;
  const pendingCount = submissions.filter(s => s.status === 'pending' || s.status === 'processing' || !s.status).length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeItem="My Submissions" />

      {/* Main Content */}
      <div className="flex-1" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Submissions</h1>
              <p className="text-gray-600">View all your data submissions and their current status.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSubmissions}
              disabled={isLoading}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          {/* Submissions List */}
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="p-16 text-center">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No submissions yet</p>
                <p className="text-gray-400 text-sm">Upload your first file to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => {
                const date = new Date(submission.created_at);
                const formattedDate = date.toLocaleDateString();
                const formattedTime = date.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });

                return (
                  <Card 
                    key={submission.id}
                    className="group hover:border-blue-300 transition-colors"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate max-w-md">{submission.file_name}</h3>
                            <p className="text-sm text-gray-600">
                              {getFileTypeLabel(submission.file_type)} • {formatFileSize(submission.file_size)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">ID: {submission.id}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{formattedDate}</p>
                            <p className="text-sm text-gray-600">{formattedTime}</p>
                          </div>
                          {getStatusBadge(submission.status)}
                          <Button
                            variant="outline"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity border-blue-300 text-blue-600 hover:bg-blue-50"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Summary */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{submissions.length}</div>
                <p className="text-sm text-gray-600">Total Submissions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                <p className="text-sm text-gray-600">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600">{submittedCount}</div>
                <p className="text-sm text-gray-600">Submitted</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{validatedCount}</div>
                <p className="text-sm text-gray-600">Validated</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
                <p className="text-sm text-gray-600">Rejected</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submission Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Submission Details</DialogTitle>
            <DialogDescription>
              View complete information about this submission
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6 mt-4">
              {/* File Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{selectedSubmission.file_name}</h3>
                    <p className="text-sm text-gray-600">{getFileTypeLabel(selectedSubmission.file_type)}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">File Size</p>
                    <p className="font-semibold text-gray-900">{formatFileSize(selectedSubmission.file_size)}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">File Type</p>
                    <p className="font-semibold text-gray-900">{getFileTypeLabel(selectedSubmission.file_type)}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <div className="mt-1">
                      {getStatusBadge(selectedSubmission.status)}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Submission ID</p>
                    <p className="font-semibold text-gray-900 text-xs break-all">{selectedSubmission.id}</p>
                  </div>
                </div>

                {/* Date Information */}
                <div className="p-4 border rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Submission Date & Time</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedSubmission.created_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* User Email */}
                <div className="p-4 border rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Submitted By</p>
                  <p className="font-semibold text-gray-900">{selectedSubmission.user_email}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  {selectedSubmission.status !== 'submitted' && 
                   selectedSubmission.status !== 'validated' && 
                   selectedSubmission.status !== 'successful' && 
                   selectedSubmission.status !== 'rejected' && 
                   selectedSubmission.status !== 'failed' && (
                    <Button
                      variant="default"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      onClick={handleSubmitForValidation}
                      disabled={isSubmitting}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Submitting...' : 'Submit for Validation'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className={selectedSubmission.status === 'submitted' || 
                               selectedSubmission.status === 'validated' || 
                               selectedSubmission.status === 'successful' || 
                               selectedSubmission.status === 'rejected' || 
                               selectedSubmission.status === 'failed' ? 'flex-1' : ''}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Submissions;
