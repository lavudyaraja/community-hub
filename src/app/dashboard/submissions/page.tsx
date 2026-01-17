"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sidebar } from '../components/sidebar';
import { CheckCircle, XCircle, Clock, FileText, RefreshCw, Eye, Send, Image as ImageIcon, Video, Music, Loader2 } from 'lucide-react';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import { getUserSubmissions } from '@/lib/db-client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MessageSquare, Send as SendIcon, User, Shield } from 'lucide-react';
import { RejectionDetailsDialog } from '@/components/user/rejection-details-dialog';

interface Submission {
  id: string;
  file_name: string;
  file_type: 'image' | 'audio' | 'video' | 'document';
  file_size: number;
  user_email: string;
  created_at: string;
  status: string;
  rejection_reason?: string;
  rejection_feedback?: string;
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [showRejectionDetails, setShowRejectionDetails] = useState(false);
  const [selectedRejectedSubmission, setSelectedRejectedSubmission] = useState<Submission | null>(null);
  const [previewData, setPreviewData] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

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
        // Load comments for all submissions
        loadAllComments(dbSubmissions.map(s => s.id));
      } else {
        setSubmissions([]);
        setComments([]);
      }
    } catch (error: any) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submissions from database');
      setSubmissions([]);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async (submissionId: string) => {
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
  };

  // Load preview for a submission
  const loadPreview = async (submissionId: string) => {
    setIsLoadingPreview(true);
    setPreviewData(null);
    try {
      const response = await fetch(`/api/submissions/${submissionId}/preview`);
      if (response.ok) {
        const data = await response.json();
        let preview = data.preview || '';
        
        // Format preview as data URL if needed
        if (preview && !preview.startsWith('data:') && !preview.startsWith('blob:') && !preview.startsWith('http')) {
          const base64Pattern = /^[A-Za-z0-9+/=]+$/;
          const cleanData = preview.replace(/\s/g, '');
          if (base64Pattern.test(cleanData)) {
            const mimeType = data.mime_type || 
              (selectedSubmission?.file_type === 'video' ? 'video/mp4' :
               selectedSubmission?.file_type === 'audio' ? 'audio/mpeg' :
               selectedSubmission?.file_type === 'image' ? 'image/jpeg' : 'application/octet-stream');
            preview = `data:${mimeType};base64,${cleanData}`;
          }
        }
        
        setPreviewData(preview);
      } else {
        setPreviewData(null);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      setPreviewData(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Load comments for all submissions and aggregate them
  const loadAllComments = async (submissionIds: string[]) => {
    if (submissionIds.length === 0) {
      setComments([]);
      return;
    }

    setIsLoadingComments(true);
    try {
      // Load comments for all submissions in parallel
      const commentPromises = submissionIds.map(async (submissionId) => {
        try {
          const response = await fetch(`/api/submissions/${submissionId}/comments`);
          if (response.ok) {
            const data = await response.json();
            return data || [];
          }
          return [];
        } catch (error) {
          console.error(`Error loading comments for submission ${submissionId}:`, error);
          return [];
        }
      });

      const allCommentsArrays = await Promise.all(commentPromises);
      // Flatten and sort by created_at
      const allComments = allCommentsArrays
        .flat()
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      setComments(allComments);
    } catch (error) {
      console.error('Error loading all comments:', error);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !user) {
      toast.error('Please enter a comment');
      return;
    }

    // If we have a selected submission, use it; otherwise use the first submission
    const submissionId = selectedSubmission?.id || (submissions.length > 0 ? submissions[0].id : null);
    
    if (!submissionId) {
      toast.error('No submission available to comment on');
      return;
    }

    setIsPostingComment(true);
    try {
      const response = await fetch(`/api/submissions/${submissionId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment_text: newComment.trim(),
          author_email: user.email,
          author_type: 'user',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to post comment');
      }

      const newCommentData = await response.json();
      setNewComment('');
      toast.success('Comment posted successfully');
      
      // Reload all comments to get updated list
      if (submissions.length > 0) {
        loadAllComments(submissions.map(s => s.id));
      }
    } catch (error: any) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment', {
        description: error.message || 'Please make sure the database migration has been run.',
      });
    } finally {
      setIsPostingComment(false);
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
        <div className="flex-1 w-full flex items-center justify-center" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
          <div className="text-center p-4">
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
      <div className="flex-1 w-full" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          {/* Header */}
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Submissions</h1>
              <p className="text-sm md:text-base text-gray-600">View all your data submissions and their current status.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSubmissions}
              disabled={isLoading}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          {/* Summary Cards - Moved to Top */}
          <div className="mb-6 md:mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
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
            <div className="space-y-3 md:space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {submissions.map((submission) => {
                const date = new Date(submission.created_at);
                const formattedDate = date.toLocaleDateString();
                const formattedTime = date.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });
                const isRejected = submission.status === 'rejected' || submission.status === 'failed';

                return (
                  <Card 
                    key={submission.id}
                    className={`group hover:border-blue-300 transition-colors ${
                      isRejected ? 'border-red-200 bg-red-50/30' : ''
                    }`}
                  >
                    <CardContent className="p-3 md:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate text-xs md:text-sm">
                              {submission.file_name}
                            </h3>
                            <p className="text-xs text-gray-600">
                              {getFileTypeLabel(submission.file_type)} • {formatFileSize(submission.file_size)}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">ID: {submission.id}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2 md:gap-4">
                          <div className="text-left sm:text-right">
                            <p className="text-xs md:text-sm font-medium text-gray-900">{formattedDate}</p>
                            <p className="text-xs md:text-sm text-gray-600">{formattedTime}</p>
                          </div>
                          <div className="flex items-center gap-2 md:gap-3">
                            {getStatusBadge(submission.status)}
                            {/* View Details button - only for rejected submissions */}
                            {isRejected && (submission.rejection_reason || submission.rejection_feedback) && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedRejectedSubmission(submission);
                                  setShowRejectionDetails(true);
                                }}
                              >
                                <Eye className="h-4 w-4 md:mr-2" />
                                <span className="hidden md:inline">View Details</span>
                              </Button>
                            )}
                            {/* Regular View button - for non-rejected submissions */}
                            {!isRejected && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity border-blue-300 text-blue-600 hover:bg-blue-50"
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setIsDialogOpen(true);
                                  // Load comments for this specific submission when dialog opens
                                  loadComments(submission.id);
                                  // Load preview for this submission
                                  loadPreview(submission.id);
                                }}
                              >
                                <Eye className="h-4 w-4 md:mr-2" />
                                <span className="hidden md:inline">View</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Comments Section - At Bottom of Submissions List */}
          {submissions.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-gray-600" />
                  Comments & Discussion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Comments List */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
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
                    comments.map((comment) => {
                      const submission = submissions.find(s => s.id === comment.submission_id);
                      return (
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
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-sm font-semibold text-gray-900">
                                  {comment.author_type === 'admin' ? 'Admin' : user?.email || 'User'}
                                </span>
                                <Badge
                                  variant={comment.author_type === 'admin' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {comment.author_type === 'admin' ? 'Admin' : 'User'}
                                </Badge>
                                {submission && (
                                  <Badge variant="outline" className="text-xs">
                                    {submission.file_name}
                                  </Badge>
                                )}
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
                      );
                    })
                  )}
                </div>

                {/* Add Comment Form */}
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add a comment or ask a question about your submissions..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[100px] resize-none"
                      disabled={isPostingComment}
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handlePostComment}
                        disabled={!newComment.trim() || isPostingComment || !user}
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
              </CardContent>
            </Card>
          )}
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

                {/* File Preview */}
                <div className="w-full">
                  {isLoadingPreview ? (
                    <div className="w-full bg-gray-50 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
                        <p className="text-sm text-gray-600">Loading preview...</p>
                      </div>
                    </div>
                  ) : previewData ? (
                    (() => {
                      const fileType = selectedSubmission.file_type;
                      switch (fileType) {
                        case 'image':
                          return (
                            <div className="w-full bg-gray-50 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                              <img 
                                src={previewData} 
                                alt={selectedSubmission.file_name}
                                className="max-w-full max-h-[400px] object-contain rounded-lg shadow-md"
                              />
                            </div>
                          );
                        case 'video':
                          return (
                            <div className="w-full bg-black rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                              <video 
                                src={previewData} 
                                controls
                                className="max-w-full max-h-[400px] rounded-lg"
                                playsInline
                                preload="auto"
                                muted={false}
                                onError={(e) => {
                                  console.error('Video playback error:', e);
                                  toast.error('Failed to play video. The file may be corrupted or in an unsupported format.');
                                }}
                              />
                            </div>
                          );
                        case 'audio':
                          return (
                            <div className="w-full bg-gray-50 rounded-lg p-8 min-h-[200px] flex items-center justify-center">
                              <div className="w-full max-w-2xl space-y-4">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                  <Music className="h-10 w-10 text-blue-600" />
                                </div>
                                <audio 
                                  src={previewData} 
                                  controls
                                  className="w-full"
                                />
                              </div>
                            </div>
                          );
                        case 'document':
                          return (
                            <div className="w-full bg-gray-50 rounded-lg p-8 min-h-[300px]">
                              <div className="text-center">
                                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <FileText className="h-10 w-10 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-600 mb-4">Document Preview</p>
                                {previewData.length < 10000 ? (
                                  <div className="bg-white rounded-lg p-4 text-left max-h-[300px] overflow-auto border">
                                    <pre className="text-xs whitespace-pre-wrap break-words text-gray-700">{previewData}</pre>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">Preview not available for this document</p>
                                )}
                              </div>
                            </div>
                          );
                        default:
                          return null;
                      }
                    })()
                  ) : (
                    <div className="w-full bg-gray-50 rounded-lg p-8 min-h-[200px] flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        {selectedSubmission.file_type === 'image' && <ImageIcon className="h-12 w-12 mx-auto mb-2" />}
                        {selectedSubmission.file_type === 'video' && <Video className="h-12 w-12 mx-auto mb-2" />}
                        {selectedSubmission.file_type === 'audio' && <Music className="h-12 w-12 mx-auto mb-2" />}
                        {selectedSubmission.file_type === 'document' && <FileText className="h-12 w-12 mx-auto mb-2" />}
                        <p className="text-sm">Preview not available</p>
                      </div>
                    </div>
                  )}
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

                {/* Rejection Feedback - Show if rejected */}
                {(selectedSubmission.status === 'rejected' || selectedSubmission.status === 'failed') && 
                 (selectedSubmission.rejection_reason || selectedSubmission.rejection_feedback) && (
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-900 mb-2">Dataset Rejected</p>
                        {selectedSubmission.rejection_reason && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-red-700 mb-1">Reason:</p>
                            <p className="text-sm text-red-800">
                              {selectedSubmission.rejection_reason === 'data_quality' && 'Data Quality Issues - Poor quality, corrupted, or incomplete data'}
                              {selectedSubmission.rejection_reason === 'format_incorrect' && 'Incorrect Format - File format doesn\'t match requirements'}
                              {selectedSubmission.rejection_reason === 'content_inappropriate' && 'Inappropriate Content - Content violates guidelines or policies'}
                              {selectedSubmission.rejection_reason === 'duplicate' && 'Duplicate Submission - This data has already been submitted'}
                              {selectedSubmission.rejection_reason === 'metadata_missing' && 'Missing Metadata - Required metadata or information is missing'}
                              {selectedSubmission.rejection_reason === 'other' && 'Other - See feedback below'}
                              {!['data_quality', 'format_incorrect', 'content_inappropriate', 'duplicate', 'metadata_missing', 'other'].includes(selectedSubmission.rejection_reason) && selectedSubmission.rejection_reason}
                            </p>
                          </div>
                        )}
                        {selectedSubmission.rejection_feedback && (
                          <div>
                            <p className="text-xs font-medium text-red-700 mb-1">Admin Feedback:</p>
                            <p className="text-sm text-red-800 whitespace-pre-wrap">{selectedSubmission.rejection_feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}


                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
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
                    onClick={() => {
                      setIsDialogOpen(false);
                      setNewComment('');
                      setComments([]);
                    }}
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

      {/* Rejection Details Dialog */}
      <RejectionDetailsDialog
        open={showRejectionDetails}
        onOpenChange={setShowRejectionDetails}
        rejectionReason={selectedRejectedSubmission?.rejection_reason}
        rejectionFeedback={selectedRejectedSubmission?.rejection_feedback}
        fileName={selectedRejectedSubmission?.file_name}
      />
    </div>
  );
};

export default Submissions;
