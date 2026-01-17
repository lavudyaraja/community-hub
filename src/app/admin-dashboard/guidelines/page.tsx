"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminSidebar } from '../components/sidebar';
import { getCurrentAdmin, isAdminAuthenticated } from '@/lib/auth';
import { FileText, Shield, CheckCircle2, AlertTriangle, Users, BookOpen } from 'lucide-react';

const Guidelines = () => {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);

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

  const guidelines = [
    {
      title: "Validation Guidelines",
      content: "Review all submissions carefully. Validate submissions that meet quality standards, are relevant to the project, and follow data format requirements. Reject submissions that are incomplete, corrupted, or violate ethical guidelines.",
      icon: CheckCircle2
    },
    {
      title: "Ethical Standards",
      content: "Ensure all data submissions respect privacy, consent, and cultural sensitivity. Reject any data that contains personal identifiable information without proper consent, offensive content, or violates community guidelines.",
      icon: Shield
    },
    {
      title: "Quality Assurance",
      content: "Maintain high standards for data quality. Check for accuracy, completeness, and relevance. Ensure metadata is properly documented and files are in correct formats.",
      icon: BookOpen
    },
    {
      title: "Volunteer Management",
      content: "Treat all volunteers with respect and professionalism. Provide clear feedback on submissions. Maintain confidentiality of volunteer information and data submissions.",
      icon: Users
    },
    {
      title: "Data Handling",
      content: "Follow secure data handling procedures. Store data securely, maintain backups, and ensure proper access controls. Do not share data outside authorized channels.",
      icon: FileText
    },
    {
      title: "Conflict Resolution",
      content: "Handle disputes professionally. If a volunteer questions a rejection, provide clear reasoning. Escalate serious issues to super administrators when necessary.",
      icon: AlertTriangle
    }
  ];

  if (!admin) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar activeItem="Guidelines / Ethics" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activeItem="Guidelines / Ethics" />
      <div className="flex-1" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Guidelines / Ethics</h1>
            <p className="text-gray-600">Administrative guidelines and ethical standards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guidelines.map((guideline, index) => {
              const Icon = guideline.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg">{guideline.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 leading-relaxed">{guideline.content}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Additional Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Important Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Always provide constructive feedback when rejecting submissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Maintain consistency in validation criteria across all submissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Document any special cases or exceptions in your validation notes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Report any suspicious activity or data breaches immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Keep your admin credentials secure and never share your access</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Guidelines;
