"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminSidebar } from '../components/sidebar';
import { getCurrentAdmin, isAdminAuthenticated } from '@/lib/auth';
import { CheckCircle2, FileText, Eye, Calendar } from 'lucide-react';

const ValidatedSubmissions = () => {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
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
    loadValidatedSubmissions();
  }, [router]);

  const loadValidatedSubmissions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/submissions/validated');
      if (!response.ok) {
        // If API fails, fallback to localStorage or empty array
        const allSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]');
        const validated = allSubmissions.filter((s: any) => 
          s.status === 'validated' || s.status === 'successful'
        );
        setSubmissions(validated);
        return;
      }
      const validated = await response.json();
      setSubmissions(validated || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      // Fallback to localStorage
      try {
        const allSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]');
        const validated = allSubmissions.filter((s: any) => 
          s.status === 'validated' || s.status === 'successful'
        );
        setSubmissions(validated);
      } catch {
        setSubmissions([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!admin) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar activeItem="Validated Submissions" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activeItem="Validated Submissions" />
      <div className="flex-1" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Validated Submissions</h1>
            <p className="text-gray-600">View all validated and approved submissions</p>
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
                <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No validated submissions found</p>
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
                      <Badge className="bg-green-100 text-green-800">Validated</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Type: <span className="font-medium">{submission.fileType || submission.file_type || 'Unknown'}</span>
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">
                            {new Date(submission.date || submission.created_at).toLocaleString()}
                          </span>
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/dataset-preview?id=${submission.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
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

export default ValidatedSubmissions;
