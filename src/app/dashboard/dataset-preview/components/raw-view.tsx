"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, FileText, Download, RefreshCw } from "lucide-react";

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
  const [showFullPreview, setShowFullPreview] = useState(false);

  // Format data for display - optionally truncate long preview strings
  const formatDataForDisplay = (data: DataFile[]) => {
    return data.map(file => {
      const formatted = { ...file };
      // Truncate preview if it's too long (for display purposes)
      if (formatted.preview && !showFullPreview && formatted.preview.length > 200) {
        formatted.preview = formatted.preview.substring(0, 200) + '... [truncated]';
      }
      return formatted;
    });
  };

  const displayData = formatDataForDisplay(dataFiles);
  const rawData = JSON.stringify(displayData, null, 2);

  const handleCopy = async () => {
    try {
      // Copy the currently displayed data
      const currentDisplayData = formatDataForDisplay(dataFiles);
      const currentRawData = JSON.stringify(currentDisplayData, null, 2);
      await navigator.clipboard.writeText(currentRawData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    // Download full data without truncation
    const fullData = JSON.stringify(dataFiles, null, 2);
    const blob = new Blob([fullData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dataset-raw.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2 text-slate-800 flex-wrap">
            <FileText className="h-5 w-5 text-blue-600" />
            Raw Dataset View
            <Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
              {dataFiles.length} {dataFiles.length === 1 ? 'record' : 'records'}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {dataFiles.some(f => f.preview && f.preview.length > 200) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullPreview(!showFullPreview)}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                {showFullPreview ? 'Hide' : 'Show'} Full Preview
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-emerald-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
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
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative bg-slate-50 min-h-[400px]">
          <pre className="p-6 text-sm font-mono text-slate-700 overflow-x-auto max-h-[700px] overflow-y-auto leading-relaxed">
            <code className="block whitespace-pre-wrap break-words">{rawData}</code>
          </pre>
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <Badge className="bg-slate-700 text-white border-0 text-xs font-medium">
              JSON
            </Badge>
            <Badge className="bg-blue-600 text-white border-0 text-xs font-medium">
              {dataFiles.length} {dataFiles.length === 1 ? 'Record' : 'Records'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};