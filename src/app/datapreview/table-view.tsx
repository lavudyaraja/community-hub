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
  AlertTriangle,
  Copy,
  ExternalLink,
  MoreVertical,
  Layers,
  RefreshCw,
} from "lucide-react";

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

interface TableViewProps {
  dataFiles: DataFile[];
  onFileSelect?: (index: number) => void;
}

export const TableView: React.FC<TableViewProps> = ({ dataFiles, onFileSelect }) => {
  return (
    <Card className="bg-gradient-to-br from-[#141b27] to-[#0f1419] border-cyan-500/10 overflow-hidden">
      <div className="p-4 border-b border-cyan-500/10 bg-black/20 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-cyan-400" />
            Dataset Table View
          </h3>
          <p className="text-xs text-white/50 mt-1">Complete dataset in tabular format • Real-time Monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-white/70">
              {dataFiles.filter(f => f.status === "pass").length} Passed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            <span className="text-xs text-white/70">
              {dataFiles.filter(f => f.status === "warning").length} Warning
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-xs text-white/70">
              {dataFiles.filter(f => f.status === "fail").length} Failed
            </span>
          </div>
          <Button variant="ghost" size="sm" className="">
            <RefreshCw className="h-4 w-4 mr-2 text-cyan-400" />
            Refresh
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-cyan-500/10 hover:bg-transparent">
              <TableHead className="text-cyan-400 text-xs font-bold uppercase">File Name</TableHead>
              <TableHead className="text-cyan-400 text-xs font-bold uppercase">Format</TableHead>
              <TableHead className="text-cyan-400 text-xs font-bold uppercase">Size</TableHead>
              <TableHead className="text-cyan-400 text-xs font-bold uppercase">Checksum</TableHead>
              <TableHead className="text-cyan-400 text-xs font-bold uppercase">Upload Date</TableHead>
              <TableHead className="text-cyan-400 text-xs font-bold uppercase">Modified</TableHead>
              <TableHead className="text-cyan-400 text-xs font-bold uppercase">Status</TableHead>
              <TableHead className="text-right text-cyan-400 text-xs font-bold uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataFiles.map((file, index) => (
              <TableRow 
                key={index} 
                className="border-cyan-500/10 hover:bg-cyan-500/5 cursor-pointer transition-colors"
                onClick={() => onFileSelect?.(index)}
              >
                <TableCell className="font-mono text-xs text-white font-medium max-w-xs truncate">
                  {file.fileName}
                </TableCell>
                <TableCell className="text-white/70 text-xs">{file.format}</TableCell>
                <TableCell className="text-white text-xs font-medium">{file.size}</TableCell>
                <TableCell className="font-mono text-[10px] text-white/50">
                  {file.checksum}
                </TableCell>
                <TableCell className="text-white/60 text-xs">{file.uploadDate}</TableCell>
                <TableCell className="text-white/60 text-xs">{file.modified}</TableCell>
                <TableCell>
                  <Badge
                    className={`${
                      file.status === "pass"
                        ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/10"
                        : file.status === "warning"
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/10"
                        : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/10"
                    } text-xs font-bold`}
                  >
                    {file.status === "pass" ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : file.status === "warning" ? (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {file.statusMessage}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Copy className="h-4 w-4 text-cyan-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="h-4 w-4 text-cyan-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4 text-cyan-400" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="p-3 border-t border-cyan-500/10 flex justify-between items-center">
        <span className="text-xs text-white/50">Showing {dataFiles.length} of {dataFiles.length} files</span>
        <Button variant="ghost" className="text-xs font-bold text-cyan-400">
          Load More Rows
        </Button>
      </div>
    </Card>
  );
};
