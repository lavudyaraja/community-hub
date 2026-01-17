"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from '../components/sidebar';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import {
  Image,
  AudioLines,
  Video,
  FileText,
  Upload as UploadIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface UploadedFile {
  id: string;
  file: File;
  type: 'image' | 'audio' | 'video' | 'document';
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  preview?: string;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const DashboardUpload = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  }, [router]);

  // Upload function - uploads files and updates status
  const handleUploadClick = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    
    if (pendingFiles.length === 0) {
      toast.info("No files to upload");
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
      toast.error("User not authenticated");
      return;
    }

    // Update files to uploading status
    setFiles((prev) =>
      prev.map((f) =>
        pendingFiles.some(pf => pf.id === f.id)
          ? { ...f, status: 'uploading' as const, progress: 0 }
          : f
      )
    );

    const { createSubmission } = await import('@/lib/db-client');
    
    // Upload files with progress updates
    const submissionResults = await Promise.allSettled(
      pendingFiles.map(async (uploadedFile) => {
        // Simulate progress updates
        const progressSteps = [20, 40, 60, 80];
        for (const progress of progressSteps) {
          await new Promise(resolve => setTimeout(resolve, 150));
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadedFile.id ? { ...f, progress } : f
            )
          );
        }

        const fullFileData = files.find(f => f.id === uploadedFile.id);
        const preview = fullFileData?.preview || uploadedFile.preview;
        
        let validPreview: string | undefined = undefined;
        if (preview) {
          if (uploadedFile.type === 'image' && preview.startsWith('data:image')) {
            validPreview = preview;
          } else if (uploadedFile.type === 'video' && preview.startsWith('data:video')) {
            validPreview = preview;
          } else if (uploadedFile.type === 'audio' && preview.startsWith('data:audio')) {
            validPreview = preview;
          } else if (uploadedFile.type === 'document' && preview.startsWith('data:') && preview.length < 2000000) {
            validPreview = preview;
          }
        }
        
        // Update to 90% before actual upload
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id ? { ...f, progress: 90 } : f
          )
        );

        const result = await createSubmission({
          id: uploadedFile.id,
          userEmail: currentUser.email,
          fileName: uploadedFile.file.name,
          fileType: uploadedFile.type,
          fileSize: uploadedFile.file.size,
          status: 'pending',
          preview: validPreview,
        });

        // Update to 100% after upload
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id ? { ...f, progress: 100 } : f
          )
        );

        return result;
      })
    );

    // Update file statuses based on results
    const successes: string[] = [];
    const failures: string[] = [];

    submissionResults.forEach((result, index) => {
      const fileId = pendingFiles[index].id;
      if (result.status === 'fulfilled') {
        successes.push(fileId);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, status: 'success' as const, progress: 100 } : f
          )
        );
      } else {
        failures.push(fileId);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, status: 'error' as const } : f
          )
        );
      }
    });

    // Show toast notifications
    if (successes.length > 0) {
      toast.success("Upload Successful!", {
        description: `${successes.length} file(s) uploaded successfully${failures.length > 0 ? ` (${failures.length} failed)` : ''}`,
        duration: 5000,
      });
    }
    
    if (failures.length > 0) {
      submissionResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          const failure = result as PromiseRejectedResult;
          toast.error(`Upload failed: ${pendingFiles[index].file.name}`, {
            description: failure.reason?.message || 'Unknown error',
            duration: 5000,
          });
        }
      });
    }
  };

  const getFileType = (file: File): 'image' | 'audio' | 'video' | 'document' => {
    const type = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    // Check MIME type first
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('audio/')) return 'audio';
    if (type.startsWith('video/')) return 'video';
    
    // Fallback to file extension if MIME type is missing or generic
    if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || 
        fileName.endsWith('.png') || fileName.endsWith('.gif') || 
        fileName.endsWith('.webp') || fileName.endsWith('.bmp')) {
      return 'image';
    }
    if (fileName.endsWith('.mp3') || fileName.endsWith('.wav') || 
        fileName.endsWith('.aac') || fileName.endsWith('.ogg') || 
        fileName.endsWith('.flac') || fileName.endsWith('.m4a')) {
      return 'audio';
    }
    if (fileName.endsWith('.mp4') || fileName.endsWith('.mov') || 
        fileName.endsWith('.avi') || fileName.endsWith('.mkv') || 
        fileName.endsWith('.webm') || fileName.endsWith('.flv')) {
      return 'video';
    }
    
    // Default to document (includes PDF, JSON, CSV, DOC, DOCX, etc.)
    return 'document';
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File size exceeds 100MB limit` };
    }

    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/flac', 'audio/x-m4a',
      'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm',
      'application/pdf', 'application/json', 'text/csv', 'text/plain',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    const allowedExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp',
      '.mp3', '.wav', '.aac', '.ogg', '.flac', '.m4a',
      '.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv',
      '.pdf', '.json', '.csv', '.txt',
      '.doc', '.docx'
    ];

    // Check MIME type first
    const mimeTypeValid = file.type && allowedTypes.includes(file.type.toLowerCase());
    
    // If MIME type is missing or not in list, check file extension
    const extensionValid = allowedExtensions.includes(fileExtension);

    if (!mimeTypeValid && !extensionValid) {
      return { valid: false, error: `File type ${file.type || 'unknown'} is not supported. Supported: Images, Audio, Video, PDF, Documents` };
    }

    return { valid: true };
  };

  const createPreview = (file: File, type: 'image' | 'audio' | 'video' | 'document'): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (type === 'image' || type === 'video' || type === 'audio') {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else if (type === 'document' && file.size < 2 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const handleFiles = async (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    const invalidFiles: string[] = [];
    const fileTypeCounts: { [key: string]: number } = { image: 0, audio: 0, video: 0, document: 0 };

    // Process all files
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validation = validateFile(file);

      if (!validation.valid) {
        invalidFiles.push(`${file.name}: ${validation.error}`);
        continue;
      }

      const fileType = getFileType(file);
      const preview = await createPreview(file, fileType);

      // Generate unique ID using timestamp, random number, and index
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`;

      newFiles.push({
        id: uniqueId,
        file,
        type: fileType,
        progress: 0,
        status: 'pending',
        preview,
      });

      fileTypeCounts[fileType]++;
    }

    // Show validation errors if any
    if (invalidFiles.length > 0) {
      toast.error(`${invalidFiles.length} file(s) failed validation`, {
        description: invalidFiles.slice(0, 3).join(', ') + (invalidFiles.length > 3 ? '...' : ''),
        duration: 5000,
      });
    }

    // Add valid files and show success message
    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
      
      const typeSummary = Object.entries(fileTypeCounts)
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
        .join(', ');

      toast.success(`${newFiles.length} file(s) added successfully`, {
        description: typeSummary ? `Types: ${typeSummary}` : "Files are ready to upload",
        duration: 4000,
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFile = async (uploadedFile: UploadedFile): Promise<boolean> => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === uploadedFile.id
          ? { ...f, status: 'uploading', progress: 50 }
          : f
      )
    );

    setFiles((prev) =>
      prev.map((f) =>
        f.id === uploadedFile.id
          ? { ...f, progress: 100, status: 'success' }
          : f
      )
    );
    
    return true;
  };

  const handleUpload = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    
    if (pendingFiles.length === 0) {
      toast.error("No Files to Upload", {
        description: "All files have already been uploaded or are currently uploading",
      });
      return;
    }

    setIsUploading(true);
    const currentUser = getCurrentUser();

    // Show upload start notification with file count breakdown
    const fileTypeBreakdown = pendingFiles.reduce((acc, file) => {
      acc[file.type] = (acc[file.type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    const breakdownText = Object.entries(fileTypeBreakdown)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ');

    toast.info(`Uploading ${pendingFiles.length} file(s)...`, {
      description: breakdownText,
      duration: 3000,
    });

    try {
      // Update all files to uploading status with progress
      setFiles((prev) =>
        prev.map((f) =>
          pendingFiles.some(pf => pf.id === f.id)
            ? { ...f, status: 'uploading' as const, progress: 10 }
            : f
        )
      );

      // Simulate upload progress for all files
      const uploadPromises = pendingFiles.map(async (file) => {
        // Update progress gradually
        for (let progress = 20; progress <= 90; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, progress } : f
            )
          );
        }
        return uploadFile(file);
      });
      
      await Promise.all(uploadPromises);

      const { createSubmission } = await import('@/lib/db-client');
      
      // Create submissions for all files in parallel
      const submissionResults = await Promise.allSettled(
        pendingFiles.map(async (uploadedFile) => {
          const fullFileData = files.find(f => f.id === uploadedFile.id);
          const preview = fullFileData?.preview || uploadedFile.preview;
          
          let validPreview: string | undefined = undefined;
          if (preview) {
            if (uploadedFile.type === 'image' && preview.startsWith('data:image')) {
              validPreview = preview;
            } else if (uploadedFile.type === 'video' && preview.startsWith('data:video')) {
              validPreview = preview;
            } else if (uploadedFile.type === 'audio' && preview.startsWith('data:audio')) {
              validPreview = preview;
            } else if (uploadedFile.type === 'document' && preview.startsWith('data:') && preview.length < 2000000) {
              validPreview = preview;
            }
          }
          
          return await createSubmission({
            id: uploadedFile.id,
            userEmail: currentUser?.email || '',
            fileName: uploadedFile.file.name,
            fileType: uploadedFile.type,
            fileSize: uploadedFile.file.size,
            status: 'pending',
            preview: validPreview,
          });
        })
      );

      // Update all files to success status
      setFiles((prev) =>
        prev.map((f) =>
          pendingFiles.some(pf => pf.id === f.id)
            ? { ...f, status: 'success' as const, progress: 100 }
            : f
        )
      );

      const failures = submissionResults.filter(r => r.status === 'rejected');
      const successes = submissionResults.filter(r => r.status === 'fulfilled').length;
      
      if (failures.length > 0) {
        console.error('Some submissions failed:', failures);
        // Mark failed files
        failures.forEach((failure: any, index) => {
          const failedFile = pendingFiles[index];
          if (failedFile) {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === failedFile.id ? { ...f, status: 'error' as const } : f
              )
            );
          }
          if (failure.reason) {
            toast.error(`Failed to save: ${failure.reason.message || 'Unknown error'}`, {
              duration: 5000,
            });
          }
        });
      }
      
      if (successes > 0) {
        console.log(`Successfully saved ${successes} file(s) to database`);
        toast.success("Upload Successful!", {
          description: `${successes} file(s) uploaded successfully${failures.length > 0 ? ` (${failures.length} failed)` : ''}`,
          duration: 5000,
        });
        
        // Clear files after a short delay to show success state
        setTimeout(() => {
          setFiles([]);
          setIsUploading(false);
          router.push('/dashboard/dataset-preview');
        }, 1500);
      } else {
        setIsUploading(false);
        throw new Error('All submissions failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      
      // Mark all pending files as error
      setFiles((prev) =>
        prev.map((f) =>
          pendingFiles.some(pf => pf.id === f.id)
            ? { ...f, status: 'error' as const }
            : f
        )
      );
      
      toast.error("Upload Failed", {
        description: "An error occurred during upload. Please try again.",
        duration: 5000,
      });
    }
  };

  const getFileIcon = (type: 'image' | 'audio' | 'video' | 'document') => {
    switch (type) {
      case 'image':
        return <Image className="h-5 w-5" />;
      case 'audio':
        return <AudioLines className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!user) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar activeItem="Upload Data" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeItem="Upload Data" />

      <div className="flex-1" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Data</h1>
            <p className="text-gray-600">Secure data ingestion portal for mission-critical data processing.</p>
          </div>

          <Card
            className={`mb-6 bg-white border-2 transition-all ${
              isDragging
                ? 'border-blue-600 shadow-lg shadow-blue-500/30 bg-blue-50'
                : 'border-blue-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CardContent className="flex flex-col items-center gap-8 px-6 py-16">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Image className="h-8 w-8" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">JPG, PNG</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <AudioLines className="h-8 w-8" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">MP3, WAV</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Video className="h-8 w-8" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">MP4, MOV</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <FileText className="h-8 w-8" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">PDF, JSON</span>
                </div>
              </div>
              <div className="flex max-w-[520px] flex-col items-center gap-3">
                <p className="text-xl font-bold text-center text-gray-900">Data Ingestion Zone</p>
                <p className="text-gray-600 text-sm text-center leading-relaxed">
                  {isDragging
                    ? 'Drop files here to upload'
                    : 'Drag and drop files (Images, PDFs, Audio, Video) or click to select files'}
                </p>
                <p className="text-gray-500 text-xs text-center mt-1">
                  Select files and click Upload to proceed
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,audio/*,video/*,.pdf,.json,.csv,.doc,.docx"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 font-medium px-6"
                  disabled={isUploading}
                >
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Select Files
                </Button>
                <Button
                  onClick={handleUploadClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
                  disabled={files.length === 0 || files.every((f) => f.status !== 'pending')}
                >
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </div>
            </CardContent>
          </Card>

          {files.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  Selected Files ({files.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-shrink-0">
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.file.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                            {getFileIcon(file.type)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.file.name}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {file.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.file.size)}
                        </p>
                        {file.status === 'pending' && (
                          <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
                            <span>Ready to upload</span>
                          </div>
                        )}
                        {file.status === 'uploading' && (
                          <>
                            <Progress value={file.progress} className="mt-2 h-2" />
                            <p className="text-xs text-gray-500 mt-1">{Math.round(file.progress)}%</p>
                          </>
                        )}
                        {file.status === 'success' && (
                          <div className="flex items-center gap-1 mt-1 text-green-600 text-xs">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Uploaded successfully</span>
                          </div>
                        )}
                        {file.status === 'error' && (
                          <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                            <AlertCircle className="h-3 w-3" />
                            <span>Upload failed</span>
                          </div>
                        )}
                      </div>

                      {file.status !== 'uploading' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(file.id)}
                          className="flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Supported File Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Images: JPG, PNG, GIF, WEBP, BMP</li>
                  <li>• Audio: MP3, WAV, AAC, OGG, FLAC</li>
                  <li>• Video: MP4, MOV, AVI, MKV, WEBM</li>
                  <li>• Documents: PDF, DOC, DOCX, JSON, CSV, TXT</li>
                  <li className="font-semibold text-blue-600 mt-2">• Multiple files can be selected at once</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Maximum file size: 100MB per file</li>
                  <li>• All files are encrypted during upload</li>
                  <li>• Files are validated before processing</li>
                  <li>• You can track submission status in real-time</li>
                  <li className="font-semibold text-blue-600 mt-2">• Mix different file types (PDF + Images) in one upload</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardUpload;