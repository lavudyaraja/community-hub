"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Download,
  MoreVertical,
  Layers,
  RefreshCw,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileDown,
  Trash2,
  Eye,
  Filter,
  X as CloseIcon,
} from "lucide-react";
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

interface TableViewProps {
  dataFiles: DataFile[];
  onFileSelect?: (index: number) => void;
  onRefresh?: () => void;
  onDelete?: (id: string) => void;
}

type SortField = 'fileName' | 'fileType' | 'fileSize' | 'date' | 'status';
type SortDirection = 'asc' | 'desc' | null;

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

export const TableView: React.FC<TableViewProps> = ({ 
  dataFiles, 
  onFileSelect,
  onRefresh,
  onDelete 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...dataFiles];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(file =>
        file.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(file => file.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(file => file.fileType === typeFilter);
    }

    // Apply sorting
    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        // Handle date sorting
        if (sortField === 'date') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        // Handle numeric sorting
        if (sortField === 'fileSize') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Handle string sorting
        if (typeof aValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    return filtered;
  }, [dataFiles, searchQuery, sortField, sortDirection, statusFilter, typeFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 ml-1 text-slate-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3.5 w-3.5 ml-1 text-blue-600" />
      : <ArrowDown className="h-3.5 w-3.5 ml-1 text-blue-600" />;
  };

  const handleCopyFileInfo = (file: DataFile) => {
    const fileInfo = `File: ${file.fileName}
Type: ${file.fileType}
Size: ${formatFileSize(file.fileSize)}
Status: ${file.status}
Date: ${formatDate(file.date)}
ID: ${file.id}`;
    
    navigator.clipboard.writeText(fileInfo);
    toast.success("File info copied to clipboard");
  };

  const handleCopyFileId = (fileId: string) => {
    navigator.clipboard.writeText(fileId);
    toast.success("File ID copied to clipboard");
  };

  const handleDownloadFile = (file: DataFile) => {
    if (file.preview) {
      // Download preview
      const link = document.createElement('a');
      link.href = file.preview;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading ${file.fileName}`);
    } else {
      toast.error("No preview available for download");
    }
  };

  const handleExportCSV = () => {
    const headers = ['File Name', 'Type', 'Size', 'Upload Date', 'Status', 'User Email', 'ID'];
    const rows = filteredAndSortedData.map(file => [
      file.fileName,
      file.fileType,
      formatFileSize(file.fileSize),
      formatDate(file.date),
      file.status,
      file.userEmail,
      file.id
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dataset-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("CSV exported successfully");
  };

  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(filteredAndSortedData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dataset-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("JSON exported successfully");
  };

  const handleDeleteFile = (fileId: string) => {
    if (onDelete) {
      onDelete(fileId);
      toast.success("File deleted successfully");
    } else {
      toast.error("Delete functionality not implemented");
    }
  };

  const toggleFileSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const selectAll = () => {
    if (selectedFiles.size === filteredAndSortedData.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredAndSortedData.map(f => f.id)));
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setSortField(null);
    setSortDirection(null);
  };

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

  const stats = {
    total: dataFiles.length,
    successful: dataFiles.filter(f => f.status === 'successful').length,
    pending: dataFiles.filter(f => f.status === 'pending').length,
    failed: dataFiles.filter(f => f.status === 'failed').length,
    totalSize: dataFiles.reduce((acc, f) => acc + f.fileSize, 0),
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || sortField;

  return (
    <Card className="bg-white border border-slate-200 overflow-hidden">
      {/* Header Section */}
      <div className="p-5 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-600" />
                Dataset Table View
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Complete dataset in tabular format • {filteredAndSortedData.length} of {dataFiles.length} files
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportCSV}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportJSON}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  onRefresh?.();
                  toast.success("Data refreshed");
                }}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="px-3 py-2 bg-white border border-slate-200 rounded-md">
              <div className="text-xs text-slate-600 mb-0.5">Total Files</div>
              <div className="text-lg font-semibold text-slate-900">{stats.total}</div>
            </div>
            <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-md">
              <div className="text-xs text-emerald-700 mb-0.5">Successful</div>
              <div className="text-lg font-semibold text-emerald-900">{stats.successful}</div>
            </div>
            <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-md">
              <div className="text-xs text-amber-700 mb-0.5">Pending</div>
              <div className="text-lg font-semibold text-amber-900">{stats.pending}</div>
            </div>
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-md">
              <div className="text-xs text-red-700 mb-0.5">Failed</div>
              <div className="text-lg font-semibold text-red-900">{stats.failed}</div>
            </div>
            <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-xs text-blue-700 mb-0.5">Total Size</div>
              <div className="text-lg font-semibold text-blue-900">{formatFileSize(stats.totalSize)}</div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by filename or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-slate-300 focus:border-blue-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 border-slate-300">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="successful">Successful</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40 border-slate-300">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Document</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <CloseIcon className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Selection Info */}
          {selectedFiles.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
              <span className="text-sm text-blue-800 font-medium">
                {selectedFiles.size} file{selectedFiles.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFiles(new Set())}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-slate-200 bg-slate-50">
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedFiles.size === filteredAndSortedData.length && filteredAndSortedData.length > 0}
                  onChange={selectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </TableHead>
              <TableHead 
                className="text-slate-700 font-semibold cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('fileName')}
              >
                <div className="flex items-center">
                  File Name
                  {getSortIcon('fileName')}
                </div>
              </TableHead>
              <TableHead 
                className="text-slate-700 font-semibold cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('fileType')}
              >
                <div className="flex items-center">
                  Type
                  {getSortIcon('fileType')}
                </div>
              </TableHead>
              <TableHead 
                className="text-slate-700 font-semibold cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('fileSize')}
              >
                <div className="flex items-center">
                  Size
                  {getSortIcon('fileSize')}
                </div>
              </TableHead>
              <TableHead 
                className="text-slate-700 font-semibold cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center">
                  Upload Date
                  {getSortIcon('date')}
                </div>
              </TableHead>
              <TableHead 
                className="text-slate-700 font-semibold cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead className="text-right text-slate-700 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Filter className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No files match your filters</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="mt-3"
                  >
                    Clear Filters
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedData.map((file, index) => (
                <TableRow
                  key={file.id}
                  className={`hover:bg-slate-50 transition-colors border-slate-200 ${
                    selectedFiles.has(file.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.id)}
                      onChange={() => toggleFileSelection(file.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableCell>
                  <TableCell 
                    className="font-medium text-sm text-slate-800 max-w-xs truncate cursor-pointer"
                    onClick={() => onFileSelect?.(dataFiles.findIndex(f => f.id === file.id))}
                  >
                    {file.fileName}
                  </TableCell>
                  <TableCell>
                    {getFileTypeBadge(file.fileType)}
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {formatFileSize(file.fileSize)}
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {formatDate(file.date)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(file.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-slate-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyFileId(file.id);
                        }}
                        title="Copy File ID"
                      >
                        <Copy className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-slate-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadFile(file);
                        }}
                        title="Download File"
                      >
                        <Download className="h-4 w-4 text-slate-600" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-slate-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4 text-slate-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => onFileSelect?.(dataFiles.findIndex(f => f.id === file.id))}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyFileInfo(file)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Info
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadFile(file)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteFile(file.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-3">
        <span className="text-sm text-slate-600">
          Showing {filteredAndSortedData.length} of {dataFiles.length} files
          {hasActiveFilters && (
            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
              <Filter className="h-3 w-3 mr-1" />
              Filtered
            </Badge>
          )}
        </span>
        <span className="text-xs text-slate-500">
          Last updated: {new Date().toLocaleString()}
        </span>
      </div>
    </Card>
  );
};