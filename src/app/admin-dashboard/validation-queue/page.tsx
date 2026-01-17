"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminSidebar } from '../components/sidebar';
import { getCurrentAdmin, isAdminAuthenticated } from '@/lib/auth';
import { ListChecks, FileText, Eye, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const ValidationQueue = () => {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    loadValidationQueue();
  }, [router]);

  const loadValidationQueue = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/submissions/pending');
      if (!response.ok) {
        throw new Error('Failed to fetch pending submissions');
      }
      const pending = await response.json();
      setQueue(pending);
    } catch (error) {
      console.error('Error loading queue:', error);
      toast.error('Failed to load validation queue');
      setQueue([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async (id: string) => {
    try {
      const response = await fetch(`/api/submissions/${id}/validate`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to validate submission');
      }
      
      toast.success('Submission validated successfully');
      loadValidationQueue();
    } catch (error: any) {
      console.error('Error validating submission:', error);
      toast.error(error.message || 'Failed to validate submission');
    }
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
      loadValidationQueue();
    } catch (error: any) {
      console.error('Error rejecting submission:', error);
      toast.error(error.message || 'Failed to reject submission');
    }
  };

  if (!admin) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar activeItem="Validation Queue" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activeItem="Validation Queue" />
      <div className="flex-1" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Validation Queue</h1>
            <p className="text-gray-600">Process submissions in the validation queue</p>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">Loading queue...</p>
              </CardContent>
            </Card>
          ) : queue.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ListChecks className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Validation queue is empty</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {queue.map((item, index) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                          {index + 1}
                        </div>
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <CardTitle className="text-lg">{item.fileName || item.file_name || 'Untitled'}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            Submitted by: {item.userEmail || item.user_email || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        In Queue
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Type: <span className="font-medium">{item.fileType || item.file_type || 'Unknown'}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Date: <span className="font-medium">
                            {new Date(item.date || item.created_at).toLocaleString()}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/dataset-preview?id=${item.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleValidate(item.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Validate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleReject(item.id)}
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
    </div>
  );
};

export default ValidationQueue;
