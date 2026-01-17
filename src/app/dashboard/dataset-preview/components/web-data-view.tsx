"use client";

import React, { useState } from "react";
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

export const WebDataView: React.FC<WebDataViewProps> = ({ dataFiles, onDelete }) => {
  const [selectedFile, setSelectedFile] = useState<number | null>(null);

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

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
      toast.success("File deleted successfully");
    }
  };

  const handleDownload = (file: DataFile) => {
    if (file.preview) {
      const link = document.createElement('a');
      link.href = file.preview;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("File download started");
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
        return <FileText className="h-8 w-8 text-orange-600" />;
      default:
        return <Globe className="h-8 w-8 text-blue-600" />;
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
          {dataFiles.map((file) => (
            <Card
              key={file.id}
              className="overflow-hidden border border-slate-200 hover:border-blue-400 transition-all bg-white cursor-pointer"
              onClick={() => setSelectedFile(dataFiles.indexOf(file))}
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
                    onClick={() => setSelectedFile(dataFiles.indexOf(file))}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
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
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      {/* File Details Dialog */}
      <Dialog open={selectedFile !== null} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0 bg-slate-900 border-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {selectedFile !== null ? dataFiles[selectedFile].fileName : 'File Viewer'}
          </DialogTitle>
          
          {selectedFile !== null && (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/10 rounded-full"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Navigation Buttons */}
              {selectedFile > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 z-50 text-white hover:bg-white/10 rounded-full"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
              )}

              {selectedFile < dataFiles.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 z-50 text-white hover:bg-white/10 rounded-full"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              )}

              {/* File Content */}
              <div className="flex flex-col items-center justify-center w-full max-w-3xl h-full">
                <div className="w-full mb-8 flex items-center justify-center">
                  <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-16 rounded-lg">
                    {getFileIcon(dataFiles[selectedFile].fileType)}
                  </div>
                </div>

                <div className="text-center mb-6 w-full">
                  <h3 className="text-white font-bold text-xl mb-2">
                    {dataFiles[selectedFile].fileName}
                  </h3>
                  <div className="flex items-center justify-center gap-4 text-slate-300 text-sm">
                    <span>{formatFileSize(dataFiles[selectedFile].fileSize)}</span>
                    <span>•</span>
                    <span>{new Date(dataFiles[selectedFile].date).toLocaleDateString()}</span>
                    <span>•</span>
                    <Badge className="bg-blue-600 text-white border-0">
                      {dataFiles[selectedFile].fileType}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    onClick={() => handleDownload(dataFiles[selectedFile])}
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download File
                  </Button>
                  {dataFiles[selectedFile].preview && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                      onClick={() => {
                        window.open(dataFiles[selectedFile].preview, '_blank');
                      }}
                    >
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Open Preview
                    </Button>
                  )}
                </div>

                <div className="mt-8 text-center">
                  <p className="text-slate-400 text-sm">
                    {selectedFile + 1} of {dataFiles.length}
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
