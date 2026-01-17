"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, FileText, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface DataFile {
  fileName: string;
  format: string;
  size: string;
  checksum: string;
  status: "pass" | "fail" | "warning";
  statusMessage: string;
  uploadDate: string;
  modified: string;
}

interface RawViewProps {
  dataFiles: DataFile[];
}

export const RawView: React.FC<RawViewProps> = ({ dataFiles }) => {
  const [copied, setCopied] = useState(false);
  const [showFullData, setShowFullData] = useState(false);

  // Format data - truncate long strings for better display
  const formatDataForDisplay = (data: DataFile[]) => {
    return data.map(file => {
      const formatted = { ...file };
      // Truncate checksum if too long
      if (formatted.checksum && formatted.checksum.length > 50) {
        formatted.checksum = formatted.checksum.substring(0, 50) + '...';
      }
      return formatted;
    });
  };

  const displayData = showFullData ? dataFiles : formatDataForDisplay(dataFiles);
  const rawData = JSON.stringify(displayData, null, 2);

  const handleCopy = async () => {
    try {
      // Always copy full data
      const fullData = JSON.stringify(dataFiles, null, 2);
      await navigator.clipboard.writeText(fullData);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    try {
      // Always download full data
      const fullData = JSON.stringify(dataFiles, null, 2);
      const blob = new Blob([fullData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dataset-raw-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (err) {
      console.error("Failed to download:", err);
      toast.error('Failed to download file');
    }
  };

  const handleRefresh = () => {
    window.location.reload();
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
    <Card className="bg-white border border-slate-200 overflow-hidden shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Raw Dataset View
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-0.5">
              {dataFiles.length} {dataFiles.length === 1 ? 'record' : 'records'}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Refresh
            </Button>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">Complete dataset in raw JSON format</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative bg-slate-900/5 min-h-[400px]">
          <pre className="p-4 sm:p-6 text-xs sm:text-sm font-mono text-slate-700 overflow-x-auto max-h-[700px] overflow-y-auto leading-relaxed">
            <code className="block whitespace-pre-wrap break-all">{rawData}</code>
          </pre>
          <div className="sticky bottom-4 right-4 float-right flex gap-2 mt-2">
            <Badge className="bg-slate-700 text-white border-0 text-[10px] px-2 py-0.5 font-medium">
              JSON
            </Badge>
            <Badge className="bg-blue-600 text-white border-0 text-[10px] px-2 py-0.5 font-medium">
              {dataFiles.length} {dataFiles.length === 1 ? 'Record' : 'Records'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
