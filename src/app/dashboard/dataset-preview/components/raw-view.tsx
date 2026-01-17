"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, FileText, Download, RefreshCw, Eye, EyeOff } from "lucide-react";

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

interface RawViewProps {
  dataFiles: DataFile[];
}

export const RawView: React.FC<RawViewProps> = ({ dataFiles }) => {
  const [copied, setCopied] = useState(false);
  const [showPreviews, setShowPreviews] = useState(false);
  const [expandedPreviews, setExpandedPreviews] = useState<Set<string>>(new Set());

  // Format data for display with smart preview handling
  const formatDataForDisplay = (data: DataFile[], includePreviews: boolean) => {
    return data.map(file => {
      const formatted: any = {
        id: file.id,
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        userEmail: file.userEmail,
        date: file.date,
        status: file.status,
      };

      // Only include preview if enabled
      if (includePreviews && file.preview) {
        const isExpanded = expandedPreviews.has(file.id);
        if (isExpanded) {
          formatted.preview = file.preview;
        } else {
          // Show just the first 100 chars with info about total length
          const previewLength = file.preview.length;
          formatted.preview = `${file.preview.substring(0, 100)}... [${previewLength} chars total - click "Expand Previews" to see full]`;
        }
      }

      return formatted;
    });
  };

  const displayData = formatDataForDisplay(dataFiles, showPreviews);
  const rawData = JSON.stringify(displayData, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    // Download with current preview settings
    const downloadData = formatDataForDisplay(dataFiles, showPreviews);
    const fullData = JSON.stringify(downloadData, null, 2);
    const blob = new Blob([fullData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dataset-raw-${showPreviews ? 'with-previews' : 'no-previews'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadFull = () => {
    // Download complete data with full previews
    const fullData = JSON.stringify(dataFiles, null, 2);
    const blob = new Blob([fullData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dataset-complete.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleExpandPreviews = () => {
    if (expandedPreviews.size > 0) {
      setExpandedPreviews(new Set());
    } else {
      const allIds = new Set(dataFiles.map(f => f.id));
      setExpandedPreviews(allIds);
    }
  };

  const hasAnyPreviews = dataFiles.some(f => f.preview);

  if (!dataFiles || dataFiles.length === 0) {
    return (
      <Card className="border border-slate-200 bg-white">
        <CardContent className="p-16 text-center">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">No data available to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-slate-200 overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <CardTitle className="flex items-center gap-2 text-slate-800 flex-wrap">
              <FileText className="h-5 w-5 text-blue-600" />
              Raw Dataset View
              <Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                {dataFiles.length} {dataFiles.length === 1 ? 'record' : 'records'}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1.5 text-emerald-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1.5" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <Download className="h-4 w-4 mr-1.5" />
                Download
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <RefreshCw className="h-4 w-4 mr-1.5" />
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Preview Controls */}
          {hasAnyPreviews && (
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={showPreviews ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowPreviews(!showPreviews)}
                  className={showPreviews 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  }
                >
                  {showPreviews ? (
                    <>
                      <Eye className="h-4 w-4 mr-1.5" />
                      Previews Shown
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 mr-1.5" />
                      Show Previews
                    </>
                  )}
                </Button>
                
                {showPreviews && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleExpandPreviews}
                      className="border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      {expandedPreviews.size > 0 ? 'Collapse' : 'Expand'} Previews
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadFull}
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    >
                      <Download className="h-4 w-4 mr-1.5" />
                      Download Complete
                    </Button>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  ⚠️ Preview data can be very large
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative bg-slate-50">
          <pre className="p-6 text-xs font-mono text-slate-700 overflow-x-auto max-h-[600px] overflow-y-auto leading-relaxed">
            <code className="block whitespace-pre-wrap break-all">{rawData}</code>
          </pre>
          <div className="absolute top-3 right-3 flex gap-1.5 z-10">
            <Badge className="bg-slate-700 text-white border-0 text-xs font-medium shadow-sm">
              JSON
            </Badge>
            <Badge className="bg-blue-600 text-white border-0 text-xs font-medium shadow-sm">
              {dataFiles.length} {dataFiles.length === 1 ? 'Record' : 'Records'}
            </Badge>
            {showPreviews && (
              <Badge className="bg-emerald-600 text-white border-0 text-xs font-medium shadow-sm">
                Previews: {expandedPreviews.size > 0 ? 'Full' : 'Truncated'}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Info Footer */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <span>Total Size: {(JSON.stringify(displayData).length / 1024).toFixed(2)} KB</span>
            {showPreviews && (
              <span className="text-amber-600 font-medium">
                With Previews: {(JSON.stringify(dataFiles).length / 1024).toFixed(2)} KB
              </span>
            )}
          </div>
          <span className="text-slate-500">
            Last updated: {new Date().toLocaleString()}
          </span>
        </div>
      </div>
    </Card>
  );
};