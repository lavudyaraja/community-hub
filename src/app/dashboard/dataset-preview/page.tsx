"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from '../components/sidebar';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import { RawView } from './components/raw-view';
import { TableView } from './components/table-view';
import { ImageView } from './components/image-view';
import { VideoView } from './components/video-view';
import { AudioView } from './components/audio-view';
import { WebDataView } from './components/web-data-view';
import {
  FileText,
  Table,
  Image as ImageIcon,
  Video,
  Database,
  Music,
  Globe,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Submission {
  id: string;
  fileName: string;
  fileType: 'image' | 'audio' | 'video' | 'document';
  fileSize: number;
  userEmail: string;
  date: string;
  status: string;
  preview?: string;
}

const DatasetPreview = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'raw' | 'table' | 'image' | 'video' | 'audio' | 'webdata'>('table');

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
    // Load submissions immediately without blocking UI
    loadSubmissions();
  }, [router]);

  const loadSubmissions = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    setIsLoading(true);
    
    try {
      const { getUserSubmissions } = await import('@/lib/db-client');
      const dbSubmissions = await getUserSubmissions(currentUser.email) as any[];
      
      // Transform database format to component format
      const transformedSubmissions: Submission[] = dbSubmissions.map((s: any) => ({
        id: s.id,
        fileName: s.file_name,
        fileType: s.file_type,
        fileSize: s.file_size,
        userEmail: s.user_email,
        date: s.created_at,
        status: s.status,
        preview: s.preview,
      }));
      
      setSubmissions(transformedSubmissions);
      console.log(`✅ Loaded ${transformedSubmissions.length} submissions from database`);
    } catch (error: any) {
      console.error('Error loading submissions from database:', error);
      
      // Fallback to localStorage if database fails
      try {
        const localSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]');
        const userSubmissions = localSubmissions.filter((s: any) => 
          s.userEmail === currentUser.email || s.user_email === currentUser.email
        );
        
        if (userSubmissions.length > 0) {
          const transformedSubmissions: Submission[] = userSubmissions.map((s: any) => ({
            id: s.id,
            fileName: s.fileName || s.file_name,
            fileType: s.fileType || s.file_type,
            fileSize: s.fileSize || s.file_size,
            userEmail: s.userEmail || s.user_email,
            date: s.date || s.created_at,
            status: s.status || 'pending',
            preview: s.preview,
          }));
          setSubmissions(transformedSubmissions);
          toast.info('Loaded from local cache. Some data may be outdated.');
          return;
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
      
      // Show error only if both database and localStorage fail
      if (error.message && error.message.includes('Failed to fetch')) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('Failed to load submissions. Please try again.');
      }
      
      // Set empty array on error so UI still shows
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      toast.error('User not authenticated');
      return;
    }
    
    try {
      const { deleteSubmission } = await import('@/lib/db-client');
      const success = await deleteSubmission(id, currentUser.email);
      
      if (success) {
        toast.success('File deleted successfully');
        // Reload submissions to reflect the deletion
        await loadSubmissions();
      } else {
        toast.error('Failed to delete file');
      }
    } catch (error: any) {
      console.error('Error deleting submission:', error);
      toast.error(error.message || 'Failed to delete file');
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar activeItem="Dataset Preview" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-slate-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const imageSubmissions = submissions.filter(s => s.fileType === 'image');
  const videoSubmissions = submissions.filter(s => s.fileType === 'video');
  const audioSubmissions = submissions.filter(s => s.fileType === 'audio');
  const documentSubmissions = submissions.filter(s => s.fileType === 'document');
  const webDataSubmissions = documentSubmissions; // Web data = documents
  const allSubmissions = submissions;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeItem="Dataset Preview" />

      <div className="flex-1" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Dataset Preview</h1>
              <p className="text-slate-600">
                {isLoading ? 'Loading data from database...' : 'View and manage your uploaded datasets from database.'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSubmissions}
              disabled={isLoading}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <Card className="border border-slate-200 bg-white">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 mb-1">Total Files</p>
                    {isLoading ? (
                      <Skeleton className="h-9 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-slate-900">{submissions.length}</p>
                    )}
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Database className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 bg-white">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 mb-1">Images</p>
                    {isLoading ? (
                      <Skeleton className="h-9 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-slate-900">{imageSubmissions.length}</p>
                    )}
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 bg-white">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 mb-1">Videos</p>
                    {isLoading ? (
                      <Skeleton className="h-9 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-slate-900">{videoSubmissions.length}</p>
                    )}
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Video className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 bg-white">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 mb-1">Documents</p>
                    {isLoading ? (
                      <Skeleton className="h-9 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-slate-900">{documentSubmissions.length}</p>
                    )}
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* View Tabs */}
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-6 bg-white border border-slate-200 p-1">
              <TabsTrigger 
                value="table" 
                className="flex items-center gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-xs"
              >
                <Table className="h-4 w-4" />
                Table
              </TabsTrigger>
              <TabsTrigger 
                value="raw" 
                className="flex items-center gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-xs"
              >
                <FileText className="h-4 w-4" />
                Raw
              </TabsTrigger>
              <TabsTrigger 
                value="image" 
                className="flex items-center gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-xs"
              >
                <ImageIcon className="h-4 w-4" />
                Images ({imageSubmissions.length})
              </TabsTrigger>
              <TabsTrigger 
                value="video" 
                className="flex items-center gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-xs"
              >
                <Video className="h-4 w-4" />
                Videos ({videoSubmissions.length})
              </TabsTrigger>
              <TabsTrigger 
                value="audio" 
                className="flex items-center gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-xs"
              >
                <Music className="h-4 w-4" />
                Audio ({audioSubmissions.length})
              </TabsTrigger>
              <TabsTrigger 
                value="webdata" 
                className="flex items-center gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-xs"
              >
                <Globe className="h-4 w-4" />
                Web Data ({webDataSubmissions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="mt-0">
              <TableView dataFiles={allSubmissions} />
            </TabsContent>

            <TabsContent value="raw" className="mt-0">
              <RawView dataFiles={allSubmissions} />
            </TabsContent>

            <TabsContent value="image" className="mt-0">
              <ImageView dataFiles={imageSubmissions} onDelete={handleDelete} />
            </TabsContent>

            <TabsContent value="video" className="mt-0">
              <VideoView dataFiles={videoSubmissions} onDelete={handleDelete} />
            </TabsContent>

            <TabsContent value="audio" className="mt-0">
              <AudioView dataFiles={audioSubmissions} onDelete={handleDelete} />
            </TabsContent>

            <TabsContent value="webdata" className="mt-0">
              <WebDataView dataFiles={webDataSubmissions} onDelete={handleDelete} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DatasetPreview;