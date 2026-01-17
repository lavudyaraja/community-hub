"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
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

interface ImageViewProps {
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

export const ImageView: React.FC<ImageViewProps> = ({ dataFiles, onDelete }) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
      toast.success("Image deleted successfully");
    }
  };

  if (!dataFiles || dataFiles.length === 0) {
    return (
      <Card className="border border-slate-200 bg-white">
        <CardContent className="p-16 text-center">
          <ImageIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">No images available to display</p>
        </CardContent>
      </Card>
    );
  }

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage !== null && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage !== null && selectedImage < dataFiles.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
  };

  const getImageUrl = (file: DataFile) => {
    // If preview exists (whether it's base64 or a direct URL), use it
    if (file.preview && file.preview.length > 0) {
      return file.preview;
    }
    // Return placeholder if no preview
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlIFByZXZpZXc8L3RleHQ+PC9zdmc+';
  };

  return (
    <>
      <Card className="bg-white border border-slate-200">
        <CardHeader className="border-b border-slate-100 bg-slate-50">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <ImageIcon className="h-5 w-5 text-blue-600" />
            Image Gallery
            <Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
              {dataFiles.length} {dataFiles.length === 1 ? 'image' : 'images'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {dataFiles.map((file, index) => (
              <Card
                key={file.id}
                className="overflow-hidden border border-slate-200 hover:border-blue-400 transition-all cursor-pointer group bg-white"
                onClick={() => setSelectedImage(index)}
              >
                <div className="relative aspect-square bg-slate-50">
                  <img
                    src={getImageUrl(file)}
                    alt={file.fileName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                        // Fallback if the image path is broken
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlIFByZXZpZXc8L3RleHQ+PC9zdmc+';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                  <Badge className="absolute top-2 right-2 bg-slate-900/80 text-white border-0">
                    {formatFileSize(file.fileSize)}
                  </Badge>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 left-2 bg-red-500/90 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDelete(file.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <CardContent className="p-3 bg-white">
                  <p className="text-sm font-medium text-slate-800 truncate" title={file.fileName}>
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

      {/* Fullscreen Image Viewer */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-slate-900 border-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {selectedImage !== null ? dataFiles[selectedImage].fileName : 'Image Viewer'}
          </DialogTitle>
          
          {selectedImage !== null && (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/10 rounded-full"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Navigation Buttons */}
              {selectedImage > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 z-50 text-white hover:bg-white/10 rounded-full"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
              )}

              {selectedImage < dataFiles.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 z-50 text-white hover:bg-white/10 rounded-full"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              )}

              {/* Main Image in Dialog */}
              <div className="flex flex-col items-center justify-center p-8 w-full h-full">
                <img
                  src={getImageUrl(dataFiles[selectedImage])}
                  alt={dataFiles[selectedImage].fileName}
                  className="max-w-full max-h-[70vh] object-contain transition-all"
                />
                <div className="mt-6 text-center">
                  <p className="text-white font-medium text-lg">{dataFiles[selectedImage].fileName}</p>
                  <p className="text-slate-300 text-sm mt-2">
                    {selectedImage + 1} of {dataFiles.length} • {formatFileSize(dataFiles[selectedImage].fileSize)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};