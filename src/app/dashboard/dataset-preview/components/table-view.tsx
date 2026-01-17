"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Download,
  MoreVertical,
  Layers,
  RefreshCw,
} from "lucide-react";

interface DataFile {
  id: string;
  fileName: string;
  fileType: 'image' | 'audio' | 'video' | 'document';
  fileSize: number;
  userEmail: string;
  date: string;
  status: string;
}

interface TableViewProps {
  dataFiles: DataFile[];
  onFileSelect?: (index: number) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const TableView: React.FC<TableViewProps> = ({ dataFiles, onFileSelect }) => {
  if (dataFiles.length === 0) {
    return (
      <Card className="border border-slate-200 bg-white">
        <CardContent className="p-16 text-center">
          <Layers className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">No data available to display</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    if (status === 'successful') {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Successful
        </Badge>
      );
    } else if (status === 'failed') {
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
  };

  const getFileTypeBadge = (fileType: string) => {
    const colors: Record<string, string> = {
      image: 'bg-blue-50 text-blue-700 border-blue-200',
      video: 'bg-purple-50 text-purple-700 border-purple-200',
      audio: 'bg-teal-50 text-teal-700 border-teal-200',
      document: 'bg-orange-50 text-orange-700 border-orange-200',
    };
    return (
      <Badge className={`${colors[fileType] || 'bg-slate-50 text-slate-700 border-slate-200'} hover:${colors[fileType]}`}>
        {fileType.charAt(0).toUpperCase() + fileType.slice(1)}
      </Badge>
    );
  };

  const successfulCount = dataFiles.filter(f => f.status === 'successful').length;

  return (
    <Card className="bg-white border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-600" />
              Dataset Table View
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Complete dataset in tabular format • {dataFiles.length} files
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-slate-700">
                {successfulCount} Successful
              </span>
            </div>
            <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-100">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-slate-200">
              <TableHead className="text-slate-700 font-semibold">File Name</TableHead>
              <TableHead className="text-slate-700 font-semibold">Type</TableHead>
              <TableHead className="text-slate-700 font-semibold">Size</TableHead>
              <TableHead className="text-slate-700 font-semibold">Upload Date</TableHead>
              <TableHead className="text-slate-700 font-semibold">Status</TableHead>
              <TableHead className="text-right text-slate-700 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataFiles.map((file, index) => (
              <TableRow
                key={file.id}
                className="hover:bg-slate-50 cursor-pointer transition-colors border-slate-200"
                onClick={() => onFileSelect?.(index)}
              >
                <TableCell className="font-medium text-sm text-slate-800 max-w-xs truncate">
                  {file.fileName}
                </TableCell>
                <TableCell>
                  {getFileTypeBadge(file.fileType)}
                </TableCell>
                <TableCell className="text-slate-600 text-sm">{formatFileSize(file.fileSize)}</TableCell>
                <TableCell className="text-slate-600 text-sm">{formatDate(file.date)}</TableCell>
                <TableCell>
                  {getStatusBadge(file.status)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:bg-slate-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Copy className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:bg-slate-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:bg-slate-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4 text-slate-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <span className="text-sm text-slate-600">
          Showing {dataFiles.length} of {dataFiles.length} files
        </span>
      </div>
    </Card>
  );
};