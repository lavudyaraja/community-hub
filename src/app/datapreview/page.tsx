"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { TableView } from "./table-view";
import { RawView } from "./raw-view";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShieldCheck,
  Search,
  Bell,
  Settings,
  ChevronRight,
  Video,
  BarChart4,
  Grid3x3,
  Play,
  Volume2,
  ZoomIn,
  MoreVertical,
  CheckCircle2,
  XCircle,
  BarChart3,
  FileCheck,
  Edit,
  Download,
  Share2,
  AlertTriangle,
  Eye,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Database,
  Calendar,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  Activity,
  Pause,
  SkipForward,
  SkipBack,
  Maximize2,
  Filter,
  RefreshCw,
  Copy,
  ExternalLink,
  Layers,
  Zap,
  Shield,
  Lock,
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

const EnhancedDatasetPreview = () => {
  const [viewMode, setViewMode] = useState<"visual" | "raw" | "table">("visual");
  const [selectedFile, setSelectedFile] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingAudioIndex, setPlayingAudioIndex] = useState<number | null>(null);
  const [previewType, setPreviewType] = useState<"video" | "audio" | "image" | "text">("video");
  const isPlayingRef = useRef(false);

  const dataFiles: DataFile[] = [
    {
      fileName: "SURV_CH01_20231124_143022.mp4",
      format: "Video/H.265",
      size: "1.24 GB",
      checksum: "e3b0c44298fc1c149afb...",
      status: "pass",
      statusMessage: "VERIFIED",
      uploadDate: "2023-11-24",
      modified: "2 hours ago",
    },
    {
      fileName: "AUDIO_REC_ENV_04_AMBIENT.wav",
      format: "Audio/LPCM 48kHz",
      size: "42.8 MB",
      checksum: "f2e87a2110bd5f8a93cd...",
      status: "pass",
      statusMessage: "VERIFIED",
      uploadDate: "2023-11-24",
      modified: "2 hours ago",
    },
    {
      fileName: "IMG_DET_BATCH_09_ARCHIVE.tar",
      format: "Archive/Tar+Gzip",
      size: "894 MB",
      checksum: "88a120015561bc8a72ef...",
      status: "fail",
      statusMessage: "CORRUPTED",
      uploadDate: "2023-11-24",
      modified: "3 hours ago",
    },
    {
      fileName: "METADATA_SENSOR_LOG.json",
      format: "JSON/UTF-8",
      size: "2.4 MB",
      checksum: "7d3f8c2a91e4b5d6f7a8...",
      status: "pass",
      statusMessage: "VERIFIED",
      uploadDate: "2023-11-24",
      modified: "1 hour ago",
    },
    {
      fileName: "THERMAL_SCAN_ZONE_A.tiff",
      format: "Image/TIFF 16-bit",
      size: "156 MB",
      checksum: "9b2c5d4e8f1a3b6c7d9e...",
      status: "warning",
      statusMessage: "LOW RES",
      uploadDate: "2023-11-23",
      modified: "1 day ago",
    },
  ];

  const waveformHeights = Array.from({ length: 60 }, () => Math.floor(Math.random() * 16) + 2);

  // Audio files - easy to add more later
  const audioFiles = [
    {
      name: "Environmental Audio Recording",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      format: "LPCM 48kHz • Stereo • Uncompressed",
      duration: "08:45",
      currentTime: "03:24",
    },
    {
      name: "Communication Channel",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      format: "MP3 44.1kHz • Mono",
      duration: "05:12",
      currentTime: "01:45",
    },
  ];

  // Image files - easy to add more later
  const imageFiles = [
    {
      url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop",
      type: "VEHICLE",
      confidence: "98",
      color: "cyan",
      frame: "001",
    },
    {
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      type: "PERSON",
      confidence: "94",
      color: "yellow",
      frame: "002",
    },
    {
      url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
      type: "WEAPON",
      confidence: "89",
      color: "red",
      frame: "003",
    },
    {
      url: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop",
      type: "VEHICLE",
      confidence: "96",
      color: "cyan",
      frame: "004",
    },
    {
      url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop",
      type: "VEHICLE",
      confidence: "92",
      color: "cyan",
      frame: "005",
    },
    {
      url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=600&fit=crop",
      type: "PERSON",
      confidence: "91",
      color: "yellow",
      frame: "006",
    },
  ];

  const processingMetrics = [
    { label: "Processing Speed", value: "2.4 GB/s", trend: "+12%", status: "up" },
    { label: "Validation Rate", value: "94.2%", trend: "+5%", status: "up" },
    { label: "Error Rate", value: "0.8%", trend: "-2%", status: "down" },
    { label: "Avg File Size", value: "487 MB", trend: "+8%", status: "up" },
  ];

  // Handle audio events to update state
  useEffect(() => {
    const handlers: Array<{ pause: () => void; ended: () => void }> = [];
    
    // Find all audio elements dynamically
    const audioElements: HTMLAudioElement[] = [];
    let index = 0;
    while (true) {
      const audioEl = document.getElementById(`audio-${index}`) as HTMLAudioElement;
      if (!audioEl) break;
      audioElements.push(audioEl);
      index++;
    }

    // Set up event listeners for all audio elements
    audioElements.forEach((audioEl, idx) => {
      const pauseHandler = () => {
        if (playingAudioIndex === idx) {
          setPlayingAudioIndex(null);
          setIsPlaying(false);
        }
      };

      const endedHandler = () => {
        if (playingAudioIndex === idx) {
          setPlayingAudioIndex(null);
          setIsPlaying(false);
        }
      };

      audioEl.addEventListener('pause', pauseHandler);
      audioEl.addEventListener('ended', endedHandler);
      
      handlers.push({ pause: pauseHandler, ended: endedHandler });
    });

    // Cleanup
    return () => {
      audioElements.forEach((audioEl, idx) => {
        if (handlers[idx]) {
          audioEl.removeEventListener('pause', handlers[idx].pause);
          audioEl.removeEventListener('ended', handlers[idx].ended);
        }
      });
    };
  }, [playingAudioIndex]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0e16] text-white">

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 lg:px-8 py-6">
        {/* Enhanced Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <a className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1" href="#">
              <Database className="h-3 w-3" />
              Home
            </a>
            <ChevronRight className="h-4 w-4 text-white/20" />
            <a className="text-cyan-400 hover:text-cyan-300 transition-colors" href="#">
              Regional Datasets
            </a>
            <ChevronRight className="h-4 w-4 text-white/20" />
            <span className="text-white font-semibold">National Surveillance Feed - Zone A</span>
          </div>
          <Badge className="ml-auto bg-green-500/10 text-green-400 border-green-500/20">
            <Activity className="h-3 w-3 mr-1" />
            Live Processing
          </Badge>
        </div>

        {/* Page Header with Actions */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-white bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
                Dataset Inspector
              </h1>
              <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Shield className="h-3 w-3 mr-1" />
                Level 4 Clearance
              </Badge>
            </div>
            <p className="text-white/60 text-sm">Multi-modal intelligence validation and media analysis platform</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-[#141b27] p-1 rounded-lg border border-cyan-500/10">
            <Button
                variant={viewMode === "visual" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("visual")}
                className={viewMode === "visual" ? "bg-cyan-500" : ""}
              >
                <Eye className="h-4 w-4 mr-2" />
                Visual
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className={viewMode === "table" ? "bg-cyan-500" : ""}
              >
                <Database className="h-4 w-4 mr-2" />
                Table
            </Button>
            <Button
                variant={viewMode === "raw" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("raw")}
                className={viewMode === "raw" ? "bg-cyan-500" : ""}
              >
                <FileText className="h-4 w-4 mr-2" />
                Raw
              </Button>
            </div>
            <Button className="bg-cyan-500 shadow-lg shadow-cyan-500/20">
              <Download className="h-4 w-4 mr-2" />
              Export Dataset
            </Button>
          </div>
        </div>

        {/* Processing Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {processingMetrics.map((metric, index) => (
            <Card key={index} className="bg-gradient-to-br from-[#141b27] to-[#0f1419] border-cyan-500/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-white/60 font-medium">{metric.label}</span>
                  <Badge className={`text-[10px] ${metric.status === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    <TrendingUp className={`h-3 w-3 mr-1 ${metric.status === 'down' ? 'rotate-180' : ''}`} />
                    {metric.trend}
                  </Badge>
                </div>
                <p className="text-2xl font-black text-white">{metric.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Content Area */}
          <div className="col-span-12 xl:col-span-9 flex flex-col gap-6">
            {/* Conditional Rendering based on viewMode */}
            {viewMode === "table" ? (
              <TableView dataFiles={dataFiles} onFileSelect={setSelectedFile} />
            ) : viewMode === "raw" ? (
              <RawView dataFiles={dataFiles} />
            ) : (
              <>
            {/* Enhanced Media Preview */}
            <Card className="bg-gradient-to-br from-[#141b27] to-[#0f1419] border-cyan-500/10 overflow-hidden">
              <div className="p-4 border-b border-cyan-500/10 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <Button
                      variant={previewType === "video" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewType("video")}
                      className={previewType === "video" ? "bg-cyan-500 text-white" : "text-white/70"}
                    >
                      <Film className="h-4 w-4 mr-2" />
                      Video
                    </Button>
                    <Button
                      variant={previewType === "audio" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewType("audio")}
                      className={previewType === "audio" ? "bg-cyan-500 text-white" : "text-white/70"}
                    >
                      <Music className="h-4 w-4 mr-2" />
                      Audio
                    </Button>
                    <Button
                      variant={previewType === "image" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewType("image")}
                      className={previewType === "image" ? "bg-cyan-500 text-white" : "text-white/70"}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Images
                    </Button>
                  </div>
                  <div className="h-6 w-px bg-cyan-500/20" />
                  <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                    4K • 60FPS • HDR
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="">
                    <Share2 className="h-4 w-4 text-cyan-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="">
                    <Maximize2 className="h-4 w-4 text-cyan-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="">
                    <MoreVertical className="h-4 w-4 text-cyan-400" />
                  </Button>
                </div>
              </div>

              {previewType === "video" && (
                <div className="relative">
                  <div className="aspect-video relative bg-black">
                    {/* Video Frame */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800">
                      <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6, 182, 212, 0.03) 2px, rgba(6, 182, 212, 0.03) 4px)",
                      }} />
                    </div>
                    
                    {/* Overlay Info */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                      <div className="flex gap-2">
                        <Badge className="bg-black/80 text-white border-cyan-500/30 backdrop-blur-sm">
                          <Clock className="h-3 w-3 mr-1" />
                          14:22:01.034 UTC
                        </Badge>
                        <Badge className="bg-black/80 text-white border-cyan-500/30 backdrop-blur-sm">
                          <MapPin className="h-3 w-3 mr-1" />
                          34.0522° N, 118.2437° W
                        </Badge>
                      </div>
                      <Badge className="bg-red-500/90 text-white w-fit animate-pulse">
                        <div className="h-2 w-2 bg-white rounded-full mr-2" />
                        LIVE REC
                      </Badge>
                    </div>

                    {/* Detection Boxes */}
                    <div className="absolute top-1/3 left-1/4 w-32 h-24 border-2 border-cyan-500 rounded">
                      <div className="absolute -top-6 left-0 bg-cyan-500 text-black px-2 py-0.5 text-[10px] font-bold">
                        VEHICLE • 98%
                      </div>
                      <div className="absolute top-0 left-0 w-2 h-2 bg-cyan-500" />
                      <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-500" />
                      <div className="absolute bottom-0 left-0 w-2 h-2 bg-cyan-500" />
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-cyan-500" />
                    </div>

                    <div className="absolute top-1/2 right-1/3 w-20 h-32 border-2 border-yellow-500 rounded">
                      <div className="absolute -top-6 left-0 bg-yellow-500 text-black px-2 py-0.5 text-[10px] font-bold">
                        PERSON • 94%
                      </div>
                    </div>

                    {/* Video Element */}
                    <video
                      className="absolute inset-0 w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                    </video>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center group">
                      <Button
                        size="icon"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="h-20 w-20 rounded-full bg-cyan-500/90 shadow-2xl shadow-cyan-500/50 transition-all opacity-0 group-hover:opacity-100 z-10"
                      >
                        {isPlaying ? (
                          <Pause className="h-10 w-10" />
                        ) : (
                          <Play className="h-10 w-10 ml-1" />
                        )}
                      </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 w-full">
                      <div className="h-1 bg-white/10">
                        <div className="h-full bg-cyan-500 w-[42%] shadow-lg shadow-cyan-500/50" />
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Video Controls */}
                  <div className="p-4 bg-[#0f1419] border-t border-cyan-500/10">
                    <div className="flex items-center gap-4">
                      <Button size="icon" variant="ghost" className="">
                        <SkipBack className="h-4 w-4 text-cyan-400" />
                      </Button>
                      <Button size="icon" className="bg-cyan-500">
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="">
                        <SkipForward className="h-4 w-4 text-cyan-400" />
                      </Button>
                      <div className="flex-1 flex items-center gap-3">
                        <span className="text-xs text-white/60 font-mono">02:34</span>
                        <Progress value={42} className="h-1.5 flex-1" />
                        <span className="text-xs text-white/60 font-mono">06:12</span>
                      </div>
                      <Button size="icon" variant="ghost" className="">
                        <Volume2 className="h-4 w-4 text-cyan-400" />
                      </Button>
                      <Button size="icon" variant="ghost" className="">
                        <Maximize2 className="h-4 w-4 text-cyan-400" />
                      </Button>
                  </div>
                  </div>
                </div>
              )}

              {previewType === "audio" && (
                <div className="p-6">
                  {audioFiles.map((audio, index) => (
                    <div key={index} className={index > 0 ? "mt-6 pt-6 border-t border-cyan-500/10" : ""}>
                  <div className="mb-4 flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-bold text-white mb-1">{audio.name}</h3>
                          <p className="text-xs text-white/50">{audio.format}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500/10 text-green-400">
                            <Activity className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                          <span className="text-xs text-white/60 font-mono">{audio.currentTime} / {audio.duration}</span>
                        </div>
                  </div>
                      
                      {/* Audio Element */}
                      <audio
                        id={`audio-${index}`}
                        src={audio.url}
                        className="hidden"
                        controls={false}
                        loop
                      />

                      {/* Enhanced Waveform */}
                      <div className="flex items-center gap-0.5 h-32 mb-6 bg-black/20 rounded-lg p-4">
                        {waveformHeights.map((height, idx) => (
                          <div
                            key={idx}
                            className={`flex-1 rounded-full transition-all ${
                              idx < 24 ? "bg-gradient-to-t from-cyan-500 to-blue-500" : "bg-cyan-500/20"
                            }`}
                          style={{ height: `${height * 4}px` }}
                        />
                      ))}
                    </div>

                      {/* Audio Controls */}
                  <div className="flex items-center gap-4">
                        <Button 
                          size="icon" 
                          className="h-10 w-10 rounded-full bg-cyan-500"
                          onClick={async () => {
                            // Prevent rapid clicks
                            if (isPlayingRef.current) return;
                            
                            const audioEl = document.getElementById(`audio-${index}`) as HTMLAudioElement;
                            if (!audioEl) return;

                            // Pause all other audio elements
                            audioFiles.forEach((_, idx) => {
                              if (idx !== index) {
                                const otherAudio = document.getElementById(`audio-${idx}`) as HTMLAudioElement;
                                if (otherAudio) {
                                  otherAudio.pause();
                                  otherAudio.currentTime = 0;
                                }
                              }
                            });

                            try {
                              if (playingAudioIndex === index && !audioEl.paused) {
                                // Pause current audio
                                isPlayingRef.current = true;
                                audioEl.pause();
                                setPlayingAudioIndex(null);
                                setIsPlaying(false);
                                isPlayingRef.current = false;
                              } else {
                                // Play this audio - handle the promise properly
                                isPlayingRef.current = true;
                                const playPromise = audioEl.play();
                                if (playPromise !== undefined) {
                                  await playPromise;
                                  setPlayingAudioIndex(index);
                                  setIsPlaying(true);
                                }
                                isPlayingRef.current = false;
                              }
                            } catch (error) {
                              // Handle play() interruption or other errors gracefully
                              isPlayingRef.current = false;
                              setPlayingAudioIndex(null);
                              setIsPlaying(false);
                            }
                          }}
                        >
                          {playingAudioIndex === index && isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5 ml-0.5" />
                          )}
                    </Button>
                    <div className="flex-1">
                          <Progress value={39} className="h-2" />
                        </div>
                        <Volume2 className="h-5 w-5 text-cyan-400" />
                        <div className="w-20">
                          <Progress value={75} className="h-1.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {previewType === "image" && (
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-white mb-2">Image Preview Gallery</h3>
                    <p className="text-xs text-white/50">Select an image to view details</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imageFiles.map((image, index) => (
                      <div
                        key={index}
                        className="group relative aspect-video rounded-lg overflow-hidden border border-cyan-500/20 hover:border-cyan-500/50 transition-all cursor-pointer"
                      >
                        {/* Actual Image */}
                        <img
                          src={image.url}
                          alt={`Image ${image.frame}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        
                        {/* Detection Box */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 border-2 ${
                          image.color === "cyan" ? "border-cyan-500" : 
                          image.color === "yellow" ? "border-yellow-500" : 
                          "border-red-500"
                        } rounded-sm`}>
                          <Badge className={`absolute -top-5 left-0 ${
                            image.color === "cyan" ? "bg-cyan-500" : 
                            image.color === "yellow" ? "bg-yellow-500" : 
                            "bg-red-500"
                          } text-black text-[10px] font-bold`}>
                            {image.type} [{image.confidence}%]
                          </Badge>
                          {/* Corner Markers */}
                          <div className={`absolute top-0 left-0 w-2 h-2 ${
                            image.color === "cyan" ? "bg-cyan-500" : 
                            image.color === "yellow" ? "bg-yellow-500" : 
                            "bg-red-500"
                          }`} />
                          <div className={`absolute top-0 right-0 w-2 h-2 ${
                            image.color === "cyan" ? "bg-cyan-500" : 
                            image.color === "yellow" ? "bg-yellow-500" : 
                            "bg-red-500"
                          }`} />
                          <div className={`absolute bottom-0 left-0 w-2 h-2 ${
                            image.color === "cyan" ? "bg-cyan-500" : 
                            image.color === "yellow" ? "bg-yellow-500" : 
                            "bg-red-500"
                          }`} />
                          <div className={`absolute bottom-0 right-0 w-2 h-2 ${
                            image.color === "cyan" ? "bg-cyan-500" : 
                            image.color === "yellow" ? "bg-yellow-500" : 
                            "bg-red-500"
                          }`} />
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-2 z-10">
                          <ZoomIn className="h-8 w-8 text-white" />
                          <span className="text-xs text-white font-medium">Frame #{image.frame}</span>
            </div>

                        {/* Frame Number */}
                        <div className="absolute bottom-2 right-2 z-10">
                          <Badge className="bg-black/80 text-white text-[10px] border-cyan-500/30">
                            #{image.frame}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Image Detection Grid */}
            <Card className="bg-gradient-to-br from-[#141b27] to-[#0f1419] border-cyan-500/10">
              <div className="p-4 border-b border-cyan-500/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Grid3x3 className="h-5 w-5 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Object Detection Gallery</h3>
                    <p className="text-xs text-white/50">AI-powered frame analysis</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="">
                    <Filter className="h-4 w-4 mr-2 text-cyan-400" />
                    Filter
                  </Button>
                  <Button variant="link" className="text-xs text-cyan-400 font-bold p-0 h-auto">
                    View All 128 Frames →
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imageFiles.slice(0, 4).map((item, index) => (
                    <div
                      key={index}
                      className="group relative aspect-video rounded-lg overflow-hidden border border-cyan-500/20 hover:border-cyan-500/50 transition-all cursor-pointer"
                    >
                      {/* Actual Image */}
                      <img
                        src={item.url}
                        alt={`Frame ${item.frame}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      
                      {/* Detection Box */}
                      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 border-2 ${
                        item.color === "cyan" ? "border-cyan-500" : 
                        item.color === "yellow" ? "border-yellow-500" : 
                        "border-red-500"
                      } rounded-sm`}>
                        <Badge className={`absolute -top-5 left-0 ${
                          item.color === "cyan" ? "bg-cyan-500" : 
                          item.color === "yellow" ? "bg-yellow-500" : 
                          "bg-red-500"
                        } text-black text-[10px] font-bold`}>
                          {item.type} [{item.confidence}%]
                        </Badge>
                        {/* Corner Markers */}
                        <div className={`absolute top-0 left-0 w-2 h-2 ${
                          item.color === "cyan" ? "bg-cyan-500" : 
                          item.color === "yellow" ? "bg-yellow-500" : 
                          "bg-red-500"
                        }`} />
                        <div className={`absolute top-0 right-0 w-2 h-2 ${
                          item.color === "cyan" ? "bg-cyan-500" : 
                          item.color === "yellow" ? "bg-yellow-500" : 
                          "bg-red-500"
                        }`} />
                        <div className={`absolute bottom-0 left-0 w-2 h-2 ${
                          item.color === "cyan" ? "bg-cyan-500" : 
                          item.color === "yellow" ? "bg-yellow-500" : 
                          "bg-red-500"
                        }`} />
                        <div className={`absolute bottom-0 right-0 w-2 h-2 ${
                          item.color === "cyan" ? "bg-cyan-500" : 
                          item.color === "yellow" ? "bg-yellow-500" : 
                          "bg-red-500"
                        }`} />
                        </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-2 z-10">
                        <ZoomIn className="h-8 w-8 text-white" />
                        <span className="text-xs text-white font-medium">Frame #{item.frame}</span>
                      </div>

                      {/* Frame Number */}
                      <div className="absolute bottom-2 right-2 z-10">
                        <Badge className="bg-black/80 text-white text-[10px] border-cyan-500/30">
                          #{item.frame}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Data Integrity Table */}
            <Card className="bg-gradient-to-br from-[#141b27] to-[#0f1419] border-cyan-500/10 overflow-hidden">
              <div className="p-4 border-b border-cyan-500/10 bg-black/20 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="h-5 w-5 text-cyan-400" />
                    Data Integrity Report
                  </h3>
                  <p className="text-xs text-white/50 mt-1">Level 1 Validation • Real-time Monitoring</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-xs text-white/70">42 Passed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span className="text-xs text-white/70">1 Warning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-xs text-white/70">2 Failed</span>
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
                      <TableHead className="text-cyan-400 text-xs font-bold uppercase">Modified</TableHead>
                      <TableHead className="text-cyan-400 text-xs font-bold uppercase">Status</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataFiles.map((file, index) => (
                      <TableRow 
                        key={index} 
                        className="border-cyan-500/10 hover:bg-cyan-500/5 cursor-pointer transition-colors"
                        onClick={() => setSelectedFile(index)}
                      >
                        <TableCell className="font-mono text-xs text-white font-medium max-w-xs truncate">
                          {file.fileName}
                        </TableCell>
                        <TableCell className="text-white/70 text-xs">{file.format}</TableCell>
                        <TableCell className="text-white text-xs font-medium">{file.size}</TableCell>
                        <TableCell className="font-mono text-[10px] text-white/50">
                          {file.checksum}
                        </TableCell>
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
                <span className="text-xs text-white/50">Showing 5 of 45 files</span>
                <Button variant="ghost" className="text-xs font-bold text-cyan-400">
                  Load More Rows
                </Button>
              </div>
            </Card>
              </>
            )}
          </div>

          {/* Enhanced Right Sidebar */}
          <div className="col-span-12 xl:col-span-3 flex flex-col gap-6">
            {/* Quality Analytics */}
            <Card className="bg-gradient-to-br from-[#141b27] to-[#0f1419] border-cyan-500/10 sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-cyan-400" />
                    Quality Score
                </h3>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                    <Zap className="h-3 w-3 mr-1" />
                    Excellent
                  </Badge>
                </div>

                {/* Enhanced Circular Progress */}
                <div className="flex flex-col items-center justify-center mb-8 relative">
                  <svg className="h-40 w-40 -rotate-90">
                    <circle
                      className="text-cyan-500/10"
                      cx="80"
                      cy="80"
                      fill="transparent"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="12"
                    />
                    <circle
                      className="text-cyan-500"
                      cx="80"
                      cy="80"
                      fill="transparent"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeDasharray="440"
                      strokeDashoffset="26.4"
                      strokeLinecap="round"
                      style={{
                        filter: "drop-shadow(0 0 8px rgba(6, 182, 212, 0.5))",
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white">94</span>
                    <span className="text-xl font-black text-cyan-400">%</span>
                    <span className="text-[10px] uppercase font-bold text-white/50 mt-1">Integrity</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8 pb-6 border-b border-cyan-500/10">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/60">Total Files</span>
                    <span className="font-bold text-white">45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/60">Dataset Size</span>
                    <span className="font-bold text-white">2.14 GB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/60">Processing Time</span>
                    <span className="font-bold text-green-400">12ms avg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/60">Anomalies</span>
                    <span className="font-bold text-red-400">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/60">Last Validated</span>
                    <span className="font-bold text-white/80">2 min ago</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 h-12 shadow-lg shadow-cyan-500/20">
                    <FileCheck className="mr-2 h-5 w-5" />
                    Authorize Transfer
                  </Button>
                  <Button variant="secondary" className="w-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 h-12">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Metadata
                  </Button>
                  <Button variant="outline" className="w-full border-cyan-500/20 h-12">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>

                <p className="text-[10px] text-center text-white/40 italic mt-6 p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/10">
                  <Lock className="h-3 w-3 inline mr-1" />
                  Level 4 clearance required for hub transfer
                </p>
              </CardContent>
            </Card>

            {/* Dataset Properties */}
            <Card className="bg-gradient-to-br from-[#141b27] to-[#0f1419] border-cyan-500/10">
              <CardContent className="p-6">
                <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-cyan-400 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Dataset Properties
                </h3>
                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] font-bold text-white/50 uppercase mb-1.5">Origin Source</p>
                    <p className="text-sm text-white font-medium">Edge Cluster Alpha-09</p>
                    <p className="text-xs text-white/40 mt-0.5">Primary node • West Region</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/50 uppercase mb-1.5">Ingestion Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-cyan-400" />
                      <p className="text-sm text-white">Nov 24, 2023</p>
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">14:45:32 GMT</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/50 uppercase mb-1.5">Security Classification</p>
                    <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                      <Shield className="h-3 w-3 mr-1" />
                      TOP SECRET // TS/SCI
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/50 uppercase mb-1.5">Access Level</p>
                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                      Level 4 • Restricted
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/50 uppercase mb-1.5">Retention Policy</p>
                    <p className="text-sm text-white">90 days • Auto-archive</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processing History */}
            <Card className="bg-gradient-to-br from-[#141b27] to-[#0f1419] border-cyan-500/10">
              <CardContent className="p-6">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4 text-cyan-400">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {[
                    { action: "Validation completed", time: "2 min ago", status: "success" },
                    { action: "Metadata updated", time: "15 min ago", status: "info" },
                    { action: "Failed integrity check", time: "1 hour ago", status: "error" },
                    { action: "Dataset uploaded", time: "2 hours ago", status: "success" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 text-xs">
                      <div className={`h-2 w-2 rounded-full mt-1.5 ${
                        item.status === 'success' ? 'bg-green-500' :
                        item.status === 'error' ? 'bg-red-500' : 'bg-cyan-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.action}</p>
                        <p className="text-white/50 text-[10px]">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EnhancedDatasetPreview;