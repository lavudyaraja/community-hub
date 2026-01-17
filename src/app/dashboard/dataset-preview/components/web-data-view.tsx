"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Globe,
  FileText,
  Download,
  Trash2,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
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

interface WebDataViewProps {
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

const dataURLtoBlob = (dataurl: string): Blob => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export const WebDataView: React.FC<WebDataViewProps> = ({ dataFiles, onDelete }) => {
  const [selectedFile, setSelectedFile] = useState<number | null>(null);
  const [loadedPreviews, setLoadedPreviews] = useState<Map<number, string>>(new Map());
  const [loadingPreviews, setLoadingPreviews] = useState<Set<number>>(new Set());
  const blobUrlsRef = useRef<Set<string>>(new Set());

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(url => {
        URL.revokeObjectURL(url);
      });
      blobUrlsRef.current.clear();
    };
  }, []);

  const loadPreview = async (file: DataFile, index: number): Promise<string | null> => {
    // Check if already loaded
    if (loadedPreviews.has(index)) {
      const cached = loadedPreviews.get(index)!;
      console.log(`[Preview] Using cached preview for ${file.fileName}`);
      return cached;
    }

    // Check if file has inline preview
    if (file.preview && file.preview.length > 0) {
      console.log(`[Preview] Using inline preview for ${file.fileName}`);
      setLoadedPreviews(prev => new Map(prev).set(index, file.preview!));
      return file.preview;
    }

    // Mark as loading
    setLoadingPreviews(prev => new Set(prev).add(index));
    console.log(`[Preview] Loading preview for ${file.fileName} (ID: ${file.id}, Type: ${file.fileType})`);
    
    try {
      // Use submissions API which already handles web_data table lookup
      const apiEndpoint = `/api/submissions/${file.id}/preview`;
      
      console.log(`[Preview] Calling API: ${apiEndpoint} for ${file.fileType} file`);
      
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error(`[Preview] API Error for ${file.fileName}:`, {
          status: response.status,
          statusText: response.statusText,
          endpoint: apiEndpoint,
          error: errorData.error,
          details: errorData.details,
          message: errorData.message
        });
        
        // If 404, it means no preview exists - this is okay
        if (response.status === 404) {
          console.warn(`[Preview] No preview data available for ${file.fileName}`);
          return null;
        }
        
        return null;
      }

      const data = await response.json();
      console.log(`[Preview] API Response for ${file.fileName}:`, {
        hasPreview: !!data.preview,
        previewLength: data.preview?.length || 0,
        mimeType: data.mime_type,
        source: data.source,
        previewStart: data.preview?.substring(0, 50) || 'null'
      });
      
      if (data.preview && data.preview.length > 0) {
        console.log(`[Preview] ✅ Successfully loaded preview for ${file.fileName}`);
        setLoadedPreviews(prev => new Map(prev).set(index, data.preview));
        return data.preview;
      } else {
        console.warn(`[Preview] ⚠️ No preview data in response for ${file.fileName}`, data);
        return null;
      }
    } catch (error) {
      console.error(`[Preview] ❌ Network error loading preview for ${file.fileName}:`, error);
      return null;
    } finally {
      setLoadingPreviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  useEffect(() => {
    if (selectedFile !== null) {
      const file = dataFiles[selectedFile];
      console.log(`[WebDataView] File selected:`, {
        fileName: file.fileName,
        fileType: file.fileType,
        fileId: file.id,
        hasInlinePreview: !!file.preview,
        inlinePreviewLength: file.preview?.length || 0
      });
      
      const previewUrl = getPreviewUrl(file, selectedFile);
      console.log(`[WebDataView] Current preview URL:`, {
        hasPreviewUrl: !!previewUrl,
        previewUrlLength: previewUrl?.length || 0,
        isLoading: loadingPreviews.has(selectedFile),
        isInLoadedPreviews: loadedPreviews.has(selectedFile)
      });
      
      // Always try to load preview if not already loaded
      if (!previewUrl && !loadingPreviews.has(selectedFile)) {
        console.log(`[WebDataView] Triggering preview load for ${file.fileName}`);
        loadPreview(file, selectedFile)
          .then((preview) => {
            if (preview) {
              console.log(`[WebDataView] ✅ Preview loaded successfully for ${file.fileName}`);
              // Force re-render by updating state
              setLoadedPreviews(prev => {
                const newMap = new Map(prev);
                newMap.set(selectedFile, preview);
                return newMap;
              });
            } else {
              console.warn(`[WebDataView] ⚠️ Preview load returned null for ${file.fileName}`);
            }
          })
          .catch(error => {
            console.error('[WebDataView] ❌ Failed to load preview:', error);
            toast.error('Failed to load preview. Check console for details.');
          });
      } else if (previewUrl) {
        console.log(`[WebDataView] ✅ Preview already available for ${file.fileName}`);
      }
    }
  }, [selectedFile, dataFiles]);

  const getPreviewUrl = (file: DataFile, index: number) => {
    if (loadedPreviews.has(index)) {
      return loadedPreviews.get(index)!;
    }
    if (file.preview && file.preview.length > 0) {
      return file.preview;
    }
    return null;
  };

  const getPDFUrl = (previewUrl: string): string => {
    // If it's a data URL, convert it to blob URL for PDF viewing
    if (previewUrl.startsWith('data:')) {
      try {
        const blob = dataURLtoBlob(previewUrl);
        const blobUrl = URL.createObjectURL(blob);
        blobUrlsRef.current.add(blobUrl);
        return blobUrl;
      } catch (error) {
        console.error('Error converting data URL to blob:', error);
        return previewUrl;
      }
    }
    return previewUrl;
  };

  // Cleanup blob URL when dialog closes - MUST be before early return
  useEffect(() => {
    if (selectedFile === null) {
      // Cleanup all blob URLs when dialog closes
      blobUrlsRef.current.forEach(url => {
        URL.revokeObjectURL(url);
      });
      blobUrlsRef.current.clear();
    }
  }, [selectedFile]);

  // Early return AFTER all hooks
  if (!dataFiles || dataFiles.length === 0) {
    return (
      <Card className="border border-slate-200 bg-white">
        <CardContent className="p-16 text-center">
          <Globe className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">No web data files available to display</p>
        </CardContent>
      </Card>
    );
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
      toast.success("File deleted successfully");
    }
  };

  const handleDownload = async (file: DataFile, index: number) => {
    let previewUrl = getPreviewUrl(file, index);
    
    if (!previewUrl) {
      previewUrl = await loadPreview(file, index) || null;
    }

    if (previewUrl) {
      try {
        const link = document.createElement('a');
        link.href = previewUrl;
        link.download = file.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("File download started");
      } catch (error) {
        console.error('Download error:', error);
        toast.error("Failed to download file");
      }
    } else {
      toast.error("No preview data available for download");
    }
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedFile !== null && selectedFile > 0) {
      setSelectedFile(selectedFile - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedFile !== null && selectedFile < dataFiles.length - 1) {
      setSelectedFile(selectedFile + 1);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'document':
        return <FileText className="h-12 w-12 text-orange-600" />;
      default:
        return <Globe className="h-12 w-12 text-blue-600" />;
    }
  };

  const isPDF = (fileName: string) => {
    return fileName.toLowerCase().endsWith('.pdf');
  };

  const renderPreview = (file: DataFile, index: number) => {
    const previewUrl = getPreviewUrl(file, index);
    const isLoading = loadingPreviews.has(index);

    console.log(`[RenderPreview] Rendering preview for ${file.fileName}:`, {
      hasPreviewUrl: !!previewUrl,
      previewUrlLength: previewUrl?.length || 0,
      isLoading,
      fileType: file.fileType,
      isPDF: isPDF(file.fileName)
    });

    if (isLoading) {
      return (
        <div className="w-full h-full flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
            <span className="text-slate-300">Loading preview...</span>
            <span className="text-slate-400 text-xs">Please wait</span>
          </div>
        </div>
      );
    }

    if (!previewUrl) {
      console.warn(`[RenderPreview] No preview URL for ${file.fileName}`);
      return (
        <div className="w-full h-full flex flex-col items-center justify-center min-h-[400px]">
          <div className="bg-gradient-to-br from-orange-100 to-red-100 p-12 rounded-lg mb-6 flex items-center justify-center">
            <FileText className="h-24 w-24 text-orange-600" />
          </div>
          <p className="text-slate-300 text-center mb-2">Preview not available</p>
          <p className="text-slate-400 text-sm text-center mb-4">Click download to view this file</p>
          <Button
            variant="outline"
            size="sm"
            className="text-white border-white/20 hover:bg-white/10"
            onClick={() => {
              // Retry loading preview
              loadPreview(file, index).then(preview => {
                if (preview) {
                  setLoadedPreviews(prev => new Map(prev).set(index, preview));
                  toast.success('Preview loaded');
                } else {
                  toast.error('Preview not available in database');
                }
              });
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Loading Preview
          </Button>
        </div>
      );
    }

    switch (file.fileType) {
      case 'image':
        return (
          <div className="w-full h-full flex items-center justify-center min-h-[400px] p-4">
            <img
              src={previewUrl}
              alt={file.fileName}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              onError={(e) => {
                console.error('Image load error:', e);
                toast.error('Failed to load image preview');
              }}
            />
          </div>
        );
      
      case 'video':
        return (
          <div className="w-full h-full flex items-center justify-center min-h-[400px] p-4">
            <video
              src={previewUrl}
              controls
              className="max-w-full max-h-full rounded-lg shadow-lg"
              onError={(e) => {
                console.error('Video load error:', e);
                toast.error('Failed to load video preview');
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      
      case 'audio':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center min-h-[400px] p-8">
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-16 rounded-lg mb-8 flex items-center justify-center">
              <Globe className="h-32 w-32 text-pink-600" />
            </div>
            <audio 
              src={previewUrl} 
              controls 
              className="w-full max-w-2xl"
              onError={(e) => {
                console.error('Audio load error:', e);
                toast.error('Failed to load audio preview');
              }}
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      
      case 'document':
        if (isPDF(file.fileName)) {
          const pdfUrl = getPDFUrl(previewUrl);
          return (
            <div className="w-full h-full flex items-center justify-center min-h-[500px] bg-slate-800 rounded-lg overflow-hidden">
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full border-0"
                title={file.fileName}
                style={{ minHeight: '500px' }}
                onError={(e) => {
                  console.error('PDF load error:', e);
                  toast.error('Failed to load PDF preview');
                }}
              />
            </div>
          );
        } else {
          return (
            <div className="w-full h-full flex flex-col items-center justify-center min-h-[400px]">
              <div className="bg-gradient-to-br from-orange-100 to-red-100 p-12 rounded-lg mb-6 flex items-center justify-center">
                <FileText className="h-24 w-24 text-orange-600" />
              </div>
              <p className="text-slate-300 text-center mb-2">
                Document preview not available
              </p>
              <p className="text-slate-400 text-sm text-center">
                Download the file to view its contents
              </p>
            </div>
          );
        }
      
      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center min-h-[400px]">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-12 rounded-lg mb-6 flex items-center justify-center">
              {getFileIcon(file.fileType)}
            </div>
            <p className="text-slate-300 text-center">Preview not available</p>
          </div>
        );
    }
  };

  return (
    <Card className="bg-white border border-slate-200">
      <CardHeader className="border-b border-slate-100 bg-slate-50">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Globe className="h-5 w-5 text-blue-600" />
          Web Data Files
          <Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
            {dataFiles.length} {dataFiles.length === 1 ? 'file' : 'files'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {dataFiles.map((file, idx) => (
            <Card
              key={file.id}
              className="overflow-hidden border border-slate-200 hover:border-blue-400 transition-all bg-white cursor-pointer"
              onClick={() => setSelectedFile(idx)}
            >
              <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-8">
                {getFileIcon(file.fileType)}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(idx);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                      onClick={(e) => handleDelete(e, file.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      <Dialog open={selectedFile !== null} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-7xl w-[95vw] h-[95vh] max-h-[95vh] p-0 bg-slate-900 border-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {selectedFile !== null ? dataFiles[selectedFile].fileName : 'File Viewer'}
          </DialogTitle>
          
          {selectedFile !== null && (
            <div className="relative w-full h-full flex flex-col">
              {/* Header with close button */}
              <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-slate-900/95 to-transparent p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-lg truncate pr-12">
                    {dataFiles[selectedFile].fileName}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-full flex-shrink-0"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation buttons */}
              {selectedFile > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 rounded-full bg-slate-800/80 backdrop-blur-sm"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}

              {selectedFile < dataFiles.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 rounded-full bg-slate-800/80 backdrop-blur-sm"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}

              {/* Preview area */}
              <div className="flex-1 overflow-auto pt-16 pb-24">
                <div className="w-full h-full min-h-[500px]">
                  {renderPreview(dataFiles[selectedFile], selectedFile)}
                </div>
              </div>

              {/* Footer with file info and actions */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/95 to-transparent p-6 border-t border-slate-700">
                <div className="flex flex-col gap-4">
                  {/* File info */}
                  <div className="flex items-center justify-center gap-4 text-slate-300 text-sm flex-wrap">
                    <span className="font-medium">{formatFileSize(dataFiles[selectedFile].fileSize)}</span>
                    <span>•</span>
                    <span>{new Date(dataFiles[selectedFile].date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                    <span>•</span>
                    <Badge className="bg-blue-600 text-white border-0">
                      {dataFiles[selectedFile].fileType}
                    </Badge>
                    <span>•</span>
                    <span className="text-slate-400">
                      {selectedFile + 1} of {dataFiles.length}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20 min-w-[140px]"
                      onClick={() => handleDownload(dataFiles[selectedFile], selectedFile)}
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download
                    </Button>
                    {(() => {
                      const previewUrl = getPreviewUrl(dataFiles[selectedFile], selectedFile);
                      return previewUrl ? (
                        <Button
                          variant="outline"
                          size="lg"
                          className="bg-white/10 hover:bg-white/20 text-white border-white/20 min-w-[140px]"
                          onClick={() => {
                            if (previewUrl.startsWith('data:')) {
                              const blob = dataURLtoBlob(previewUrl);
                              const blobUrl = URL.createObjectURL(blob);
                              window.open(blobUrl, '_blank');
                              setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
                            } else {
                              window.open(previewUrl, '_blank');
                            }
                          }}
                        >
                          <ExternalLink className="h-5 w-5 mr-2" />
                          Open in New Tab
                        </Button>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};