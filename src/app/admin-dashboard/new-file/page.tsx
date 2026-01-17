"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdminSidebar } from '../components/sidebar';
import { getCurrentAdmin, isAdminAuthenticated } from '@/lib/auth';
import { 
  Shield, 
  Brain, 
  UserSearch, 
  FlaskConical, 
  BarChart3, 
  Search, 
  Bell, 
  Settings, 
  ChevronRight, 
  CheckCircle2, 
  Play, 
  Rocket, 
  AlertTriangle,
  TrendingUp,
  Filter,
  Maximize2,
  Download,
  Upload,
  RefreshCw,
  X,
  Eye,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Types
interface DataFile {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video' | 'document';
  status: 'scanning' | 'anomaly' | 'queued' | 'approved' | 'rejected';
  matchScore?: number;
  anomalyType?: string;
  duration?: string;
  codec?: string;
  thumbnail: string;
}

interface Metrics {
  nodeStatus: number;
  activeNodes: number;
  latency: number;
  anomalies: number;
  consistencyScore: number;
  scoreChange: number;
}

// Main Component
function ValidationHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('submissionId');
  const [admin, setAdmin] = useState<any>(null);
  
  const [validationStrategy, setValidationStrategy] = useState<'automated' | 'manual'>('automated');
  const [isValidatingSubmission, setIsValidatingSubmission] = useState(false);
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [showValidationMode, setShowValidationMode] = useState(false);
  const [dataFiles, setDataFiles] = useState<DataFile[]>([]);

  const [metrics, setMetrics] = useState<Metrics>({
    nodeStatus: 100,
    activeNodes: 8,
    latency: 124,
    anomalies: 3,
    consistencyScore: 98.4,
    scoreChange: 0.2
  });

  const [logs, setLogs] = useState([
    { time: '14:22:10', message: 'Initializing node-cluster-alpha...', type: 'info' },
    { time: '14:22:12', message: 'Scanning satellite_ingest_001.jpg', type: 'info' },
    { time: '14:22:15', message: 'WARNING: Audio freq spike in beta.wav', type: 'warning' },
    { time: '14:22:18', message: 'Waiting for operator review...', type: 'info' }
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DataFile | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'audio' | 'video' | 'document'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Check admin authentication
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/auth/admin-auth/login');
      return;
    }

    const currentAdmin = getCurrentAdmin();
    if (!currentAdmin) {
      router.push('/auth/admin-auth/login');
      return;
    }

    setAdmin(currentAdmin);
  }, [router]);

  // Load submission data if submissionId is present
  useEffect(() => {
    if (submissionId) {
      loadSubmissionData();
      setShowValidationMode(true);
    }
  }, [submissionId]);

  const loadSubmissionData = async () => {
    if (!submissionId) return;
    
    try {
      const response = await fetch(`/api/submissions/${submissionId}`);
      if (response.ok) {
        const data = await response.json();
        setSubmissionData(data);
        
        // Convert submission to DataFile format and add to dataFiles
        const fileData: DataFile = {
          id: data.id,
          name: data.file_name || data.fileName || 'Unknown',
          type: data.file_type || data.fileType || 'document',
          status: 'scanning',
          thumbnail: data.preview || '',
        };
        
        setDataFiles([fileData]);
      } else {
        toast.error('Failed to load submission data');
      }
    } catch (error) {
      console.error('Error loading submission:', error);
      toast.error('Error loading submission data');
    }
  };

  const handleValidationModeSelect = async (mode: 'automated' | 'manual') => {
    if (!submissionId || !submissionData) return;
    
    setIsValidatingSubmission(true);
    setValidationStrategy(mode);
    
    try {
      // For automated validation, call the API directly
      if (mode === 'automated') {
        const response = await fetch(`/api/submissions/${submissionId}/validate`, {
          method: 'POST',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to validate submission');
        }
        
        toast.success('Submission validated successfully (Automated)');
        router.push('/admin-dashboard/pending-submissions');
      } else {
        // For manual validation, show the file in the sandbox for review
        toast.info('Manual validation mode activated. Review the file below.');
        setShowValidationMode(false);
      }
    } catch (error: any) {
      console.error('Error validating submission:', error);
      toast.error(error.message || 'Failed to validate submission');
    } finally {
      setIsValidatingSubmission(false);
    }
  };

  const handleManualValidation = async () => {
    if (!submissionId) return;
    
    try {
      const response = await fetch(`/api/submissions/${submissionId}/validate`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to validate submission');
      }
      
      toast.success('Submission validated successfully (Manual)');
      router.push('/admin-dashboard/pending-submissions');
    } catch (error: any) {
      console.error('Error validating submission:', error);
      toast.error(error.message || 'Failed to validate submission');
    }
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = new Date().toLocaleTimeString('en-US', { hour12: false });
      const messages = [
        'Processing validation queue...',
        'Analyzing metadata consistency...',
        'Cross-referencing with regional nodes...',
        'Compression ratio verified',
        'Duplicate check completed'
      ];
      
      setLogs(prev => [...prev.slice(-3), {
        time: newTime,
        message: messages[Math.floor(Math.random() * messages.length)],
        type: Math.random() > 0.8 ? 'warning' : 'info'
      }]);

      // Simulate metric changes
      setMetrics(prev => ({
        ...prev,
        latency: Math.floor(110 + Math.random() * 30),
        consistencyScore: +(98 + Math.random() * 1.5).toFixed(1)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleFileAction = (fileId: string, action: 'approve' | 'reject') => {
    setDataFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, status: action === 'approve' ? 'approved' : 'rejected' } : file
    ));
    
    const file = dataFiles.find(f => f.id === fileId);
    const newTime = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, {
      time: newTime,
      message: `File ${file?.name} ${action === 'approve' ? 'APPROVED' : 'REJECTED'}`,
      type: action === 'approve' ? 'info' : 'warning'
    }]);
  };

  const handleDeleteFile = (fileId: string) => {
    setDataFiles(prev => prev.filter(file => file.id !== fileId));
    const newTime = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, {
      time: newTime,
      message: `File removed from queue`,
      type: 'warning'
    }]);
  };

  const filteredFiles = (filterType === 'all' 
    ? dataFiles 
    : dataFiles.filter(file => file.type === filterType)
  ).filter(file => 
    searchQuery === '' || 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'image': return <ImageIcon className="w-5 h-5" />;
      case 'audio': return <Music className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'document': return <FileText className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const approvedCount = dataFiles.filter(f => f.status === 'approved').length;
  const totalCount = dataFiles.length;

  if (!admin) {
    return (
      <div className="flex min-h-screen bg-slate-900 text-slate-100">
        <AdminSidebar activeItem="Validation Hub" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-['Space_Grotesk',sans-serif]">
      {/* Admin Sidebar */}
      <AdminSidebar activeItem="Validation Hub" />
      
      {/* Main Content */}
      <div className="flex-1" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
        {/* Main Content */}
        <main className="max-w-[1600px] mx-auto px-10 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-4">
          <a className="text-slate-400 text-sm font-medium hover:text-primary transition-colors" href="#">Global Ingestion</a>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-primary text-sm font-semibold tracking-wide uppercase">Level 1: Validation Control Center</span>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Content Area */}
          <div className="col-span-9 flex flex-col gap-6">
            {/* Page Heading */}
            <div className="flex flex-col gap-2">
              <h1 className="text-white text-4xl font-black leading-tight tracking-tighter">Dataset Validation Strategy Hub</h1>
              <p className="text-slate-400 text-lg max-w-2xl">
                Mission-critical quality control gate for high-fidelity multi-modal data. Configure ingestion logic and verify integrity before synchronization.
              </p>
            </div>

            {/* Validation Strategy Section */}
            <section className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-amber-500" />
                  <h2 className="text-white text-xl font-bold">Validation Strategy Selection</h2>
                </div>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] font-bold uppercase tracking-widest">
                  {validationStrategy === 'automated' ? 'AI Active' : 'Manual Review Mode'}
                </Badge>
              </div>

              {/* Strategy Cards */}
              <div className="flex gap-4">
                <label className="flex-1 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="strategy" 
                    checked={validationStrategy === 'automated'}
                    onChange={() => setValidationStrategy('automated')}
                    className="hidden peer"
                  />
                  <div className="flex flex-col gap-3 p-5 rounded-xl border-2 border-slate-700 bg-slate-900 peer-checked:border-blue-500 peer-checked:bg-blue-500/20 peer-checked:shadow-lg peer-checked:shadow-blue-500/20 transition-all hover:border-blue-400">
                    <div className="flex justify-between items-start">
                      <div className="p-2 bg-blue-500/30 rounded-lg text-blue-400">
                        <Brain className="w-6 h-6" />
                      </div>
                      {validationStrategy === 'automated' && (
                        <CheckCircle2 className="w-6 h-6 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Automated Validation</h3>
                      <p className="text-slate-400 text-sm">AI-driven anomaly detection, format normalization, and duplicate scanning.</p>
                    </div>
                  </div>
                </label>

                <label className="flex-1 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="strategy" 
                    checked={validationStrategy === 'manual'}
                    onChange={() => setValidationStrategy('manual')}
                    className="hidden peer"
                  />
                  <div className="flex flex-col gap-3 p-5 rounded-xl border-2 border-slate-700 bg-slate-900 peer-checked:border-amber-500 peer-checked:bg-amber-500/20 peer-checked:shadow-lg peer-checked:shadow-amber-500/20 transition-all hover:border-amber-400">
                    <div className="flex justify-between items-start">
                      <div className="p-2 bg-amber-500/30 rounded-lg text-amber-400">
                        <UserSearch className="w-6 h-6" />
                      </div>
                      {validationStrategy === 'manual' && (
                        <CheckCircle2 className="w-6 h-6 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Manual Review</h3>
                      <p className="text-slate-400 text-sm">Human-in-the-loop sampling, metadata verification, and visual inspection.</p>
                    </div>
                  </div>
                </label>
              </div>
            </section>

            {/* Data Quality Sandbox */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-white text-xl font-bold flex items-center gap-2">
                  <FlaskConical className="w-6 h-6 text-primary" />
                  Data Quality Sandbox
                  <span className="text-slate-500 text-sm font-normal ml-2">
                    ({approvedCount}/{totalCount} Approved)
                  </span>
                </h2>
                <div className="flex gap-2">
                  <div className="flex bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-700 items-center gap-2">
                    <Search className="w-4 h-4 text-slate-400" />
                    <Input 
                      className="bg-transparent border-none focus:outline-none text-sm text-white placeholder:text-slate-500 w-48 h-auto p-0" 
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
                    <SelectTrigger className="w-[140px] h-8 text-xs font-bold bg-slate-800 text-slate-300 border-slate-700 hover:text-white">
                      <SelectValue />
                      <Filter className="w-3 h-3 ml-2 text-slate-400" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ALL FILES</SelectItem>
                      <SelectItem value="image">IMAGES</SelectItem>
                      <SelectItem value="audio">AUDIO</SelectItem>
                      <SelectItem value="video">VIDEO</SelectItem>
                      <SelectItem value="document">DOCUMENTS</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <Maximize2 className={`w-4 h-4 mr-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    {isExpanded ? 'COLLAPSE' : 'EXPAND'}
                  </Button>
                </div>
              </div>

              <div className={`grid gap-6 transition-all ${isExpanded ? 'grid-cols-1' : 'grid-cols-3'}`}>
                {filteredFiles.map((file) => (
                  <div 
                    key={file.id}
                    className="relative group bg-slate-800 rounded-xl border border-slate-700 overflow-hidden transition-transform hover:scale-[1.02] cursor-pointer"
                    onClick={() => setSelectedFile(file)}
                  >
                    {/* File Preview */}
                    <div className="aspect-video bg-slate-900 relative overflow-hidden">
                      {file.type === 'image' && file.thumbnail && (
                        <>
                          <img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
                        </>
                      )}
                      {file.type === 'video' && file.thumbnail && (
                        <>
                          <img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute bottom-3 left-3 text-white text-[10px] font-mono">
                            {file.duration} | {file.codec}
                          </div>
                        </>
                      )}
                      {file.type === 'audio' && (
                        <div className="w-full h-full flex items-center justify-center p-6">
                          <div className="flex items-end gap-1 h-16">
                            {[8, 12, 6, 14, 10, 4, 16, 8, 12].map((h, i) => (
                              <div 
                                key={i}
                                className={`w-1 ${i === 6 ? 'bg-amber-500' : 'bg-primary'} ${i === 0 ? 'animate-pulse' : ''}`}
                                style={{ height: `${h * 4}px` }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {file.type === 'document' && (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-16 h-16 text-primary/40" />
                        </div>
                      )}

                      {/* Scanning Line Animation */}
                      {file.status === 'scanning' && (
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" 
                             style={{ boxShadow: '0 0 15px #3b83f7' }} />
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge 
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            file.status === 'scanning' && 'bg-primary text-white border-primary shadow-lg',
                            file.status === 'anomaly' && 'bg-amber-500 text-black border-amber-500',
                            file.status === 'approved' && 'bg-green-500/10 text-green-400 border-green-400/20',
                            (file.status === 'queued' || file.status === 'rejected') && 'bg-slate-700/80 text-white border-slate-700'
                          )}
                        >
                          {file.status}
                        </Badge>
                      </div>

                      {/* Detection Box */}
                      {file.status === 'scanning' && (
                        <div className="absolute bottom-3 right-3">
                          <div className="h-12 w-12 rounded border-2 border-primary border-dashed animate-pulse" />
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-8 h-8 text-white" />
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file.id);
                        }}
                        className="absolute top-3 right-3 p-1.5 bg-red-500/20 rounded hover:bg-red-500 text-red-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* File Info */}
                    <div className="p-4 bg-slate-800 border-t border-slate-700">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getFileIcon(file.type)}
                          <p className="text-white font-semibold truncate text-sm">{file.name}</p>
                        </div>
                        {file.matchScore && (
                          <p className="text-primary font-mono text-xs ml-2">{file.matchScore}%</p>
                        )}
                        {file.anomalyType && (
                          <p className="text-amber-500 font-mono text-xs ml-2">{file.anomalyType}</p>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white"
                          disabled={file.status === 'queued' || file.status === 'approved'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileAction(file.id, 'approve');
                          }}
                        >
                          {file.status === 'approved' ? 'APPROVED' : 'APPROVE'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          disabled={file.status === 'queued' || file.status === 'rejected'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileAction(file.id, 'reject');
                          }}
                        >
                          {file.status === 'rejected' ? 'REJECTED' : 'REJECT'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="col-span-3 flex flex-col gap-6">
            {/* Metrics */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col gap-6">
              <h2 className="text-white text-lg font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Edge Node Metrics
              </h2>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">Node Status</span>
                    <span className="text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      ACTIVE ({metrics.activeNodes} NODES)
                    </span>
                  </div>
                  <Progress 
                    value={metrics.nodeStatus} 
                    className="h-1.5 [&>div]:bg-green-500 bg-slate-700" 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">Processing Latency</span>
                    <span className="text-primary">{metrics.latency}ms</span>
                  </div>
                  <Progress 
                    value={(metrics.latency / 300) * 100} 
                    className="h-1.5 [&>div]:bg-blue-500 bg-slate-700" 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">Detected Anomalies</span>
                    <span className="text-amber-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {metrics.anomalies.toString().padStart(2, '0')} Warnings
                    </span>
                  </div>
                  <Progress 
                    value={(metrics.anomalies / 20) * 100} 
                    className="h-1.5 [&>div]:bg-amber-500 bg-slate-700" 
                  />
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Consistency Score</span>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-white tracking-tighter">{metrics.consistencyScore}%</span>
                      <span className="text-green-400 text-xs font-bold mb-1 flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        +{metrics.scoreChange}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Panel */}
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-white font-bold">Platform Progression</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Once all assets in the sandbox are verified, you can proceed to the next layer of processing.
                </p>
              </div>
              
              <div className="bg-slate-900/50 rounded-lg p-3 mb-2">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">Approval Progress</span>
                  <span className="text-primary font-bold">{approvedCount}/{totalCount}</span>
                </div>
                <Progress 
                  value={(approvedCount / totalCount) * 100} 
                  className="h-1.5 [&>div]:bg-blue-500 bg-slate-800" 
                />
              </div>

              <Button 
                className="w-full"
                size="lg"
                disabled={approvedCount !== totalCount}
              >
                <span>Push to Regional Hub (Level 2)</span>
                <Rocket className="w-4 h-4 ml-2" />
              </Button>
              
              <Button variant="outline" className="w-full hover:bg-transparent hover:text-current hover:border-current">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Session
              </Button>
              
              <Button variant="ghost" className="w-full text-red-400 hover:text-red-300">
                <Trash2 className="w-4 h-4 mr-2" />
                Discard Session
              </Button>
            </div>

            {/* System Logs */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Real-time Logs</span>
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              </div>
              <div className="font-mono text-[10px] space-y-2 overflow-hidden max-h-32">
                {logs.slice(-4).map((log, i) => (
                  <p key={i} className={log.type === 'warning' ? 'text-amber-400' : 'text-slate-300'}>
                    <span className={log.type === 'warning' ? 'text-amber-400' : 'text-blue-400'}>
                      [{log.time}]
                    </span> {log.message}
                  </p>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h3 className="text-white text-sm font-bold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-scan All
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* File Detail Modal */}
      <Dialog open={!!selectedFile} onOpenChange={(open) => !open && setSelectedFile(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedFile && getFileIcon(selectedFile.type)}
              <div>
                <h3 className="text-white font-bold text-lg">{selectedFile?.name}</h3>
                <DialogDescription className="text-slate-400 text-sm">File Details & Validation</DialogDescription>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Modal Content */}
          <div className="px-6 pb-6">
            {/* File Preview */}
            <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden mb-6">
              {selectedFile?.type === 'image' && selectedFile.thumbnail && (
                <img src={selectedFile.thumbnail} alt={selectedFile.name} className="w-full h-full object-cover" />
              )}
              {selectedFile?.type === 'video' && selectedFile.thumbnail && (
                <div className="relative w-full h-full">
                  <img src={selectedFile.thumbnail} alt={selectedFile.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <button className="p-4 bg-primary rounded-full hover:bg-primary/90 transition-colors">
                      <Play className="w-8 h-8 text-white" />
                    </button>
                  </div>
                </div>
              )}
              {selectedFile?.type === 'audio' && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <Music className="w-16 h-16 text-primary/40" />
                  <div className="flex items-end gap-2 h-24">
                    {[10, 16, 8, 18, 14, 6, 20, 10, 16, 8, 18, 14].map((h, i) => (
                      <div 
                        key={i}
                        className={`w-2 ${i === 6 ? 'bg-amber-500' : 'bg-primary'} rounded-t`}
                        style={{ height: `${h * 4}px` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {selectedFile?.type === 'document' && (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="w-24 h-24 text-primary/40" />
                </div>
              )}
            </div>

            {/* File Metadata */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900 rounded-lg p-4">
                <span className="text-slate-400 text-xs uppercase tracking-wider">Status</span>
                <div className="mt-2">
                  <Badge 
                    variant="outline"
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      selectedFile?.status === 'scanning' && 'bg-primary text-white border-primary shadow-lg',
                      selectedFile?.status === 'anomaly' && 'bg-amber-500 text-black border-amber-500',
                      selectedFile?.status === 'approved' && 'bg-green-500/10 text-green-400 border-green-400/20',
                      (selectedFile?.status === 'queued' || selectedFile?.status === 'rejected') && 'bg-slate-700/80 text-white border-slate-700'
                    )}
                  >
                    {selectedFile?.status}
                  </Badge>
                </div>
              </div>
              <div className="bg-slate-900 rounded-lg p-4">
                <span className="text-slate-400 text-xs uppercase tracking-wider">File Type</span>
                <p className="text-white font-semibold mt-2 capitalize">{selectedFile?.type}</p>
              </div>
              {selectedFile?.matchScore && (
                <div className="bg-slate-900 rounded-lg p-4">
                  <span className="text-slate-400 text-xs uppercase tracking-wider">Match Score</span>
                  <p className="text-primary font-bold text-2xl mt-2">{selectedFile.matchScore}%</p>
                </div>
              )}
              {selectedFile?.anomalyType && (
                <div className="bg-slate-900 rounded-lg p-4">
                  <span className="text-slate-400 text-xs uppercase tracking-wider">Anomaly Type</span>
                  <p className="text-amber-500 font-semibold mt-2">{selectedFile.anomalyType}</p>
                </div>
              )}
              {selectedFile?.duration && (
                <div className="bg-slate-900 rounded-lg p-4">
                  <span className="text-slate-400 text-xs uppercase tracking-wider">Duration</span>
                  <p className="text-white font-semibold mt-2">{selectedFile.duration}</p>
                </div>
              )}
              {selectedFile?.codec && (
                <div className="bg-slate-900 rounded-lg p-4">
                  <span className="text-slate-400 text-xs uppercase tracking-wider">Codec</span>
                  <p className="text-white font-semibold mt-2">{selectedFile.codec}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="default"
                className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white"
                disabled={selectedFile?.status === 'approved'}
                onClick={() => {
                  if (selectedFile) {
                    handleFileAction(selectedFile.id, 'approve');
                    setSelectedFile(null);
                  }
                }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {selectedFile?.status === 'approved' ? 'APPROVED' : 'APPROVE FILE'}
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={selectedFile?.status === 'rejected'}
                onClick={() => {
                  if (selectedFile) {
                    handleFileAction(selectedFile.id, 'reject');
                    setSelectedFile(null);
                  }
                }}
              >
                <X className="w-4 h-4 mr-2" />
                {selectedFile?.status === 'rejected' ? 'REJECTED' : 'REJECT FILE'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white font-bold text-xl">Upload Dataset Files</DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">Add files to the validation queue</DialogDescription>
          </DialogHeader>

          {/* Modal Content */}
          <div className="px-6 pb-6">
              {/* Drop Zone */}
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-12 text-center hover:border-primary transition-colors cursor-pointer bg-slate-900/50">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h4 className="text-white font-semibold mb-2">Drop files here or click to browse</h4>
                <p className="text-slate-400 text-sm mb-4">
                  Supports: Images, Audio, Video, Documents
                </p>
                <Button size="sm">
                  Select Files
                </Button>
              </div>

              {/* File Type Options */}
              <div className="grid grid-cols-4 gap-3 mt-6">
                <div className="bg-slate-900 rounded-lg p-4 text-center hover:bg-slate-700 transition-colors cursor-pointer">
                  <ImageIcon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <span className="text-xs text-slate-400">Images</span>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 text-center hover:bg-slate-700 transition-colors cursor-pointer">
                  <Music className="w-6 h-6 text-primary mx-auto mb-2" />
                  <span className="text-xs text-slate-400">Audio</span>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 text-center hover:bg-slate-700 transition-colors cursor-pointer">
                  <Video className="w-6 h-6 text-primary mx-auto mb-2" />
                  <span className="text-xs text-slate-400">Video</span>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 text-center hover:bg-slate-700 transition-colors cursor-pointer">
                  <FileText className="w-6 h-6 text-primary mx-auto mb-2" />
                  <span className="text-xs text-slate-400">Documents</span>
                </div>
              </div>

              {/* Actions */}
              <DialogFooter className="mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1">
                  <Upload className="w-4 h-4 mr-2" />
                  Start Upload
                </Button>
              </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

        {/* Custom Styles */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

          /* Scrollbar Styling */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          ::-webkit-scrollbar-track {
            background: rgb(15 23 42);
          }

          ::-webkit-scrollbar-thumb {
            background: rgb(51 65 85);
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: rgb(59 130 246);
          }
        `}</style>
      </div>
    </div>
  );
}

export default function ValidationHub() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-slate-900 text-slate-100">
        <AdminSidebar activeItem="Validation Hub" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    }>
      <ValidationHubContent />
    </Suspense>
  );
}