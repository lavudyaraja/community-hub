import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Eye, 
  BarChart3, 
  History, 
  Settings, 
  Download, 
  Share2, 
  ZoomIn, 
  ZoomOut, 
  Undo, 
  Redo, 
  Crop, 
  Layers, 
  AlertTriangle, 
  Info, 
  Package, 
  CheckCircle2, 
  XCircle, 
  Keyboard, 
  Bell, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  Play,
  Pause,
  SkipForward,
  Filter,
  Search,
  RotateCcw,
  Maximize2,
  Grid3x3
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ReviewStatus = 'pending' | 'approved' | 'rejected';
type FlagSeverity = 'critical' | 'warning' | 'info';

interface AIFlag {
  id: string;
  severity: FlagSeverity;
  title: string;
  description: string;
  confidence: number;
  position: [number, number];
}

interface DataItem {
  id: string;
  name: string;
  status: ReviewStatus;
  imageUrl: string;
  flags: AIFlag[];
  metadata: {
    resolution: string;
    sensor: string;
    timestamp: string;
  };
}

const ManualValidation: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTab, setSelectedTab] = useState('flags');
  const [filterStatus, setFilterStatus] = useState<ReviewStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGrid, setShowGrid] = useState(false);
  const [history, setHistory] = useState<Array<{ id: string; action: string; timestamp: Date }>>([]);

  // Mock data
  const [dataItems] = useState<DataItem[]>([
    {
      id: 'SCAN_8842_A',
      name: 'SCAN_8842_A.tiff',
      status: 'pending',
      imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
      flags: [
        {
          id: 'flag1',
          severity: 'critical',
          title: 'Unidentified Object',
          description: 'Model unable to classify cluster at [580, 320]. Overlapping bounding box detected.',
          confidence: 42,
          position: [580, 320]
        },
        {
          id: 'flag2',
          severity: 'warning',
          title: 'Blur Detected',
          description: 'Central region [400, 400] exceeds motion blur threshold of 0.15.',
          confidence: 68,
          position: [400, 400]
        }
      ],
      metadata: {
        resolution: '3840 x 2160 px',
        sensor: 'DR-900X',
        timestamp: '2024-01-15T10:30:00Z'
      }
    },
    {
      id: 'SCAN_8843_B',
      name: 'SCAN_8843_B.tiff',
      status: 'approved',
      imageUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800',
      flags: [],
      metadata: {
        resolution: '3840 x 2160 px',
        sensor: 'DR-900X',
        timestamp: '2024-01-15T10:31:00Z'
      }
    },
    {
      id: 'SCAN_8844_C',
      name: 'SCAN_8844_C.tiff',
      status: 'rejected',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
      flags: [],
      metadata: {
        resolution: '3840 x 2160 px',
        sensor: 'DR-900X',
        timestamp: '2024-01-15T10:32:00Z'
      }
    }
  ]);

  const currentItem = dataItems[currentIndex];
  const stats = {
    approved: dataItems.filter(i => i.status === 'approved').length,
    rejected: dataItems.filter(i => i.status === 'rejected').length,
    pending: dataItems.filter(i => i.status === 'pending').length,
    total: dataItems.length
  };

  const filteredItems = dataItems.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const addToHistory = (action: string) => {
    setHistory(prev => [...prev, { id: currentItem.id, action, timestamp: new Date() }]);
  };

  const handleApprove = () => {
    addToHistory('Approved');
    goToNext();
  };

  const handleReject = () => {
    addToHistory(`Rejected: ${rejectionReason || 'No reason provided'}`);
    setRejectionReason('');
    goToNext();
  };

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(dataItems.length - 1, prev + 1));
  }, [dataItems.length]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(200, prev + 25));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(50, prev - 25));
  const resetZoom = () => setZoomLevel(100);

  const toggleAutoPlay = () => setIsPlaying(!isPlaying);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= dataItems.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, dataItems.length]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'a' || e.key === 'A') handleApprove();
      if (e.key === 'r' || e.key === 'R') handleReject();
      if (e.key === '+') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') resetZoom();
      if (e.key === ' ') {
        e.preventDefault();
        toggleAutoPlay();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToPrevious, goToNext, rejectionReason]);

  const getSeverityColor = (severity: FlagSeverity) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
    }
  };

  const getStatusColor = (status: ReviewStatus) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#0b0f17]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-3 bg-white dark:bg-[#101722]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 flex items-center justify-center rounded-lg">
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-slate-900 dark:text-white text-lg font-bold">
              National Intel <span className="text-blue-500 font-light">L1-Review</span>
            </h2>
          </div>
          <nav className="hidden lg:flex items-center gap-6 border-l border-slate-700 ml-2 pl-6">
            <a className="text-blue-500 text-sm font-semibold" href="#">Inspection</a>
            <a className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-white transition-colors" href="#">Batch Stats</a>
            <a className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-white transition-colors" href="#">Quality Control</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest text-slate-500">Global Progress</span>
              <span className="text-xs font-bold text-blue-500">
                {Math.round(((stats.approved + stats.rejected) / stats.total) * 100)}%
              </span>
            </div>
            <Progress value={((stats.approved + stats.rejected) / stats.total) * 100} className="w-48 h-1.5" />
          </div>
          <Button variant="ghost" size="icon">
            <Keyboard className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-blue-500" />
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-16 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-6 gap-6 bg-white dark:bg-[#101722]">
          <Button variant="ghost" size="icon" className="text-blue-500 bg-blue-500/10">
            <Eye className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <BarChart3 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <History className="w-5 h-5" />
          </Button>
          <div className="mt-auto">
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumbs */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <a className="text-slate-400 hover:text-blue-500 transition-colors" href="#">Datasets</a>
              <span className="text-slate-600">/</span>
              <a className="text-slate-400 hover:text-blue-500 transition-colors" href="#">Batch_2024_Delta</a>
              <span className="text-slate-600">/</span>
              <span className="text-slate-900 dark:text-white font-bold">{currentItem.name}</span>
              <Badge variant={currentItem.status === 'pending' ? 'outline' : 'secondary'} className="ml-2">
                {currentItem.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <Input 
                  placeholder="Search items..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48"
                />
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as ReviewStatus | 'all')}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
          </div>

          {/* Media Viewer */}
          <div className="flex-1 px-6 pb-6 flex flex-col min-h-0">
            <div className="flex-1 bg-black rounded-xl relative overflow-hidden group">
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src={currentItem.imageUrl} 
                  alt={currentItem.name}
                  className="w-full h-full object-contain"
                  style={{ transform: `scale(${zoomLevel / 100})` }}
                />
                {showGrid && (
                  <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 pointer-events-none">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div key={i} className="border border-white/10" />
                    ))}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-white text-sm font-mono">{zoomLevel}%</span>
                <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={resetZoom}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-4" />
                <Button variant="ghost" size="icon">
                  <Undo className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Redo className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-4" />
                <Button variant="ghost" size="icon">
                  <Crop className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Layers className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowGrid(!showGrid)}>
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Metadata Overlay */}
              <div className="absolute top-6 left-6 flex flex-col gap-1">
                <span className="text-xs text-white/50 uppercase tracking-widest font-bold">Metadata</span>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-black/50 backdrop-blur">
                    {currentItem.metadata.resolution}
                  </Badge>
                  <Badge variant="secondary" className="bg-black/50 backdrop-blur">
                    {currentItem.metadata.sensor}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Filmstrip */}
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Dataset Sequence ({currentIndex + 1} / {dataItems.length})
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleAutoPlay}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isPlaying ? 'Pause' : 'Auto Play'}
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-xs text-slate-400">{stats.approved} Approved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-xs text-slate-400">{stats.rejected} Rejected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-xs text-slate-400">{stats.pending} Pending</span>
                  </div>
                </div>
              </div>
              <ScrollArea className="w-full">
                <div className="flex gap-3 pb-2">
                  {filteredItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`relative min-w-32 h-20 rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                        currentIndex === dataItems.findIndex(d => d.id === item.id)
                          ? 'border-blue-500 ring-4 ring-blue-500/20'
                          : 'border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                      onClick={() => setCurrentIndex(dataItems.findIndex(d => d.id === item.id))}
                    >
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      <div className={`absolute top-1 right-1 w-2 h-2 ${getStatusColor(item.status)} rounded-full border border-black`} />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </section>

        {/* Inspector Panel */}
        <aside className="w-80 border-l border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-[#101722]">
          <ScrollArea className="flex-1 p-6">
            <div className="mb-6">
              <h3 className="text-white text-lg font-bold mb-1">Inspector Panel</h3>
              <p className="text-slate-400 text-xs font-mono">{currentItem.name}</p>
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="flags" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Flags ({currentItem.flags.length})
                </TabsTrigger>
                <TabsTrigger value="metadata" className="text-xs">
                  <Info className="w-3 h-3 mr-1" />
                  Data
                </TabsTrigger>
                <TabsTrigger value="history" className="text-xs">
                  <History className="w-3 h-3 mr-1" />
                  Log
                </TabsTrigger>
              </TabsList>

              <TabsContent value="flags" className="space-y-4 mt-4">
                {currentItem.flags.length === 0 ? (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>No flags detected for this item.</AlertDescription>
                  </Alert>
                ) : (
                  currentItem.flags.map(flag => (
                    <Card key={flag.id} className={`${
                      flag.severity === 'critical' ? 'border-red-500/20 bg-red-500/5' : 'border-yellow-500/20 bg-yellow-500/5'
                    }`}>
                      <CardHeader className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant={getSeverityColor(flag.severity)} className="text-xs">
                            {flag.severity}
                          </Badge>
                          <span className="text-xs font-bold">{flag.confidence}% Conf.</span>
                        </div>
                        <CardTitle className="text-sm">{flag.title}</CardTitle>
                        <CardDescription className="text-xs">{flag.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">Ignore</Button>
                          <Button variant="default" size="sm" className="flex-1">Override</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="metadata" className="space-y-3 mt-4">
                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">Technical Details</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Resolution:</span>
                      <span className="font-mono">{currentItem.metadata.resolution}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sensor:</span>
                      <span className="font-mono">{currentItem.metadata.sensor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Timestamp:</span>
                      <span className="font-mono">{new Date(currentItem.metadata.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">File ID:</span>
                      <span className="font-mono">{currentItem.id}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {history.length === 0 ? (
                      <p className="text-sm text-slate-400">No actions recorded yet.</p>
                    ) : (
                      history.slice().reverse().map((entry, idx) => (
                        <Card key={idx} className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-mono text-slate-400">{entry.id}</p>
                              <p className="text-sm font-medium">{entry.action}</p>
                            </div>
                            <span className="text-xs text-slate-500">
                              {entry.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </ScrollArea>

          {/* Decision Console */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a2332]">
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Rejection Reason (Optional)
              </label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Data corruption, Incorrect bounding box..."
                className="min-h-[80px] resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={handleReject}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
                <kbd className="ml-2 text-xs opacity-60">[R]</kbd>
              </Button>
              <Button 
                className="flex-[1.5] bg-blue-500 hover:bg-blue-600"
                onClick={handleApprove}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve
                <kbd className="ml-2 text-xs opacity-60">[A]</kbd>
              </Button>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={goToPrevious} disabled={currentIndex === 0}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setCurrentIndex(Math.floor(Math.random() * dataItems.length))}>
                <SkipForward className="w-4 h-4" />
                Random
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={goToNext} disabled={currentIndex === dataItems.length - 1}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </aside>
      </main>

      {/* Hotkey Hint */}
      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 bg-black/60 backdrop-blur border border-white/10 rounded-full pointer-events-none">
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-xs text-white">←</kbd>
          <span className="text-xs text-white/60">Prev</span>
        </div>
        <Separator orientation="vertical" className="h-3" />
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-xs text-white">→</kbd>
          <span className="text-xs text-white/60">Next</span>
        </div>
        <Separator orientation="vertical" className="h-3" />
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-xs text-white">Space</kbd>
          <span className="text-xs text-white/60">Auto</span>
        </div>
        <Separator orientation="vertical" className="h-3" />
        <div className="flex items-center gap-1.5 text-blue-500">
          <Zap className="w-4 h-4" />
          <span className="text-xs font-bold">Expert Mode Active</span>
        </div>
      </div>
    </div>
  );
};

export default ManualValidation;