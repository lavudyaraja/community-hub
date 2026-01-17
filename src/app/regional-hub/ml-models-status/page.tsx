"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RegionalSidebar } from '../components/sidebar';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import { 
  Brain, RefreshCw, Activity, CheckCircle2, Clock, AlertCircle,
  TrendingUp, TrendingDown, Zap, Database, Settings, Play,
  Pause, StopCircle, Eye, Download, Upload, Loader2,
  BarChart3, PieChart, LineChart, Target, Cpu
} from 'lucide-react';
import { toast } from 'sonner';

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  latency: number;
  throughput: number;
}

interface ModelVersion {
  version: string;
  date: Date;
  accuracy: number;
  notes: string;
}

interface MLModel {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'training' | 'idle' | 'error' | 'deploying';
  type: 'classification' | 'regression' | 'detection' | 'segmentation';
  framework: 'TensorFlow' | 'PyTorch' | 'Scikit-learn' | 'XGBoost';
  metrics: ModelMetrics;
  lastUpdated: Date;
  trainedOn: number;
  size: number;
  deployed: boolean;
  uptime: number;
  versions: ModelVersion[];
  errors?: string[];
  trainingProgress?: number;
}

// Mock data generator
const generateMockModels = (): MLModel[] => {
  const modelTypes = ['Image Classifier', 'Audio Detector', 'Video Analyzer', 'Document Parser', 'Quality Validator'];
  const frameworks: MLModel['framework'][] = ['TensorFlow', 'PyTorch', 'Scikit-learn', 'XGBoost'];
  const types: MLModel['type'][] = ['classification', 'regression', 'detection', 'segmentation'];
  const statuses: MLModel['status'][] = ['active', 'training', 'idle', 'error', 'deploying'];

  return modelTypes.map((name, i) => {
    const status = statuses[i % statuses.length];
    const accuracy = 85 + Math.random() * 15;
    
    return {
      id: `model-${i + 1}`,
      name,
      version: `v${i + 2}.${Math.floor(Math.random() * 10)}`,
      status,
      type: types[i % types.length],
      framework: frameworks[i % frameworks.length],
      metrics: {
        accuracy: Math.round(accuracy * 100) / 100,
        precision: Math.round((accuracy - 2 + Math.random() * 4) * 100) / 100,
        recall: Math.round((accuracy - 1 + Math.random() * 3) * 100) / 100,
        f1Score: Math.round((accuracy - 1.5 + Math.random() * 3) * 100) / 100,
        latency: Math.round(10 + Math.random() * 90),
        throughput: Math.round(100 + Math.random() * 900)
      },
      lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      trainedOn: Math.floor(10000 + Math.random() * 90000),
      size: Math.round(50 + Math.random() * 450),
      deployed: status === 'active',
      uptime: status === 'active' ? Math.round(90 + Math.random() * 10) : 0,
      versions: [
        {
          version: `v${i + 2}.${Math.floor(Math.random() * 10)}`,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          accuracy: Math.round((85 + Math.random() * 15) * 100) / 100,
          notes: 'Latest production version'
        },
        {
          version: `v${i + 1}.${Math.floor(Math.random() * 10)}`,
          date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
          accuracy: Math.round((80 + Math.random() * 15) * 100) / 100,
          notes: 'Previous stable version'
        },
        {
          version: `v${i}.${Math.floor(Math.random() * 10)}`,
          date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          accuracy: Math.round((75 + Math.random() * 15) * 100) / 100,
          notes: 'Initial release'
        }
      ],
      errors: status === 'error' ? ['Model inference timeout', 'Out of memory'] : undefined,
      trainingProgress: status === 'training' ? Math.round(Math.random() * 100) : undefined
    };
  });
};

export default function MLModelsStatus() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [models, setModels] = useState<MLModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);
    loadModels();
  }, [router]);

  const loadModels = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setModels(generateMockModels());
      setIsLoading(false);
    }, 800);
  }, []);

  const stats = useMemo(() => {
    return {
      active: models.filter(m => m.status === 'active').length,
      training: models.filter(m => m.status === 'training').length,
      idle: models.filter(m => m.status === 'idle').length,
      error: models.filter(m => m.status === 'error').length,
      avgAccuracy: Math.round(
        models.reduce((sum, m) => sum + m.metrics.accuracy, 0) / models.length * 100
      ) / 100,
      avgLatency: Math.round(
        models.reduce((sum, m) => sum + m.metrics.latency, 0) / models.length
      ),
      totalThroughput: models
        .filter(m => m.status === 'active')
        .reduce((sum, m) => sum + m.metrics.throughput, 0)
    };
  }, [models]);

  const handleViewDetails = (model: MLModel) => {
    setSelectedModel(model);
    setIsDetailOpen(true);
  };

  const handleDeploy = async (id: string) => {
    setActionLoading(id);
    setTimeout(() => {
      setModels(prev => prev.map(m =>
        m.id === id ? { ...m, status: 'active' as const, deployed: true } : m
      ));
      toast.success('Model deployed successfully');
      setActionLoading(null);
      setIsDetailOpen(false);
    }, 1500);
  };

  const handlePause = async (id: string) => {
    setActionLoading(id);
    setTimeout(() => {
      setModels(prev => prev.map(m =>
        m.id === id ? { ...m, status: 'idle' as const, deployed: false } : m
      ));
      toast.success('Model paused');
      setActionLoading(null);
      setIsDetailOpen(false);
    }, 1000);
  };

  const handleRetrain = async (id: string) => {
    setActionLoading(id);
    setTimeout(() => {
      setModels(prev => prev.map(m =>
        m.id === id ? { ...m, status: 'training' as const, trainingProgress: 0 } : m
      ));
      toast.success('Model retraining started');
      setActionLoading(null);
      setIsDetailOpen(false);
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      active: { className: 'bg-green-100 text-green-800', label: 'Active', icon: CheckCircle2 },
      training: { className: 'bg-blue-100 text-blue-800', label: 'Training', icon: Clock },
      idle: { className: 'bg-gray-100 text-gray-800', label: 'Idle', icon: Pause },
      error: { className: 'bg-red-100 text-red-800', label: 'Error', icon: AlertCircle },
      deploying: { className: 'bg-yellow-100 text-yellow-800', label: 'Deploying', icon: Upload }
    };
    const config = configs[status as keyof typeof configs] || configs.idle;
    const Icon = config.icon;
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getTypeColor = (type: string) => {
    const colors = {
      classification: 'bg-purple-100 text-purple-600',
      regression: 'bg-blue-100 text-blue-600',
      detection: 'bg-pink-100 text-pink-600',
      segmentation: 'bg-orange-100 text-orange-600'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <RegionalSidebar activeItem="ML Models Status" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--regional-sidebar-width, 256px)' }}>
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <RegionalSidebar activeItem="ML Models Status" />
      <div className="flex-1" style={{ marginLeft: 'var(--regional-sidebar-width, 256px)' }}>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">ML Models Status</h1>
              <p className="text-gray-600">Monitor and manage ML model performance</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadModels}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                <Upload className="h-4 w-4 mr-2" />
                Deploy New Model
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Models</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Running smoothly
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Training</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.training}</p>
                    <p className="text-xs text-blue-600 mt-1 flex items-center">
                      <Activity className="h-3 w-3 mr-1" />
                      In progress
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg Accuracy</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.avgAccuracy}%</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +2.3% this week
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg Latency</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.avgLatency}ms</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      -15ms improved
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Zap className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Model Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {models.slice(0, 3).map((model) => (
                    <div key={model.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{model.name}</span>
                        <span className="text-sm font-bold text-blue-600">{model.metrics.accuracy}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${model.metrics.accuracy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-sm">Active</span>
                    </div>
                    <span className="font-semibold">{stats.active}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span className="text-sm">Training</span>
                    </div>
                    <span className="font-semibold">{stats.training}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full" />
                      <span className="text-sm">Idle</span>
                    </div>
                    <span className="font-semibold">{stats.idle}</span>
                  </div>
                  {stats.error > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <span className="text-sm">Error</span>
                      </div>
                      <span className="font-semibold">{stats.error}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Models List */}
          <Card>
            <CardHeader>
              <CardTitle>Model Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {models.map((model) => (
                  <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${getTypeColor(model.type)}`}>
                        <Brain className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{model.name}</p>
                          <Badge variant="outline" className="text-xs">{model.version}</Badge>
                          <Badge variant="outline" className="text-xs">{model.framework}</Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Accuracy: {model.metrics.accuracy}%
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            Latency: {model.metrics.latency}ms
                          </span>
                          <span className="flex items-center gap-1">
                            <Database className="h-3 w-3" />
                            {model.size}MB
                          </span>
                          {model.deployed && (
                            <span className="flex items-center gap-1 text-green-600">
                              <Activity className="h-3 w-3" />
                              Uptime: {model.uptime}%
                            </span>
                          )}
                        </div>

                        {model.trainingProgress !== undefined && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Training Progress</span>
                              <span>{model.trainingProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${model.trainingProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(model.status)}
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(model)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Model Details & Metrics</DialogTitle>
            <DialogDescription>Comprehensive model information and performance metrics</DialogDescription>
          </DialogHeader>

          {selectedModel && (
            <div className="space-y-6 mt-4">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(selectedModel.type)}`}>
                  <Brain className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedModel.name}</h3>
                  <p className="text-sm text-gray-600">{selectedModel.framework} • {selectedModel.type}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{selectedModel.version}</Badge>
                  {getStatusBadge(selectedModel.status)}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <p className="text-xs text-gray-500">Accuracy</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{selectedModel.metrics.accuracy}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-green-600" />
                      <p className="text-xs text-gray-500">Precision</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{selectedModel.metrics.precision}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <p className="text-xs text-gray-500">Recall</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{selectedModel.metrics.recall}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-orange-600" />
                      <p className="text-xs text-gray-500">F1 Score</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{selectedModel.metrics.f1Score}%</p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-blue-600" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Latency</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-gray-900">{selectedModel.metrics.latency}</p>
                        <p className="text-sm text-gray-500">ms</p>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${100 - (selectedModel.metrics.latency / 100 * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Throughput</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-gray-900">{selectedModel.metrics.throughput}</p>
                        <p className="text-sm text-gray-500">req/s</p>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(selectedModel.metrics.throughput / 1000) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Version History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    Version History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedModel.versions.map((version, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{version.version}</Badge>
                          <div>
                            <p className="text-sm font-medium">{version.notes}</p>
                            <p className="text-xs text-gray-500">{version.date.toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-blue-600">{version.accuracy}%</p>
                          <p className="text-xs text-gray-500">Accuracy</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Model Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Trained On</p>
                    <p className="font-semibold">{selectedModel.trainedOn.toLocaleString()} samples</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Model Size</p>
                    <p className="font-semibold">{selectedModel.size} MB</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                    <p className="font-semibold">{selectedModel.lastUpdated.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Deployment Status</p>
                    <p className="font-semibold">{selectedModel.deployed ? 'Deployed' : 'Not Deployed'}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Errors */}
              {selectedModel.errors && selectedModel.errors.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                      <AlertCircle className="h-5 w-5" />
                      Errors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-red-700">
                      {selectedModel.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {!selectedModel.deployed && selectedModel.status !== 'training' && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleDeploy(selectedModel.id)}
                    disabled={actionLoading === selectedModel.id}
                  >
                    {actionLoading === selectedModel.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Deploy Model
                  </Button>
                )}
                {selectedModel.deployed && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handlePause(selectedModel.id)}
                    disabled={actionLoading === selectedModel.id}
                  >
                    {actionLoading === selectedModel.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Pause className="h-4 w-4 mr-2" />
                    )}
                    Pause Model
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                  onClick={() => handleRetrain(selectedModel.id)}
                  disabled={actionLoading === selectedModel.id || selectedModel.status === 'training'}
                >
                  {actionLoading === selectedModel.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Retrain
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}