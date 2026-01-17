"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AdminSidebar } from '../../components/sidebar';
import { getCurrentAdmin, isAdminAuthenticated } from '@/lib/auth';
import { 
  XCircle, 
  FileText, 
  Calendar, 
  Clock, 
  ArrowLeft,
  MessageSquare,
  Send as SendIcon,
  User,
  Shield,
  RefreshCw,
  AlertCircle,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

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

const RejectedSubmissionDetails = () => {
  const router = useRouter();
  const params = useParams();
  const submissionId = params?.id as string;
  
  const [admin, setAdmin] = useState<any>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    
    if (submissionId) {
      loadSubmission();
      loadComments();
    }
  }, [router, submissionId]);

  const loadSubmission = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/submissions/${submissionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch submission');
      }
      const data = await response.json();
      setSubmission(data);
    } catch (error) {
      console.error('Error loading submission:', error);
      toast.error('Failed to load submission details');
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
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

  const handlePostComment = async () => {
    if (!submissionId || !newComment.trim() || !admin) return;

    setIsPostingComment(true);
    try {
      const response = await fetch(`/api/submissions/${submissionId}/comments`, {
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
      toast.success('Improvement comment posted successfully');
      
      // Reload comments
      loadComments();
    } catch (error: any) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment', {
        description: error.message || 'Please try again later.',
      });
    } finally {
      setIsPostingComment(false);
    }
  };

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

  const getRejectionReasonLabel = (reason: string): string => {
    const labels: { [key: string]: string } = {
      data_quality: 'Data Quality Issues - Poor quality, corrupted, or incomplete data',
      format_incorrect: 'Incorrect Format - File format doesn\'t match requirements',
      content_inappropriate: 'Inappropriate Content - Content violates guidelines or policies',
      duplicate: 'Duplicate Submission - This data has already been submitted',
      metadata_missing: 'Missing Metadata - Required metadata or information is missing',
      other: 'Other - See feedback below'
    };
    return labels[reason] || reason;
  };

  if (!admin || isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar activeItem="Rejected Submissions" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar activeItem="Rejected Submissions" />
        <div className="flex-1" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
          <div className="p-8">
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Submission not found</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push('/admin-dashboard/rejected-submissions')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Rejected Submissions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activeItem="Rejected Submissions" />
      <div className="flex-1" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
        <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin-dashboard/rejected-submissions')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Rejected Submission Details</h1>
              <p className="text-sm md:text-base text-gray-600">Review rejection reason and provide improvement feedback</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Submission Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    Submission Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{submission.file_name}</h3>
                      <p className="text-sm text-gray-600">{getFileTypeLabel(submission.file_type)}</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">File Size</p>
                      <p className="font-semibold text-gray-900">{formatFileSize(submission.file_size)}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">File Type</p>
                      <p className="font-semibold text-gray-900">{getFileTypeLabel(submission.file_type)}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Submitted By</p>
                      <p className="font-semibold text-gray-900">{submission.user_email}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Submission ID</p>
                      <p className="font-semibold text-gray-900 text-xs break-all">{submission.id}</p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <p className="text-xs text-gray-500 mb-2">Submission Date & Time</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <p className="font-semibold text-gray-900">
                        {new Date(submission.created_at).toLocaleString('en-US', {
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
                </CardContent>
              </Card>

              {/* Rejection Details Card */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    Rejection Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {submission.rejection_reason && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs font-medium text-red-700 mb-2 uppercase tracking-wide">Rejection Reason</p>
                      <p className="text-sm text-red-900 font-semibold">
                        {getRejectionReasonLabel(submission.rejection_reason)}
                      </p>
                    </div>
                  )}
                  
                  {submission.rejection_feedback && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs font-medium text-red-700 mb-2 uppercase tracking-wide">Admin Feedback</p>
                      <p className="text-sm text-red-900 whitespace-pre-wrap">{submission.rejection_feedback}</p>
                    </div>
                  )}

                  {!submission.rejection_reason && !submission.rejection_feedback && (
                    <div className="p-4 text-center text-gray-500">
                      <p className="text-sm">No rejection details available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Comments Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-gray-600" />
                    Improvement Comments & Discussion
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Comments List */}
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {isLoadingComments ? (
                      <div className="text-center py-8 text-gray-500">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Loading comments...</p>
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No comments yet. Add improvement suggestions for the user.</p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div
                          key={comment.id}
                          className={`p-4 rounded-lg border ${
                            comment.author_type === 'admin'
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-2">
                            {comment.author_type === 'admin' ? (
                              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <User className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
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

                  {/* Add Improvement Comment Form */}
                  <div className="pt-4 border-t">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-semibold text-gray-900 mb-2 block">
                          Add Improvement Comment
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          Provide specific feedback on how the user can improve their submission. This will be visible to the user.
                        </p>
                        <Textarea
                          placeholder="Example: Please ensure the image resolution is at least 1920x1080. Also, make sure the file format is PNG or JPG..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[120px] resize-none"
                          disabled={isPostingComment}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={handlePostComment}
                          disabled={!newComment.trim() || isPostingComment || !admin}
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
                              Post Improvement Comment
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/admin-dashboard/new-file?submissionId=${submissionId}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View in Validation Hub
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/admin-dashboard/rejected-submissions')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to List
                  </Button>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Comments</span>
                    <span className="text-sm font-semibold">{comments.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">User Comments</span>
                    <span className="text-sm font-semibold">
                      {comments.filter(c => c.author_type === 'user').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Admin Comments</span>
                    <span className="text-sm font-semibold">
                      {comments.filter(c => c.author_type === 'admin').length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectedSubmissionDetails;
