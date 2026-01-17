"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RegionalSidebar } from '../components/sidebar';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import {
  FolderTree, RefreshCw, FileText, Music, Video, 
  FileImage, Loader2, Plus, Search, Filter, Download,
  TrendingUp, BarChart3, PieChart, Folder, Grid3x3,
  List, ChevronRight, Eye, Edit, Trash2, Settings,
  ArrowUpRight, Database, HardDrive, Users, Target,
  CheckCircle2, Clock, XCircle, Zap, Activity, Archive,
  FolderOpen, Star, Tag
} from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video' | 'document';
  count: number;
  size: number;
  subcategories: number;
  validated: number;
  pending: number;
  rejected: number;
  growth: number;
  color: string;
  icon: any;
}

interface Subcategory {
  id: string;
  parentId: string;
  name: string;
  count: number;
  size: number;
  avgQuality: number;
}

const generateCategories = (): Category[] => {
  return [
    {
      id: 'cat-1',
      name: 'Medical Images',
      type: 'image',
      count: 5678,
      size: 8540,
      subcategories: 8,
      validated: 5124,
      pending: 312,
      rejected: 242,
      growth: 15.3,
      color: 'blue',
      icon: FileImage
    },
    {
      id: 'cat-2',
      name: 'Audio Recordings',
      type: 'audio',
      count: 3245,
      size: 4560,
      subcategories: 5,
      validated: 2980,
      pending: 156,
      rejected: 109,
      growth: 12.7,
      color: 'green',
      icon: Music
    },
    {
      id: 'cat-3',
      name: 'Surgical Videos',
      type: 'video',
      count: 1890,
      size: 12300,
      subcategories: 6,
      validated: 1654,
      pending: 189,
      rejected: 47,
      growth: 8.5,
      color: 'purple',
      icon: Video
    },
    {
      id: 'cat-4',
      name: 'Clinical Documents',
      type: 'document',
      count: 4123,
      size: 2340,
      subcategories: 7,
      validated: 3890,
      pending: 145,
      rejected: 88,
      growth: 10.2,
      color: 'orange',
      icon: FileText
    }
  ];
};

const generateSubcategories = (parentId: string): Subcategory[] => {
  const subcatNames: { [key: string]: string[] } = {
    'cat-1': ['X-Ray Scans', 'MRI Images', 'CT Scans', 'Ultrasound', 'Pathology Slides', 'Dermatology Images', 'Dental X-Rays', 'Mammograms'],
    'cat-2': ['Heartbeat Recordings', 'Lung Sounds', 'Voice Samples', 'Diagnostic Audio', 'Therapy Sessions'],
    'cat-3': ['Cardiac Surgery', 'Orthopedic Procedures', 'Laparoscopic Surgery', 'Neurosurgery', 'General Surgery', 'Endoscopy'],
    'cat-4': ['Patient Records', 'Lab Reports', 'Prescription Records', 'Medical History', 'Research Papers', 'Clinical Notes', 'Insurance Forms']
  };

  const names = subcatNames[parentId] || [];
  return names.map((name, idx) => ({
    id: `subcat-${parentId}-${idx}`,
    parentId,
    name,
    count: Math.floor(Math.random() * 800) + 200,
    size: Math.floor(Math.random() * 2000) + 500,
    avgQuality: 7.5 + Math.random() * 2
  }));
};

export default function DataCategories() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const totalStats = {
    totalFiles: categories.reduce((sum, cat) => sum + cat.count, 0),
    totalSize: categories.reduce((sum, cat) => sum + cat.size, 0),
    totalValidated: categories.reduce((sum, cat) => sum + cat.validated, 0),
    totalPending: categories.reduce((sum, cat) => sum + cat.pending, 0),
    totalRejected: categories.reduce((sum, cat) => sum + cat.rejected, 0),
    totalSubcategories: categories.reduce((sum, cat) => sum + cat.subcategories, 0),
    avgGrowth: categories.length > 0 ? categories.reduce((sum, cat) => sum + cat.growth, 0) / categories.length : 0
  };

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
    loadData();
  }, [router]);

  const loadData = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setCategories(generateCategories());
      setIsLoading(false);
    }, 600);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setCategories(generateCategories());
      if (selectedCategory) {
        setSubcategories(generateSubcategories(selectedCategory));
      }
      setIsRefreshing(false);
      toast.success('Categories refreshed');
    }, 800);
  }, [selectedCategory]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSubcategories(generateSubcategories(categoryId));
  };

  const formatFileSize = (mb: number) => {
    if (mb < 1024) return `${mb} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { bg: string; border: string; text: string; iconBg: string } } = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', iconBg: 'bg-blue-100' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', iconBg: 'bg-green-100' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', iconBg: 'bg-purple-100' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', iconBg: 'bg-orange-100' }
    };
    return colors[color] || colors.blue;
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen bg-white">
        <RegionalSidebar activeItem="Data Categories" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--regional-sidebar-width, 256px)' }}>
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <RegionalSidebar activeItem="Data Categories" />
      <div className="flex-1" style={{ marginLeft: 'var(--regional-sidebar-width, 256px)' }}>
        <div className="p-6 max-w-[1800px] mx-auto">
          {/* Header Section */}
          <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <FolderTree className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Data Categories</h1>
                  <p className="text-gray-600 mt-1">Organize and manage medical data categories and subcategories</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-blue-600' : ''}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-blue-600' : ''}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh} 
                  disabled={isRefreshing}
                  className="border-gray-300"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Category
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-7 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Total Files</p>
                <p className="text-lg font-bold text-gray-900">{totalStats.totalFiles.toLocaleString()}</p>
              </div>
              <div className="text-center border-l border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Total Size</p>
                <p className="text-lg font-bold text-gray-900">{formatFileSize(totalStats.totalSize)}</p>
              </div>
              <div className="text-center border-l border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Validated</p>
                <p className="text-lg font-bold text-emerald-600">{totalStats.totalValidated.toLocaleString()}</p>
              </div>
              <div className="text-center border-l border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Pending</p>
                <p className="text-lg font-bold text-amber-600">{totalStats.totalPending.toLocaleString()}</p>
              </div>
              <div className="text-center border-l border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Rejected</p>
                <p className="text-lg font-bold text-red-600">{totalStats.totalRejected.toLocaleString()}</p>
              </div>
              <div className="text-center border-l border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Subcategories</p>
                <p className="text-lg font-bold text-gray-900">{totalStats.totalSubcategories}</p>
              </div>
              <div className="text-center border-l border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Avg Growth</p>
                <p className="text-lg font-bold text-blue-600">+{totalStats.avgGrowth.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Category Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {categories.map((category) => {
              const Icon = category.icon;
              const colors = getColorClasses(category.color);
              const validationRate = category.count > 0 ? (category.validated / category.count * 100) : 0;

              return (
                <Card 
                  key={category.id} 
                  className="border border-gray-200 bg-white hover:border-gray-300 transition-colors cursor-pointer"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`h-12 w-12 rounded-lg ${colors.iconBg} flex items-center justify-center border ${colors.border}`}>
                        <Icon className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <Badge className={`${colors.bg} ${colors.text} border ${colors.border}`}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{category.growth}%
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">{category.name}</h3>
                      <p className="text-3xl font-bold text-gray-900 mb-2">{category.count.toLocaleString()}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Storage: {formatFileSize(category.size)}</span>
                          <span className="text-gray-600">{category.subcategories} subcategories</span>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">Validation Rate</span>
                            <span className="font-semibold text-emerald-600">{validationRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={validationRate} className="h-1.5" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Category Details and Subcategories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Category Breakdown */}
            <div className="lg:col-span-2">
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    Category Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      const colors = getColorClasses(category.color);
                      const percentage = totalStats.totalFiles > 0 ? (category.count / totalStats.totalFiles * 100) : 0;

                      return (
                        <div key={category.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`h-8 w-8 rounded ${colors.iconBg} flex items-center justify-center border ${colors.border}`}>
                                <Icon className={`h-4 w-4 ${colors.text}`} />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{category.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-600">{category.count.toLocaleString()} files</span>
                              <span className="text-sm font-semibold text-gray-900 min-w-[50px] text-right">{percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${colors.bg} ${colors.border} border-l-2 transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs text-emerald-700 font-medium">Validated</span>
                      </div>
                      <p className="text-xl font-bold text-emerald-700">{totalStats.totalValidated.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span className="text-xs text-amber-700 font-medium">Pending</span>
                      </div>
                      <p className="text-xl font-bold text-amber-700">{totalStats.totalPending.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-xs text-red-700 font-medium">Rejected</span>
                      </div>
                      <p className="text-xl font-bold text-red-700">{totalStats.totalRejected.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Actions */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <Button className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Category
                </Button>
                <Button className="w-full justify-start bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Manage Subcategories
                </Button>
                <Button className="w-full justify-start bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200">
                  <Download className="h-4 w-4 mr-2" />
                  Export Categories
                </Button>
                <Button className="w-full justify-start bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>

                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <HardDrive className="h-4 w-4 text-gray-600" />
                      <span className="text-xs text-gray-600 font-medium">Storage Usage</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{formatFileSize(totalStats.totalSize)}</p>
                    <div className="mt-2">
                      <Progress value={42} className="h-1.5" />
                      <p className="text-xs text-gray-500 mt-1">42% of 75 GB allocated</p>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-gray-600" />
                      <span className="text-xs text-gray-600 font-medium">Activity Score</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">8.7/10</p>
                    <p className="text-xs text-emerald-600 mt-1">Above average performance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subcategories Section */}
          {selectedCategory && subcategories.length > 0 && (
            <Card className="border border-gray-200 bg-white mb-6">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <FolderOpen className="h-5 w-5 text-blue-600" />
                    Subcategories
                    <Badge className="ml-2 bg-gray-100 text-gray-700 border border-gray-200">
                      {subcategories.length} items
                    </Badge>
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSubcategories([]);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subcategories.map((subcat) => (
                    <div 
                      key={subcat.id} 
                      className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                            <Folder className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">{subcat.name}</h4>
                            <p className="text-xs text-gray-600">{subcat.count} files</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Size</span>
                          <span className="font-semibold text-gray-900">{formatFileSize(subcat.size)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Quality Score</span>
                          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            {subcat.avgQuality.toFixed(1)}/10
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category Management Tools */}
          <Card className="border border-gray-200 bg-white">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Category Management Tools
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-gray-300">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-300">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                      <Archive className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Archive Management</h3>
                      <p className="text-xs text-gray-600">Manage archived categories</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full border-gray-300">
                    View Archives
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                <div className="p-5 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100">
                      <Tag className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Tag Management</h3>
                      <p className="text-xs text-gray-600">Organize with custom tags</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full border-gray-300">
                    Manage Tags
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                <div className="p-5 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                      <Target className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Quality Control</h3>
                      <p className="text-xs text-gray-600">Monitor category quality</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full border-gray-300">
                    View Metrics
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}