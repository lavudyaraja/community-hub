"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Music,
  Play,
  Pause,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
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

interface AudioViewProps {
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

export const AudioView: React.FC<AudioViewProps> = ({ dataFiles, onDelete }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<number | null>(null);
  const [loadedPreviews, setLoadedPreviews] = useState<Map<number, string>>(new Map());
  const [loadingPreviews, setLoadingPreviews] = useState<Set<number>>(new Set());
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const dialogAudioRef = useRef<HTMLAudioElement>(null);

  // Load preview on-demand for audio files without preview
  const loadPreview = async (file: DataFile, index: number) => {
    // If already loaded, return
    if (loadedPreviews.has(index)) {
      return loadedPreviews.get(index);
    }

    // If preview exists in file, use it
    if (file.preview && file.preview.length > 0) {
      setLoadedPreviews(prev => new Map(prev).set(index, file.preview!));
      return file.preview;
    }

    // Load from API
    setLoadingPreviews(prev => new Set(prev).add(index));
    try {
      const response = await fetch(`/api/submissions/${file.id}/preview`);
      if (response.ok) {
        const data = await response.json();
        if (data.preview) {
          setLoadedPreviews(prev => new Map(prev).set(index, data.preview));
          return data.preview;
        }
      }
      throw new Error('Preview not available');
    } catch (error) {
      console.error(`Error loading preview for ${file.fileName}:`, error);
      return null;
    } finally {
      setLoadingPreviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  // Don't load all previews at once - only load on demand

  // Load preview immediately when audio is selected in dialog
  useEffect(() => {
    if (selectedAudio !== null) {
      const file = dataFiles[selectedAudio];
      const audioUrl = getAudioUrl(file, selectedAudio);
      if (!audioUrl && !loadingPreviews.has(selectedAudio)) {
        loadPreview(file, selectedAudio).catch(() => {
          toast.error('Failed to load audio preview');
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAudio]);

  const getAudioUrl = (file: DataFile, index: number) => {
    // Check loaded previews first
    if (loadedPreviews.has(index)) {
      return loadedPreviews.get(index)!;
    }
    // If preview exists in file, use it
    if (file.preview && file.preview.length > 0) {
      return file.preview;
    }
    return null;
  };

  if (!dataFiles || dataFiles.length === 0) {
    return (
      <Card className="border border-slate-200 bg-white">
        <CardContent className="p-16 text-center">
          <Music className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">No audio files available to display</p>
        </CardContent>
      </Card>
    );
  }

  const handlePlayPause = async (file: DataFile, index: number) => {
    const audioUrl = getAudioUrl(file, index);
    if (!audioUrl) {
      // Try to load preview first
      const preview = await loadPreview(file, index);
      if (!preview) {
        toast.error('Audio preview not available');
        return;
      }
    }

    const audio = audioRefs.current[file.id];
    const finalUrl = audioUrl || loadedPreviews.get(index) || file.preview;
    
    if (!audio && finalUrl) {
      // Create audio element if it doesn't exist
      const newAudio = new Audio(finalUrl);
      audioRefs.current[file.id] = newAudio;
      
      newAudio.addEventListener('ended', () => {
        setPlayingId(null);
      });
      
      newAudio.play().catch((error) => {
        console.error('Error playing audio:', error);
        toast.error('Failed to play audio');
      });
      setPlayingId(file.id);
      return;
    }

    if (audio) {
      if (playingId === file.id) {
        audio.pause();
        setPlayingId(null);
      } else {
        // Pause all other audio
        Object.values(audioRefs.current).forEach(a => {
          if (a && a !== audio) a.pause();
        });
        audio.play().catch((error) => {
          console.error('Error playing audio:', error);
          toast.error('Failed to play audio');
        });
        setPlayingId(file.id);
      }
    }
  };

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
      toast.success("Audio file deleted successfully");
    }
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedAudio !== null && selectedAudio > 0) {
      setSelectedAudio(selectedAudio - 1);
      if (dialogAudioRef.current) {
        dialogAudioRef.current.pause();
        setPlayingId(null);
      }
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedAudio !== null && selectedAudio < dataFiles.length - 1) {
      setSelectedAudio(selectedAudio + 1);
      if (dialogAudioRef.current) {
        dialogAudioRef.current.pause();
        setPlayingId(null);
      }
    }
  };

  const handleDialogPlayPause = () => {
    if (selectedAudio === null) return;
    const file = dataFiles[selectedAudio];
    
    if (dialogAudioRef.current) {
      if (playingId === file.id) {
        dialogAudioRef.current.pause();
        setPlayingId(null);
      } else {
        dialogAudioRef.current.play();
        setPlayingId(file.id);
      }
    }
  };

  return (
    <Card className="bg-white border border-slate-200">
      <CardHeader className="border-b border-slate-100 bg-slate-50">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Music className="h-5 w-5 text-teal-600" />
          Audio Gallery
          <Badge variant="secondary" className="ml-2 bg-teal-50 text-teal-700 border-teal-200">
            {dataFiles.length} {dataFiles.length === 1 ? 'audio' : 'audios'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {dataFiles.map((file) => (
            <Card
              key={file.id}
              className="overflow-hidden border border-slate-200 hover:border-teal-400 transition-all bg-white cursor-pointer"
              onClick={() => setSelectedAudio(dataFiles.indexOf(file))}
            >
              <div className="relative aspect-video bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-8">
                <div className="flex items-end gap-1 h-24 w-full justify-center">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t ${
                        playingId === file.id
                          ? 'bg-teal-500 animate-pulse'
                          : 'bg-teal-200'
                      }`}
                      style={{
                        height: `${Math.random() * 60 + 20}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
                <Badge className="absolute top-3 right-3 bg-slate-900/80 text-white border-0">
                  {formatFileSize(file.fileSize)}
                </Badge>
              </div>
              <CardContent className="p-4 bg-white">
                <p className="text-sm font-medium text-slate-800 truncate" title={file.fileName}>
                  {file.fileName}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(file.date).toLocaleDateString()}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                    onClick={() => setSelectedAudio(dataFiles.indexOf(file))}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {(() => {
                  const audioUrl = getAudioUrl(file, dataFiles.indexOf(file));
                  return audioUrl ? (
                    <audio
                      ref={(el) => {
                        audioRefs.current[file.id] = el;
                      }}
                      src={audioUrl}
                      className="hidden"
                    />
                  ) : null;
                })()}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      {/* Fullscreen Audio Player Dialog */}
      <Dialog open={selectedAudio !== null} onOpenChange={() => {
        setSelectedAudio(null);
        if (dialogAudioRef.current) {
          dialogAudioRef.current.pause();
          setPlayingId(null);
        }
      }}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0 bg-slate-900 border-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {selectedAudio !== null ? dataFiles[selectedAudio].fileName : 'Audio Player'}
          </DialogTitle>
          
          {selectedAudio !== null && (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/10 rounded-full"
                onClick={() => {
                  setSelectedAudio(null);
                  if (dialogAudioRef.current) {
                    dialogAudioRef.current.pause();
                    setPlayingId(null);
                  }
                }}
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Navigation Buttons */}
              {selectedAudio > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 z-50 text-white hover:bg-white/10 rounded-full"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
              )}

              {selectedAudio < dataFiles.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 z-50 text-white hover:bg-white/10 rounded-full"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              )}

              {/* Audio Player Content */}
              <div className="flex flex-col items-center justify-center w-full max-w-2xl">
                <div className="w-full mb-8">
                  <div className="flex items-end gap-1 h-48 w-full justify-center bg-slate-800/50 rounded-lg p-8">
                    {Array.from({ length: 60 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-t ${
                          playingId === dataFiles[selectedAudio].id
                            ? 'bg-teal-500 animate-pulse'
                            : 'bg-teal-500/30'
                        }`}
                        style={{
                          height: `${Math.random() * 80 + 30}px`,
                          animationDelay: `${i * 0.05}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-white font-bold text-xl mb-2">
                    {dataFiles[selectedAudio].fileName}
                  </h3>
                  <p className="text-slate-300 text-sm">
                    {formatFileSize(dataFiles[selectedAudio].fileSize)} • {new Date(dataFiles[selectedAudio].date).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="h-16 w-16 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    onClick={handleDialogPlayPause}
                  >
                    {playingId === dataFiles[selectedAudio].id ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8 ml-1" />
                    )}
                  </Button>
                </div>

                {(() => {
                  const file = dataFiles[selectedAudio];
                  const audioUrl = getAudioUrl(file, selectedAudio);
                  
                  if (loadingPreviews.has(selectedAudio)) {
                    return (
                      <div className="w-full mt-4 flex items-center justify-center p-8 bg-slate-800/50 rounded-lg">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      </div>
                    );
                  }
                  
                  if (audioUrl) {
                    return (
                      <audio
                        ref={dialogAudioRef}
                        src={audioUrl}
                        className="w-full mt-4"
                        controls
                        muted={false}
                        onPlay={() => setPlayingId(file.id)}
                        onPause={() => setPlayingId(null)}
                        onEnded={() => setPlayingId(null)}
                        onError={() => {
                          toast.error('Failed to load audio file');
                        }}
                      />
                    );
                  }
                  
                  return (
                    <div className="w-full mt-4 p-4 bg-slate-800/50 rounded-lg text-center">
                      <p className="text-slate-400 text-sm">Audio preview not available</p>
                    </div>
                  );
                })()}

                <div className="mt-6 text-center">
                  <p className="text-slate-400 text-sm">
                    {selectedAudio + 1} of {dataFiles.length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
