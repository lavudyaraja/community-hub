"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminSidebar } from '../components/sidebar';
import { getCurrentAdmin, isAdminAuthenticated } from '@/lib/auth';
import { User, Mail, MapPin, Shield, Calendar, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminProfile = () => {
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

  if (!admin) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar activeItem="Profile" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activeItem="Profile" />
      <div className="flex-1" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
              <p className="text-gray-600">View and manage your admin profile</p>
            </div>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{admin.name || 'Admin'}</p>
                      <p className="text-sm text-gray-500 capitalize">
                        {admin.adminRole?.replace('_', ' ') || 'Administrator'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Email Address</p>
                        <p className="text-sm font-medium text-gray-900">{admin.email || 'Not set'}</p>
                      </div>
                    </div>

                    {admin.country && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Country / Region</p>
                          <p className="text-sm font-medium text-gray-900">{admin.country}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Account Status</p>
                        <Badge className={admin.accountStatus === 'active' ? 'bg-green-100 text-green-800 mt-1' : 'bg-yellow-100 text-yellow-800 mt-1'}>
                          {admin.accountStatus || 'pending'}
                        </Badge>
                      </div>
                    </div>

                    {admin.createdAt && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Member Since</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Account Security */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Password</p>
                      <p className="text-xs text-gray-500">Last updated: Never</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-xs text-gray-500">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500">Admin Role</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize mt-1">
                      {admin.adminRole?.replace('_', ' ') || 'Administrator'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Account Type</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">Administrator</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Access Level</p>
                    <Badge className="bg-red-100 text-red-800 mt-1">
                      {admin.adminRole === 'super_admin' ? 'Full Access' : 'Validator Access'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
