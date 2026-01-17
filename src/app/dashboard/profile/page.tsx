"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sidebar } from '../components/sidebar';
import {
  User,
  Mail,
  MapPin,
  Users,
  CheckCircle,
  Clock,
  Edit,
  Lock,
  FileText,
  History,
  FileCheck,
  HelpCircle,
  LogOut,
  Save,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getCurrentUser, updateUserData, updatePassword, isAuthenticated, logout as authLogout, UserData } from '@/lib/auth';

const Profile = () => {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  
  // Load user data from storage
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    // Load user data
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUserData(currentUser);
      setEditFormData({
        name: currentUser.name || '',
        communityName: currentUser.communityName || '',
        email: currentUser.email || '',
        country: currentUser.country || '',
        region: currentUser.region || '',
        community: currentUser.community || '',
        tribe: currentUser.tribe || '',
        accountStatus: currentUser.accountStatus || 'pending'
      });
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  const [editFormData, setEditFormData] = useState({
    name: '',
    communityName: '',
    email: '',
    country: '',
    region: '',
    community: '',
    tribe: '',
    accountStatus: 'pending' as 'active' | 'pending'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleEditProfile = () => {
    if (!userData) return;
    
    const updatedData: Partial<UserData> = {
      name: editFormData.name,
      communityName: editFormData.communityName || undefined,
      email: editFormData.email,
      country: editFormData.country || undefined,
      region: editFormData.region,
      community: editFormData.community || undefined,
      tribe: editFormData.tribe || undefined,
      accountStatus: editFormData.accountStatus
    };

    updateUserData(updatedData);
    const updatedUser = getCurrentUser();
    if (updatedUser) {
      setUserData(updatedUser);
    }
    setIsEditDialogOpen(false);
    alert('Profile updated successfully!');
  };

  const handleChangePassword = () => {
    if (!userData) return;
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordData.currentPassword !== userData.password) {
      alert('Current password is incorrect!');
      return;
    }

    if (updatePassword(userData.email, passwordData.newPassword)) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsPasswordDialogOpen(false);
      alert('Password changed successfully!');
    } else {
      alert('Failed to update password. Please try again.');
    }
  };

  const handleLogout = () => {
    authLogout();
    router.push('/auth/login');
  };

  if (!userData) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar activeItem="Profile" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const profileActions = [
    {
      id: 'edit',
      label: 'Edit Profile',
      icon: Edit,
      onClick: () => setIsEditDialogOpen(true)
    },
    {
      id: 'password',
      label: 'Change Password',
      icon: Lock,
      onClick: () => setIsPasswordDialogOpen(true)
    },
    {
      id: 'contributions',
      label: 'My Contributions',
      icon: FileText,
      onClick: () => router.push('/dashboard/submissions')
    },
    {
      id: 'history',
      label: 'Submission History',
      icon: History,
      onClick: () => router.push('/dashboard/submissions')
    },
    {
      id: 'guidelines',
      label: 'Guidelines / Ethics Policy',
      icon: FileCheck,
      onClick: () => router.push('/dashboard/help')
    },
    {
      id: 'help',
      label: 'Help / Support',
      icon: HelpCircle,
      onClick: () => router.push('/dashboard/help')
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      onClick: handleLogout,
      variant: 'destructive' as const
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeItem="Profile" />

      {/* Main Content */}
      <div className="flex-1" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
            <p className="text-gray-600">Manage your account information and preferences.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile View Info */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Name / Community Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500 mb-2 block">Name</Label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{userData.name || 'Not set'}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 mb-2 block">Community Name</Label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{userData.communityName || 'Not set'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Email ID */}
                  <div>
                    <Label className="text-sm font-medium text-gray-500 mb-2 block">Email ID</Label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{userData.email}</span>
                    </div>
                  </div>

                  {/* Country / Region */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500 mb-2 block">Country</Label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{userData.country || 'Not set'}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 mb-2 block">Region</Label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{userData.region || 'Not set'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Community / Tribe (optional) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500 mb-2 block">Community</Label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{userData.community || 'Not set'}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500 mb-2 block">Tribe (Optional)</Label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{userData.tribe || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div>
                    <Label className="text-sm font-medium text-gray-500 mb-2 block">Account Status</Label>
                    <div className="flex items-center gap-3">
                      {userData.accountStatus === 'active' ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Menu / Actions */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {profileActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={action.id}
                          variant={action.variant || "outline"}
                          className={`w-full justify-start ${
                            action.variant === 'destructive'
                              ? 'text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300'
                              : ''
                          }`}
                          onClick={action.onClick}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {action.label}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="communityName">Community Name</Label>
                <Input
                  id="communityName"
                  value={editFormData.communityName}
                  onChange={(e) => setEditFormData({ ...editFormData, communityName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email ID</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={editFormData.country}
                  onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={editFormData.region}
                  onChange={(e) => setEditFormData({ ...editFormData, region: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="community">Community</Label>
                <Input
                  id="community"
                  value={editFormData.community}
                  onChange={(e) => setEditFormData({ ...editFormData, community: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tribe">Tribe (Optional)</Label>
                <Input
                  id="tribe"
                  value={editFormData.tribe}
                  onChange={(e) => setEditFormData({ ...editFormData, tribe: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleEditProfile}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleChangePassword}>
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;