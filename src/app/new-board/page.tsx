"use client";

import React from 'react';
import { Bell, Search, Network, FileText, RocketIcon, Image, Video, AudioLines, Settings, CheckCircle, RefreshCw, Filter, BarChart3, ChevronDown, ArrowRight, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#101722] font-['Space_Grotesk'] text-slate-900 dark:text-slate-100">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#101722] px-10 py-3">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 text-blue-500">
            <Network className="h-6 w-6" />
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              National Data Intelligence
            </h2>
          </div>
          <nav className="flex items-center gap-9">
            <a className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-white transition-colors" href="#">
              Dashboard
            </a>
            <a className="text-sm font-medium text-blue-500 dark:text-white" href="#">
              Ingestion
            </a>
            <a className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-white transition-colors" href="#">
              Regional Hubs
            </a>
            <a className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-white transition-colors" href="#">
              Settings
            </a>
          </nav>
        </div>
        <div className="flex flex-1 justify-end gap-8 items-center">
          <div className="relative flex w-64 items-center">
            <Search className="absolute left-3 h-4 w-4 text-slate-400" />
            <Input
              className="pl-10 bg-white dark:bg-[#182334] border-slate-200 dark:border-slate-700"
              placeholder="Search data points..."
            />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="relative bg-slate-100 dark:bg-[#223149]">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
          </div>
          <div className="h-10 w-10 rounded-full ring-2 ring-blue-500/20 bg-gradient-to-br from-blue-500 to-purple-500"></div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-8 pb-24">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 mb-6 text-sm">
          <a className="font-medium text-slate-500 dark:text-slate-400 hover:text-blue-500" href="#">
            Ingestion
          </a>
          <span className="text-slate-400">/</span>
          <a className="font-medium text-slate-500 dark:text-slate-400 hover:text-blue-500" href="#">
            Level 1 Validation
          </a>
          <span className="text-slate-400">/</span>
          <span className="font-medium text-slate-900 dark:text-white">Edge Node 04 Processing</span>
        </div>

        {/* Page Heading */}
        <div className="flex flex-wrap justify-between items-end gap-3 mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Level 1 Unified Validation Hub
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400">
              Active Ingestion Flow: Edge-Node-04 Automated Scanning
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="bg-slate-100 dark:bg-[#223149]">
              <FileText className="mr-2 h-4 w-4" />
              Live Manifest
            </Button>
            <Button disabled className="opacity-50">
              <RocketIcon className="mr-2 h-4 w-4" />
              Transfer to Regional Hub (Level 2)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* LEFT COLUMN */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* Dataset Overview */}
            <div className="bg-white dark:bg-[#182334] rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-blue-500 text-xs font-bold tracking-widest uppercase mb-4">
                Ingestion Source
              </p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 aspect-video rounded-lg mb-4 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col items-center gap-2 opacity-50">
                  <Image className="h-10 w-10" />
                  <span className="text-xs">Batch Preview Locked</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Multi-media Batch #882
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Target: National Grid Alpha
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-400">Total Files</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">24</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-400">Total Size</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">1.2 GB</p>
                  </div>
                </div>
                <div className="space-y-2 pt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Image className="h-4 w-4" /> Images
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">12 Files</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Video className="h-4 w-4" /> Videos
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">8 Files</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <AudioLines className="h-4 w-4" /> Audio
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">4 Files</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Edge Hub Status */}
            <div className="bg-white dark:bg-[#182334] rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                <Settings className="h-5 w-5 text-blue-500" /> Edge Hub Status
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      Edge-Node-04
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Uptime: 142h 12m
                    </span>
                  </div>
                </div>
                <Progress value={68} className="h-1.5" />
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                  Memory Load: 68%
                </p>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Validation Gate Animation */}
              <div className="bg-white dark:bg-[#182334] rounded-xl p-8 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none"></div>
                <div className="relative flex items-center justify-center mb-6">
                  <div className="absolute h-44 w-44 rounded-full border-4 border-transparent border-t-amber-500 border-r-amber-500 animate-spin"></div>
                  <div className="relative z-10 h-32 w-32 rounded-full border-4 border-slate-100 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-[#101722] shadow-inner">
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-black text-amber-500">74%</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Validated</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
                    Active Edge Scanning
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Packet-level validation running on Edge-Node-04 local processing cluster.
                  </p>
                </div>
              </div>

              {/* Process Checklist */}
              <div className="bg-white dark:bg-[#182334] rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-bold mb-6 border-b border-slate-200 dark:border-slate-800 pb-2 uppercase tracking-widest text-slate-900 dark:text-white">
                  Pipeline Status
                </h4>
                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          1. Format Integrity Check
                        </span>
                        <Badge variant="outline" className="text-green-500 border-green-500">
                          Complete
                        </Badge>
                      </div>
                      <Progress value={100} className="h-1 bg-slate-100 dark:bg-slate-800" />
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          2. Anomaly Detection
                        </span>
                        <Badge variant="outline" className="text-amber-500 border-amber-500 animate-pulse">
                          Running
                        </Badge>
                      </div>
                      <Progress value={67} className="h-1 bg-slate-100 dark:bg-slate-800" />
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-center gap-4 opacity-50">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-400">
                      <Filter className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          3. Deduplication
                        </span>
                        <Badge variant="outline" className="text-slate-500 border-slate-500">
                          Pending
                        </Badge>
                      </div>
                      <Progress value={0} className="h-1 bg-slate-100 dark:bg-slate-800" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Packet Inspector Table */}
            <div className="bg-white dark:bg-[#182334] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                    Packet Inspector
                  </h3>
                </div>
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
                  Scanning 14/24
                </Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-[#223149]/50">
                    <TableHead className="text-[11px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
                      File Identifier
                    </TableHead>
                    <TableHead className="text-[11px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
                      Format
                    </TableHead>
                    <TableHead className="text-[11px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
                      Size
                    </TableHead>
                    <TableHead className="text-[11px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
                      Metadata Hash
                    </TableHead>
                    <TableHead className="text-[11px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-300">
                      IMG_2023_0912_01.raw
                    </TableCell>
                    <TableCell>RAW IMAGE</TableCell>
                    <TableCell>42.5 MB</TableCell>
                    <TableCell className="font-mono text-[10px] opacity-40">0x8F22...E42</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1.5"></span>
                        APPROVED
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-300">
                      VID_2023_SEQ_04.mp4
                    </TableCell>
                    <TableCell>MPEG-4</TableCell>
                    <TableCell>412.1 MB</TableCell>
                    <TableCell className="font-mono text-[10px] opacity-40">0x4D11...A19</TableCell>
                    <TableCell>
                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                        VALIDATING...
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 bg-red-500/5">
                    <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-300">
                      SND_LOG_002.wav
                    </TableCell>
                    <TableCell>WAV AUDIO</TableCell>
                    <TableCell>12.8 MB</TableCell>
                    <TableCell className="font-mono text-[10px] opacity-40">0x2A99...B22</TableCell>
                    <TableCell>
                      <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5"></span>
                        REJECTED
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-300">
                      IMG_2023_0912_05.raw
                    </TableCell>
                    <TableCell>RAW IMAGE</TableCell>
                    <TableCell>38.2 MB</TableCell>
                    <TableCell className="font-mono text-[10px] opacity-40">0xCC21...F12</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1.5"></span>
                        APPROVED
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-300">
                      VID_2023_SEQ_05.mp4
                    </TableCell>
                    <TableCell>MPEG-4</TableCell>
                    <TableCell>289.0 MB</TableCell>
                    <TableCell className="font-mono text-[10px] opacity-40">0xEF44...C82</TableCell>
                    <TableCell>
                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                        VALIDATING...
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="p-4 bg-slate-50 dark:bg-[#101722] border-t border-slate-200 dark:border-slate-800 flex justify-center">
                <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest hover:text-blue-500">
                  View Full Packet Log <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#182334] border-t border-slate-200 dark:border-slate-800 px-10 py-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold tracking-widest">
              Process Momentum
            </span>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 dark:text-white">1.2 TB / s</span>
              <span className="text-xs font-bold text-green-500">Stable</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold tracking-widest">
              Encryption
            </span>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 dark:text-white">AES-256-GCM</span>
              <Shield className="h-4 w-4 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Ready for Regional Hub?
            </p>
            <p className="text-[10px] font-bold uppercase text-red-400">
              Validation Required: 10 remaining
            </p>
          </div>
          <Button disabled className="min-w-[200px] opacity-50" size="lg">
            <ArrowRight className="mr-2 h-4 w-4" />
            TRANSFER TO HUB (L2)
          </Button>
        </div>
      </footer>
    </div>
  );
}