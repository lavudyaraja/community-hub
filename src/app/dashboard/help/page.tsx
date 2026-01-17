"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sidebar } from '../components/sidebar';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import {
  HelpCircle,
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

const Help = () => {
  const router = useRouter();

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
  }, [router]);

  const handleSendMessage = () => {
    window.location.href = 'mailto:support@datahub.com?subject=Support Request';
    toast.info('Opening email client...');
  };
  const guidelines = [
    {
      title: "Data Format Requirements",
      content: "Upload data in supported formats: JPEG, PNG, MP4, MP3, WAV, JSON, CSV, TXT. Maximum file size: 500MB per submission.",
      icon: FileText
    },
    {
      title: "Quality Guidelines",
      content: "Ensure data is clear, relevant, and properly labeled. Avoid corrupted or incomplete files. Check for data accuracy before submission.",
      icon: CheckCircle
    },
    {
      title: "Privacy & Security",
      content: "Never upload personally identifiable information. Ensure all data complies with privacy regulations and organizational policies.",
      icon: AlertTriangle
    },
    {
      title: "Submission Process",
      content: "Use the Upload Data section to submit files. Monitor submission status in real-time. Contact support if issues persist.",
      icon: Upload
    }
  ];

  const faqs = [
    {
      question: "How long does processing take?",
      answer: "Most submissions are processed within 2-5 minutes. Large files may take longer."
    },
    {
      question: "What happens if my submission fails?",
      answer: "Check the error message and resubmit with corrections. Common issues include unsupported formats or corrupted files."
    },
    {
      question: "Can I delete my submissions?",
      answer: "Yes, you can delete your submissions from the Dataset Preview page. Click on any file and use the delete button to remove it from your account."
    },
    {
      question: "How do I get help?",
      answer: "Use this help page or contact support through the methods listed below."
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeItem="Help / Guidelines" />

      {/* Main Content */}
      <div className="flex-1" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Guidelines</h1>
            <p className="text-gray-600">Find answers to common questions and learn about data submission guidelines.</p>
          </div>

          {/* Guidelines */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Submission Guidelines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guidelines.map((guideline, index) => {
                const Icon = guideline.icon;
                return (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">{guideline.title}</h3>
                          <p className="text-sm text-gray-600">{guideline.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                      <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-sm text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Support */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Support</p>
                    <p className="text-sm text-gray-600">support@datahub.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone Support</p>
                    <p className="text-sm text-gray-600">1-800-DATA-HUB</p>
                  </div>
                </div>
                <Button className="w-full" onClick={handleSendMessage}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Additional Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    User Manual
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Video Tutorials
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    API Documentation
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Data Format Guide
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">99.9%</div>
                  <p className="text-xs text-gray-600">Uptime</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">&lt;5min</div>
                  <p className="text-xs text-gray-600">Avg Response</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">24/7</div>
                  <p className="text-xs text-gray-600">Support</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">v1.0</div>
                  <p className="text-xs text-gray-600">Version</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help;