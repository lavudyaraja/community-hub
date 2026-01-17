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

export const VideoView: React.FC<VideoViewProps> = ({ dataFiles, onDelete }) => {
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
  const [videoErrors, setVideoErrors] = useState<Set<number>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);

  // Video URL valid aa kada ani check chese function
  const isValidVideo = (file: DataFile) => {
    if (!file.preview || file.preview.length === 0) {
      return false;
    }
    // Check if it's a valid data URL for video
    return file.preview.startsWith('data:video/') || file.preview.startsWith('blob:');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
      // parent component state update chestundi kabatti toast okkate chalu
    }
  };

  // Handle video play when dialog opens
  useEffect(() => {
    if (selectedVideo !== null && videoRef.current) {
      const video = videoRef.current;
      
      // Reset video state
      video.currentTime = 0;
      video.muted = false; // Enable sound
      
      // Try to play - user clicked to open dialog, so this should work
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Autoplay might be prevented, but user can click play button
          console.log('Autoplay prevented:', error);
        });
      }
    }
  }, [selectedVideo]);

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
            {dataFiles.map((file, index) => (
              <Card
                key={file.id}
                className="overflow-hidden border border-slate-200 hover:border-purple-400 transition-all bg-white group shadow-sm"
              >
                <div 
                  className="relative aspect-video bg-slate-900 cursor-pointer"
                  onClick={() => setSelectedVideo(index)}
                >
                  {isValidVideo(file) && !videoErrors.has(index) ? (
                    <video
                      key={`thumbnail-${file.id}`}
                      src={file.preview}
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
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100">
                      <VideoIcon className="h-12 w-12 text-slate-300 mb-2" />
                      <span className="text-[10px] text-slate-400">
                        {videoErrors.has(index) ? 'Video load failed' : 'Preview not available'}
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
            ))}
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
                {isValidVideo(dataFiles[selectedVideo]) && !videoErrors.has(selectedVideo) ? (
                  <video
                    key={`player-${dataFiles[selectedVideo].id}`}
                    ref={videoRef}
                    src={dataFiles[selectedVideo].preview}
                    className="w-full h-full max-h-[85vh]"
                    controls
                    playsInline
                    preload="auto"
                    onError={() => {
                      setVideoErrors(prev => {
                        const newSet = new Set(prev);
                        newSet.add(selectedVideo);
                        return newSet;
                      });
                    }}
                  />
                ) : (
                  <div className="text-center text-slate-400 p-8">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                    <p className="text-lg font-medium mb-2">Video cannot be played</p>
                    <p className="text-sm text-slate-500">
                      {!isValidVideo(dataFiles[selectedVideo]) 
                        ? 'Video preview data is missing or invalid.' 
                        : 'The video file may be corrupted or in an unsupported format.'}
                    </p>
                    <p className="text-xs text-slate-600 mt-2">
                      File: {dataFiles[selectedVideo].fileName}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};