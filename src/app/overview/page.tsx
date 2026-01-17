"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Network,
  Radio,
  Workflow,
  FileText,
  Database,
  ShieldCheck,
  Eye,
  BarChart3,
  Code,
  ZoomIn,
  Maximize,
  Brain,
  MapPin,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface DataRow {
  id: string;
  timestamp: string;
  coordinates: string;
  deviceId: string;
  status: string;
  metricValue: number;
}

const OverviewPage = () => {
  const [activeTab, setActiveTab] = useState<"preview" | "analysis" | "schema">("preview");

  const dataRows: DataRow[] = [
    {
      id: "#TX-99012",
      timestamp: "2023-10-24 14:22:10",
      coordinates: "34.0522, -118.2437",
      deviceId: "EDGE-US-WEST-1",
      status: "Validated",
      metricValue: 0.8821,
    },
    {
      id: "#TX-99013",
      timestamp: "2023-10-24 14:22:15",
      coordinates: "34.0523, -118.2439",
      deviceId: "EDGE-US-WEST-1",
      status: "Validated",
      metricValue: 0.891,
    },
    {
      id: "#TX-99014",
      timestamp: "2023-10-24 14:22:18",
      coordinates: "34.0525, -118.2442",
      deviceId: "EDGE-US-WEST-1",
      status: "Validated",
      metricValue: 0.8755,
    },
    {
      id: "#TX-99015",
      timestamp: "2023-10-24 14:22:21",
      coordinates: "34.0529, -118.2445",
      deviceId: "EDGE-US-WEST-1",
      status: "Validated",
      metricValue: 0.9102,
    },
    {
      id: "#TX-99016",
      timestamp: "2023-10-24 14:22:25",
      coordinates: "34.0531, -118.2448",
      deviceId: "EDGE-US-WEST-1",
      status: "Validated",
      metricValue: 0.8993,
    },
  ];

  const aiTags = [
    { label: "Vehicle", confidence: 94 },
    { label: "Road", confidence: 88 },
    { label: "Cloud", confidence: 72 },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#0d1117] text-slate-100 overflow-x-hidden">
      {/* Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-30" 
        style={{
          backgroundImage: "radial-gradient(rgba(16, 183, 127, 0.1) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-emerald-900/30 bg-[#0d1117]/80 backdrop-blur-md px-8 py-3">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-emerald-500">
            <Network className="h-8 w-8" />
            <h2 className="text-lg font-bold text-white">National Data Intel</h2>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-sm font-medium text-white/60 hover:text-emerald-500 transition-colors" href="#">
              Dashboard
            </a>
            <a className="text-sm font-medium text-white/60 hover:text-emerald-500 transition-colors" href="#">
              Pipelines
            </a>
            <a className="text-sm font-medium text-white/60 hover:text-emerald-500 transition-colors" href="#">
              Regional Hubs
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#161b22] px-3 py-1.5 rounded-lg border border-emerald-900/50">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-500 uppercase tracking-wider">System Live</span>
          </div>
          <div className="h-10 w-10 rounded-full border border-emerald-500/30 bg-slate-700" />
        </div>
      </header>

      <main className="flex-1 flex flex-col p-6 gap-6 max-w-[1600px] mx-auto w-full relative z-10">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <a className="text-emerald-500 font-medium flex items-center gap-1" href="#">
            <Radio className="h-4 w-4" /> Level 1: Edge Validation
          </a>
          <span className="text-white/30">/</span>
          <span className="text-white/40 flex items-center gap-1">
            <Workflow className="h-4 w-4" /> Level 2: Regional Hub
          </span>
          <span className="text-white/30">/</span>
          <span className="text-white/20">Level 3: Central Intel</span>
        </div>

        {/* Page Heading & Quick Stats */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-[#161b22]/50 p-6 rounded-xl border border-emerald-900/30">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold">Dataset Preview & Quality Overview</h1>
            <p className="text-white/50">Validation gate for multi-level high-scale intelligence processing</p>
          </div>
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <Card className="flex-1 min-w-[140px] bg-[#161b22] border-emerald-900/30">
              <CardContent className="p-4 flex flex-col gap-1">
                <p className="text-white/50 text-xs font-medium uppercase tracking-wider">File Type</p>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-500" />
                  <p className="text-lg font-bold">CSV / JSON</p>
                </div>
              </CardContent>
            </Card>
            <Card className="flex-1 min-w-[140px] bg-[#161b22] border-emerald-900/30">
              <CardContent className="p-4 flex flex-col gap-1">
                <p className="text-white/50 text-xs font-medium uppercase tracking-wider">Total Size</p>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-emerald-500" />
                  <p className="text-lg font-bold">1.24 GB</p>
                </div>
              </CardContent>
            </Card>
            <Card className="flex-1 min-w-[140px] bg-emerald-500/5 border-emerald-500/30">
              <CardContent className="p-4 flex flex-col gap-1">
                <p className="text-white/50 text-xs font-medium uppercase tracking-wider">Health Score</p>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <p className="text-lg font-bold text-emerald-500">98.4%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-6 h-full flex-1 min-h-[600px]">
          {/* Center Stage: Live Preview */}
          <Card className="flex-[2.5] flex flex-col bg-[#161b22] border-emerald-900/30 overflow-hidden relative">
            {/* Tabs */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-900/30 bg-[#0d1117]/40">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`text-sm font-bold flex items-center gap-2 pb-4 -mb-4 border-b-2 transition-colors ${
                    activeTab === "preview" ? "text-emerald-500 border-emerald-500" : "text-white/40 border-transparent hover:text-white"
                  }`}
                >
                  <Eye className="h-4 w-4" /> Live Preview
                </button>
                <button
                  onClick={() => setActiveTab("analysis")}
                  className={`text-sm font-bold flex items-center gap-2 pb-4 -mb-4 border-b-2 transition-colors ${
                    activeTab === "analysis" ? "text-emerald-500 border-emerald-500" : "text-white/40 border-transparent hover:text-white"
                  }`}
                >
                  <BarChart3 className="h-4 w-4" /> Analysis Overlay
                </button>
                <button
                  onClick={() => setActiveTab("schema")}
                  className={`text-sm font-bold flex items-center gap-2 pb-4 -mb-4 border-b-2 transition-colors ${
                    activeTab === "schema" ? "text-emerald-500 border-emerald-500" : "text-white/40 border-transparent hover:text-white"
                  }`}
                >
                  <Code className="h-4 w-4" /> Raw Schema
                </button>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-white/60 hover:bg-white/5">
                  <ZoomIn className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white/60 hover:bg-white/5">
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Scrollable Data Table */}
            <div className="flex-1 overflow-auto relative">
              {/* Scan Line Animation */}
              <div className="scan-line" />
              
              <Table>
                <TableHeader className="sticky top-0 bg-[#161b22] z-10">
                  <TableRow className="border-emerald-900/30">
                    <TableHead className="text-white/70 uppercase text-xs">ID</TableHead>
                    <TableHead className="text-white/70 uppercase text-xs">Timestamp</TableHead>
                    <TableHead className="text-white/70 uppercase text-xs">Lat/Long</TableHead>
                    <TableHead className="text-white/70 uppercase text-xs">Device_ID</TableHead>
                    <TableHead className="text-white/70 uppercase text-xs">Status</TableHead>
                    <TableHead className="text-white/70 uppercase text-xs">Metric_Val</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataRows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      className={`hover:bg-emerald-500/5 transition-colors border-emerald-900/10 ${index % 2 === 1 ? "bg-white/[0.02]" : ""}`}
                    >
                      <TableCell className="font-mono text-emerald-500/80">{row.id}</TableCell>
                      <TableCell className="text-white/60">{row.timestamp}</TableCell>
                      <TableCell className="text-white/60">{row.coordinates}</TableCell>
                      <TableCell className="text-white/60">{row.deviceId}</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20">
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-white/90">{row.metricValue.toFixed(4)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Right Inspector Panel */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Intelligent Metadata */}
            <Card className="bg-[#161b22] border-emerald-900/30">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-bold text-lg">Intelligent Metadata</h3>
                </div>

                <div className="space-y-4">
                  {/* Temporal Accuracy */}
                  <div className="p-4 bg-[#0d1117]/50 rounded-lg border border-emerald-900/20">
                    <p className="text-xs text-white/40 font-bold uppercase mb-2">Temporal Accuracy</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/80">Sync Confidence</span>
                      <span className="text-sm font-mono text-emerald-500">99.2%</span>
                    </div>
                    <Progress value={99.2} className="h-1 mt-2" />
                  </div>

                  {/* Geospatial Data */}
                  <div className="p-4 bg-[#0d1117]/50 rounded-lg border border-emerald-900/20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-white/40 font-bold uppercase">Geospatial Data</p>
                      <MapPin className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-sm font-mono text-white/90 mb-1">Los Angeles, CA</p>
                    <p className="text-xs text-white/40">34.0522° N, 118.2437° W</p>
                    <div className="mt-3 h-24 bg-white/5 rounded-md border border-white/5 flex items-center justify-center">
                      <span className="text-white/20 text-xs">Interactive Map Preview</span>
                    </div>
                  </div>

                  {/* AI Object Tags */}
                  <div className="p-4 bg-[#0d1117]/50 rounded-lg border border-emerald-900/20">
                    <p className="text-xs text-white/40 font-bold uppercase mb-3">AI Object Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {aiTags.map((tag) => (
                        <Badge
                          key={tag.label}
                          className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/10"
                        >
                          {tag.label} ({tag.confidence}%)
                        </Badge>
                      ))}
                      <Badge variant="outline" className="bg-white/5 text-white/40 border-white/10">
                        +12 tags
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pipeline Health Visualizer */}
            <Card className="bg-emerald-500/5 border-emerald-500/20">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                <div className="relative h-24 w-24 flex items-center justify-center">
                  <svg className="h-full w-full transform -rotate-90">
                    <circle
                      className="text-white/5"
                      cx="48"
                      cy="48"
                      fill="transparent"
                      r="44"
                      stroke="currentColor"
                      strokeWidth="8"
                    />
                    <circle
                      className="text-emerald-500"
                      cx="48"
                      cy="48"
                      fill="transparent"
                      r="44"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray="276"
                      strokeDashoffset="5.52"
                    />
                  </svg>
                  <span className="absolute text-xl font-bold">98%</span>
                </div>
                <div>
                  <p className="font-bold">Edge Validation Passed</p>
                  <p className="text-white/50 text-xs">Zero critical schema violations detected</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <footer className="sticky bottom-0 w-full bg-[#0d1117]/90 backdrop-blur-xl border-t border-emerald-900/50 p-6 z-50">
        <div className="max-w-[1600px] mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#161b22] rounded-full border border-emerald-900/30">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="font-bold">Validation Status: Ready for Level 2</p>
              <p className="text-white/40 text-sm">All edge quality gates have been cleared successfully.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="border-emerald-900/50 hover:bg-white/5">
              <RefreshCw className="mr-2 h-4 w-4" />
              Re-validate
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 shadow-[0_0_20px_rgba(255,140,0,0.3)] group">
              Confirm & Push to Regional Hub (Level 2)
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .scan-line {
          background: linear-gradient(to bottom, transparent, rgba(16, 183, 127, 0.2), transparent);
          height: 100px;
          width: 100%;
          position: absolute;
          top: -100px;
          animation: scan 4s linear infinite;
          pointer-events: none;
        }
        @keyframes scan {
          0% {
            top: -100px;
          }
          100% {
            top: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default OverviewPage;