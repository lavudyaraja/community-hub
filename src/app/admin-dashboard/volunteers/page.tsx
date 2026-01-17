"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminSidebar } from '../components/sidebar';
import { getCurrentAdmin, isAdminAuthenticated } from '@/lib/auth';
import { Users, Mail, MapPin, Phone, Calendar, User } from 'lucide-react';

const Volunteers = () => {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    loadVolunteers();
  }, [router]);

  const loadVolunteers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch volunteers');
      }
      const users = await response.json();
      setVolunteers(users);
    } catch (error) {
      console.error('Error loading volunteers:', error);
      setVolunteers([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!admin) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar activeItem="Volunteers" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activeItem="Volunteers" />
      <div className="flex-1" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Volunteers</h1>
            <p className="text-gray-600">Manage and view all registered volunteers</p>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">Loading volunteers...</p>
              </CardContent>
            </Card>
          ) : volunteers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No volunteers registered yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {volunteers.map((volunteer) => (
                <Card key={volunteer.id || volunteer.email}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{volunteer.name || volunteer.email || 'Unknown'}</CardTitle>
                        <Badge className="bg-green-100 text-green-800 mt-1">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {volunteer.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 truncate">{volunteer.email}</span>
                      </div>
                    )}
                    {volunteer.created_at && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          Joined: {new Date(volunteer.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Volunteers;
