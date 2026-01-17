"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Video as VideoIcon,
  Play,
  X,
  Trash2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface DataFile {
  id: string;
  fileName: string;
  fileType: 'image' | 'audio' | 'video' | 'document';
  fileSize: number;
  userEmail: string;
  date: string;
  status: string;
  preview?: string;
}

interface VideoViewProps {
  dataFiles: DataFile[];
  onDelete?: (id: string) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Format preview data as proper data URL
const formatPreviewData = (preview: string | undefined, mimeType?: string): string | null => {
  if (!preview || preview.length === 0) {
    return null;
  }

  // If already a data URL, return as is
  if (preview.startsWith('data:') || preview.startsWith('blob:') || preview.startsWith('http')) {
    return preview;
  }

  // If it's base64, format it as data URL
  const base64Pattern = /^[A-Za-z0-9+/=\s]+$/;
  const cleanData = preview.replace(/\s/g, '');
  
  if (base64Pattern.test(cleanData)) {
    const mime = mimeType || 'video/mp4';
    return `data:${mime};base64,${cleanData}`;
  }

  // Default: assume it's base64 and format it
  const defaultMime = mimeType || 'video/mp4';
  return `data:${defaultMime};base64,${cleanData}`;
};

export const VideoView: React.FC<VideoViewProps> = ({ dataFiles, onDelete }) => {
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
  const [videoErrors, setVideoErrors] = useState<Set<number>>(new Set());
  const [loadedPreviews, setLoadedPreviews] = useState<Map<number, string>>(new Map());
  const [loadingPreviews, setLoadingPreviews] = useState<Set<number>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);

  // Video URL valid aa kada ani check chese function
  const isValidVideo = (preview: string | null | undefined) => {
    if (!preview || preview.length === 0) {
      return false;
    }
    // Check if it's a valid data URL for video or blob URL
    return preview.startsWith('data:video/') || 
           preview.startsWith('data:') || 
           preview.startsWith('blob:') ||
           preview.startsWith('http');
  };

  // Load preview data on-demand
  const loadPreview = async (file: DataFile, index: number) => {
    // If already loaded, return
    if (loadedPreviews.has(index)) {
      return loadedPreviews.get(index);
    }

    // If preview exists in file, format it
    if (file.preview) {
      const formatted = formatPreviewData(file.preview);
      if (formatted && isValidVideo(formatted)) {
        setLoadedPreviews(prev => new Map(prev).set(index, formatted));
        return formatted;
      }
    }

    // Load from API
    setLoadingPreviews(prev => new Set(prev).add(index));
    try {
      const response = await fetch(`/api/submissions/${file.id}/preview`);
      if (response.ok) {
        const data = await response.json();
        if (data.preview) {
          const formatted = formatPreviewData(data.preview, data.mime_type);
          if (formatted && isValidVideo(formatted)) {
            setLoadedPreviews(prev => new Map(prev).set(index, formatted));
            return formatted;
          }
        }
      }
      throw new Error('Preview not available');
    } catch (error) {
      console.error(`Error loading preview for ${file.fileName}:`, error);
      setVideoErrors(prev => new Set(prev).add(index));
      toast.error(`Failed to load preview for ${file.fileName}`);
      return null;
    } finally {
      setLoadingPreviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
      // parent component state update chestundi kabatti toast okkate chalu
    }
  };

  // Handle video selection and load preview
  const handleVideoClick = async (index: number) => {
    const file = dataFiles[index];
    
    // Open dialog immediately for better UX
    setSelectedVideo(index);
    
    // Load preview in background if not already loaded
    if (!loadedPreviews.has(index) && !loadingPreviews.has(index)) {
      // Don't await - load in background
      loadPreview(file, index).catch(error => {
        console.error('Error loading preview:', error);
      });
    }
  };

  // Handle video play when dialog opens and preview is loaded
  useEffect(() => {
    if (selectedVideo !== null && videoRef.current) {
      const video = videoRef.current;
      const previewUrl = loadedPreviews.get(selectedVideo) || formatPreviewData(dataFiles[selectedVideo]?.preview);
      
      if (previewUrl && isValidVideo(previewUrl)) {
        // Update source if needed
        if (video.src !== previewUrl) {
          video.src = previewUrl;
        }
        
        // Reset video state and enable sound
        video.currentTime = 0;
        video.muted = false;
        video.volume = 1.0;
        
        // Try to play - user clicked to open dialog, so this should work
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            // Autoplay might be prevented, but user can click play button
            console.log('Autoplay prevented:', error);
          });
        }
      }
    }
  }, [selectedVideo, loadedPreviews, dataFiles]);

  // Don't preload all videos - only load on demand (on hover or click)

  if (!dataFiles || dataFiles.length === 0) {
    return (
      <Card className="border border-slate-200 bg-white">
        <CardContent className="p-16 text-center">
          <VideoIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">No videos available to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white border border-slate-200">
        <CardHeader className="border-b border-slate-100 bg-slate-50">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <VideoIcon className="h-5 w-5 text-purple-600" />
            Video Gallery
            <Badge variant="secondary" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
              {dataFiles.length} {dataFiles.length === 1 ? 'video' : 'videos'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {dataFiles.map((file, index) => {
              const previewUrl = loadedPreviews.get(index) || formatPreviewData(file.preview);
              const hasValidPreview = isValidVideo(previewUrl);
              const isLoading = loadingPreviews.has(index);
              
              return (
                <Card
                  key={file.id}
                  className="overflow-hidden border border-slate-200 hover:border-purple-400 transition-all bg-white group shadow-sm"
                >
                  <div 
                    className="relative aspect-video bg-slate-900 cursor-pointer"
                    onClick={() => handleVideoClick(index)}
                    onMouseEnter={() => {
                      // Load preview on hover if not already loaded
                      if (!file.preview && !loadedPreviews.has(index) && !loadingPreviews.has(index)) {
                        loadPreview(file, index).catch(() => {});
                      }
                    }}
                  >
                    {isLoading ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100">
                        <Loader2 className="h-8 w-8 text-purple-600 animate-spin mb-2" />
                        <span className="text-[10px] text-slate-400">Loading preview...</span>
                      </div>
                    ) : hasValidPreview && !videoErrors.has(index) && previewUrl ? (
                      <video
                        key={`thumbnail-${file.id}-${index}`}
                        src={previewUrl}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                        playsInline
                        loop
                        onError={() => {
                          setVideoErrors(prev => {
                            const newSet = new Set(prev);
                            newSet.add(index);
                            return newSet;
                          });
                        }}
                        onLoadedData={() => {
                          // Preview loaded successfully
                          setVideoErrors(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(index);
                            return newSet;
                          });
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100">
                        <VideoIcon className="h-12 w-12 text-slate-300 mb-2" />
                        <span className="text-[10px] text-slate-400">
                          {videoErrors.has(index) ? 'Video load failed' : 'Click to load preview'}
                        </span>
                      </div>
                    )}
                  
                    {/* Overlay Play Button */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="h-6 w-6 text-slate-900 fill-slate-900 ml-1" />
                      </div>
                    </div>

                    <Badge className="absolute top-3 right-3 bg-black/60 text-white border-0 backdrop-blur-sm">
                      {formatFileSize(file.fileSize)}
                    </Badge>

                    {onDelete && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-3 left-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        onClick={(e) => handleDelete(file.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <p className="text-sm font-semibold text-slate-800 truncate" title={file.fileName}>
                      {file.fileName}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(file.date).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen Video Player */}
      <Dialog open={selectedVideo !== null} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-5xl w-[95vw] p-0 bg-black border-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {selectedVideo !== null ? dataFiles[selectedVideo].fileName : 'Video Player'}
          </DialogTitle>
          
          {selectedVideo !== null && (
            <div className="relative flex flex-col">
              {/* Custom Header in Dialog */}
              <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-50 flex justify-between items-center">
                <p className="text-white text-sm font-medium truncate max-w-[80%]">
                  {dataFiles[selectedVideo].fileName}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-full"
                  onClick={() => setSelectedVideo(null)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Player Area */}
              <div className="w-full aspect-video flex items-center justify-center bg-black">
                {(() => {
                  const file = dataFiles[selectedVideo];
                  const previewUrl = loadedPreviews.get(selectedVideo) || formatPreviewData(file.preview);
                  const hasValidPreview = isValidVideo(previewUrl);
                  const isLoading = loadingPreviews.has(selectedVideo);
                  
                  if (isLoading) {
                    return (
                      <div className="text-center text-slate-400 p-8">
                        <Loader2 className="h-12 w-12 mx-auto mb-4 text-purple-600 animate-spin" />
                        <p className="text-lg font-medium mb-2">Loading video...</p>
                        <p className="text-sm text-slate-500">Please wait while we load the video preview</p>
                      </div>
                    );
                  }
                  
                  if (hasValidPreview && !videoErrors.has(selectedVideo) && previewUrl) {
                    return (
                      <video
                        key={`player-${file.id}-${selectedVideo}`}
                        ref={videoRef}
                        src={previewUrl}
                        className="w-full h-full max-h-[85vh]"
                        controls
                        playsInline
                        preload="auto"
                        muted={false}
                        onError={(e) => {
                          console.error('Video playback error:', e);
                          setVideoErrors(prev => {
                            const newSet = new Set(prev);
                            newSet.add(selectedVideo);
                            return newSet;
                          });
                          toast.error('Failed to play video. The file may be corrupted or in an unsupported format.');
                        }}
                        onLoadedData={() => {
                          // Video loaded successfully - ensure sound is enabled
                          if (videoRef.current) {
                            videoRef.current.muted = false;
                            videoRef.current.volume = 1.0;
                          }
                        }}
                      />
                    );
                  }
                  
                  return (
                    <div className="text-center text-slate-400 p-8">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                      <p className="text-lg font-medium mb-2">Video cannot be played</p>
                      <p className="text-sm text-slate-500">
                        {!hasValidPreview 
                          ? 'Video preview data is missing or invalid.' 
                          : 'The video file may be corrupted or in an unsupported format.'}
                      </p>
                      <p className="text-xs text-slate-600 mt-2">
                        File: {file.fileName}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 text-white border-white/30 hover:bg-white/10"
                        onClick={async () => {
                          await loadPreview(file, selectedVideo);
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry Loading
                      </Button>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};