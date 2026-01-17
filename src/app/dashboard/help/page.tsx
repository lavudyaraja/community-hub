"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  HelpCircle,
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  ExternalLink,
  Search,
  BookOpen,
  Video,
  MessageCircle,
  Download,
  Settings,
  Shield,
  Zap,
  Clock,
  Users,
  Globe,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  Lightbulb,
  AlertCircle
} from 'lucide-react';

export default function HelpPageEnhanced() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Topics', icon: BookOpen },
    { id: 'upload', label: 'Upload & Submission', icon: Upload },
    { id: 'account', label: 'Account Settings', icon: Settings },
    { id: 'security', label: 'Security & Privacy', icon: Shield },
    { id: 'technical', label: 'Technical Issues', icon: AlertCircle }
  ];

  const guidelines: Array<{
    title: string;
    content: string;
    icon: React.ComponentType<{ className?: string }>;
    color: 'blue' | 'green' | 'purple' | 'orange';
  }> = [
    {
      title: "Data Format Requirements",
      content: "Upload data in supported formats: JPEG, PNG, MP4, MP3, WAV, JSON, CSV, TXT. Maximum file size: 500MB per submission. Ensure files are not corrupted before uploading.",
      icon: FileText,
      color: "blue"
    },
    {
      title: "Quality Guidelines",
      content: "Ensure data is clear, relevant, and properly labeled. Avoid corrupted or incomplete files. Check for data accuracy before submission. Use descriptive file names.",
      icon: CheckCircle,
      color: "green"
    },
    {
      title: "Privacy & Security",
      content: "Never upload personally identifiable information. Ensure all data complies with privacy regulations and organizational policies. All uploads are encrypted.",
      icon: Shield,
      color: "purple"
    },
    {
      title: "Submission Process",
      content: "Use the Upload Data section to submit files. Monitor submission status in real-time. Contact support if issues persist. You'll receive confirmation emails.",
      icon: Upload,
      color: "orange"
    }
  ];

  const faqs = [
    {
      question: "How long does processing take?",
      answer: "Most submissions are processed within 2-5 minutes. Large files (over 100MB) may take 5-10 minutes. You'll receive a notification when processing is complete.",
      category: 'upload',
      popular: true
    },
    {
      question: "What happens if my submission fails?",
      answer: "Check the error message displayed on screen. Common issues include unsupported formats, corrupted files, or files exceeding size limits. You can resubmit after fixing the issue.",
      category: 'upload',
      popular: true
    },
    {
      question: "Can I delete my submissions?",
      answer: "Yes, you can delete your submissions from the Dataset Preview page. Click on any file and use the delete button. Deleted files are permanently removed from the system.",
      category: 'upload',
      popular: false
    },
    {
      question: "How do I change my password?",
      answer: "Go to Settings > Security Settings and click on 'Change Password'. You'll need to enter your current password and choose a new one.",
      category: 'account',
      popular: false
    },
    {
      question: "Is my data secure?",
      answer: "Yes, all data is encrypted in transit and at rest. We use industry-standard security protocols. You can enable two-factor authentication for additional security.",
      category: 'security',
      popular: true
    },
    {
      question: "How do I enable two-factor authentication?",
      answer: "Navigate to Settings > Security Settings and toggle on 'Two-Factor Authentication'. Follow the on-screen instructions to set it up with your mobile device.",
      category: 'security',
      popular: false
    },
    {
      question: "What file formats are supported?",
      answer: "We support images (JPEG, PNG, GIF), videos (MP4, AVI, MOV), audio (MP3, WAV, AAC), documents (PDF, TXT, CSV, JSON, XML), and archives (ZIP, RAR).",
      category: 'technical',
      popular: true
    },
    {
      question: "Why is my upload stuck at 0%?",
      answer: "This usually indicates a connection issue. Check your internet connection and try again. If the problem persists, try clearing your browser cache or using a different browser.",
      category: 'technical',
      popular: false
    },
    {
      question: "Can I upload multiple files at once?",
      answer: "Yes, you can select and upload multiple files simultaneously. Simply select all the files you want to upload in the file picker dialog.",
      category: 'upload',
      popular: false
    },
    {
      question: "How do I contact support?",
      answer: "You can reach support via email at support@datahub.com, call 1-800-DATA-HUB, or use the live chat feature available 24/7.",
      category: 'account',
      popular: true
    }
  ];

  const quickLinks = [
    { title: "Getting Started Guide", icon: BookOpen, url: "#" },
    { title: "Video Tutorials", icon: Video, url: "#" },
    { title: "API Documentation", icon: FileText, url: "#" },
    { title: "Data Format Guide", icon: Download, url: "#" },
    { title: "Best Practices", icon: Lightbulb, url: "#" },
    { title: "Troubleshooting", icon: FileQuestion, url: "#" }
  ];

  const troubleshootingSteps = [
    {
      issue: "Upload Failed",
      steps: [
        "Check your internet connection",
        "Verify file format is supported",
        "Ensure file size is under 500MB",
        "Try a different browser",
        "Contact support if issue persists"
      ]
    },
    {
      issue: "Cannot Login",
      steps: [
        "Verify your email and password",
        "Clear browser cache and cookies",
        "Try password reset if forgotten",
        "Check if account is active",
        "Contact support for account issues"
      ]
    },
    {
      issue: "Processing Taking Too Long",
      steps: [
        "Large files may take 5-10 minutes",
        "Check submission status in dashboard",
        "Refresh the page",
        "Wait for email confirmation",
        "Contact support after 15 minutes"
      ]
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const getColorClasses = (color: 'blue' | 'green' | 'purple' | 'orange') => {
    const colors = {
      blue: "bg-blue-50 border-blue-200 text-blue-700",
      green: "bg-green-50 border-green-200 text-green-700",
      purple: "bg-purple-50 border-purple-200 text-purple-700",
      orange: "bg-orange-50 border-orange-200 text-orange-700"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <HelpCircle className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Help & Support Center</h1>
              <p className="text-gray-600 mt-1">Find answers, guides, and get the help you need</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for help articles, FAQs, guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg border-2 border-gray-200 focus:border-blue-400 rounded-xl transition-colors"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Card className="border-2 border-gray-100 hover:border-blue-200 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">99.9%</div>
              <p className="text-sm text-gray-600">System Uptime</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-gray-100 hover:border-green-200 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">&lt;5min</div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-gray-100 hover:border-purple-200 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">24/7</div>
              <p className="text-sm text-gray-600">Support Available</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-gray-100 hover:border-orange-200 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">10k+</div>
              <p className="text-sm text-gray-600">Happy Users</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-600" />
            Quick Access
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto flex-col gap-3 py-6 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <Icon className="h-6 w-6 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">{link.title}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Guidelines Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            Submission Guidelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guidelines.map((guideline, index) => {
              const Icon = guideline.icon;
              return (
                <Card key={index} className={`border-2 ${getColorClasses(guideline.color)} transition-all hover:scale-[1.02]`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-white border-2 ${getColorClasses(guideline.color)}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">{guideline.title}</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{guideline.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-blue-600" />
            Frequently Asked Questions
          </h2>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  onClick={() => setActiveCategory(category.id)}
                  className={`border-2 transition-all ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {category.label}
                </Button>
              );
            })}
          </div>

          <Card className="border-2 border-gray-200">
            <CardContent className="p-6">
              <div className="space-y-3">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, index) => (
                    <div
                      key={index}
                      className="border-2 border-gray-100 rounded-lg overflow-hidden hover:border-blue-200 transition-colors"
                    >
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <div className="flex items-center gap-2 flex-1">
                            <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                            {faq.popular && (
                              <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">
                                Popular
                              </Badge>
                            )}
                          </div>
                        </div>
                        {expandedFaq === index ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      {expandedFaq === index && (
                        <div className="px-4 pb-4 pl-12 bg-blue-50 border-t-2 border-blue-100">
                          <p className="text-sm text-gray-700 leading-relaxed pt-3">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FileQuestion className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No FAQs found matching your search.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Troubleshooting Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-blue-600" />
            Common Issues & Solutions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {troubleshootingSteps.map((item, index) => (
              <Card key={index} className="border-2 border-gray-200 hover:border-orange-300 transition-colors">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b-2 border-orange-100">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    {item.issue}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ol className="space-y-3">
                    {item.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center">
                          {stepIndex + 1}
                        </span>
                        <span className="text-sm text-gray-700 pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Support Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Card className="border-2 border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Contact Support
              </CardTitle>
              <CardDescription>Get in touch with our support team</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-100">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Email Support</p>
                  <p className="text-sm text-blue-600">support@datahub.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-100">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Phone Support</p>
                  <p className="text-sm text-green-600">1-800-DATA-HUB</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-100">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Live Chat</p>
                  <p className="text-sm text-purple-600">Available 24/7</p>
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0">
                <Mail className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-100">
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-green-600" />
                Learning Resources
              </CardTitle>
              <CardDescription>Explore our comprehensive guides and tutorials</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <Button variant="outline" className="w-full justify-start border-2 border-gray-200 hover:border-green-400 hover:bg-green-50">
                <BookOpen className="h-4 w-4 mr-3 text-green-600" />
                <span className="text-left flex-1">User Manual & Documentation</span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </Button>
              <Button variant="outline" className="w-full justify-start border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50">
                <Video className="h-4 w-4 mr-3 text-blue-600" />
                <span className="text-left flex-1">Video Tutorials & Demos</span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </Button>
              <Button variant="outline" className="w-full justify-start border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50">
                <FileText className="h-4 w-4 mr-3 text-purple-600" />
                <span className="text-left flex-1">API Documentation</span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </Button>
              <Button variant="outline" className="w-full justify-start border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50">
                <Download className="h-4 w-4 mr-3 text-orange-600" />
                <span className="text-left flex-1">Data Format Specifications</span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </Button>
              <Button variant="outline" className="w-full justify-start border-2 border-gray-200 hover:border-pink-400 hover:bg-pink-50">
                <Lightbulb className="h-4 w-4 mr-3 text-pink-600" />
                <span className="text-left flex-1">Best Practices Guide</span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Status Banner */}
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">All Systems Operational</h3>
                  <p className="text-sm text-gray-600">Last updated: Just now • Version 1.0.0</p>
                </div>
              </div>
              <Badge className="bg-green-600 text-white border-0 px-4 py-2">
                <Clock className="h-4 w-4 mr-2" />
                99.9% Uptime
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}