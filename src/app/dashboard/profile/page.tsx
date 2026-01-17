"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  X,
  Phone,
  Globe,
  Loader2,
  AlertCircle,
  Shield,
  Calendar,
  Activity
} from 'lucide-react';
import { getCurrentUser, updateUserData, updatePassword, isAuthenticated, logout as authLogout, UserData } from '@/lib/auth';
import { toast } from 'sonner';

const Profile = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [editFormData, setEditFormData] = useState({
    name: '',
    communityName: '',
    email: '',
    phone: '',
    country: '',
    region: '',
    community: '',
    tribe: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    validateAndLoadUser();
  }, [router]);

  const validateAndLoadUser = () => {
    try {
      if (!isAuthenticated()) {
        router.push('/auth/login');
        return;
      }

      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }

      setUserData(currentUser);
      setEditFormData({
        name: currentUser.name || '',
        communityName: currentUser.communityName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        country: currentUser.country || '',
        region: currentUser.region || '',
        community: currentUser.community || '',
        tribe: currentUser.tribe || '',
      });
    } catch (error) {
      console.error('Error loading user:', error);
      toast.error('Failed to load user data');
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };

  const validateEditForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editFormData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!editFormData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!editFormData.region.trim()) {
      newErrors.region = 'Region is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditProfile = async () => {
    if (!validateEditForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSaving(true);
    try {
      const updatedData: Partial<UserData> = {
        name: editFormData.name.trim(),
        communityName: editFormData.communityName.trim() || undefined,
        email: editFormData.email.trim(),
        phone: editFormData.phone.trim() || undefined,
        country: editFormData.country.trim() || undefined,
        region: editFormData.region.trim(),
        community: editFormData.community.trim() || undefined,
        tribe: editFormData.tribe.trim() || undefined,
      };

      updateUserData(updatedData);
      const updatedUser = getCurrentUser();
      
      if (updatedUser) {
        setUserData(updatedUser);
        setIsEditDialogOpen(false);
        setErrors({});
        toast.success('Profile updated successfully!', {
          description: 'Your changes have been saved.'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile', {
        description: 'Please try again later.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!userData) return;

    setIsChangingPassword(true);
    try {
      if (passwordData.currentPassword !== userData.password) {
        setErrors({ currentPassword: 'Current password is incorrect' });
        toast.error('Current password is incorrect');
        setIsChangingPassword(false);
        return;
      }

      if (updatePassword(userData.email, passwordData.newPassword)) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsPasswordDialogOpen(false);
        setErrors({});
        toast.success('Password changed successfully!', {
          description: 'Your password has been updated.'
        });
      } else {
        throw new Error('Failed to update password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password', {
        description: 'Please try again later.'
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    authLogout();
    toast.success('Logged out successfully');
    router.push('/auth/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar activeItem="Profile" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="text-gray-600 font-medium">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const profileActions = [
    {
      id: 'edit',
      label: 'Edit Profile',
      icon: Edit,
      onClick: () => setIsEditDialogOpen(true),
      variant: 'default' as const
    },
    {
      id: 'password',
      label: 'Change Password',
      icon: Lock,
      onClick: () => setIsPasswordDialogOpen(true),
      variant: 'outline' as const
    },
    {
      id: 'contributions',
      label: 'My Contributions',
      icon: FileText,
      onClick: () => router.push('/dashboard/submissions'),
      variant: 'outline' as const
    },
    {
      id: 'history',
      label: 'Submission History',
      icon: History,
      onClick: () => router.push('/dashboard/submissions'),
      variant: 'outline' as const
    },
    {
      id: 'guidelines',
      label: 'Guidelines & Ethics',
      icon: FileCheck,
      onClick: () => router.push('/dashboard/help'),
      variant: 'outline' as const
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      onClick: () => router.push('/dashboard/help'),
      variant: 'outline' as const
    }
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar activeItem="Profile" />

      <div className="flex-1" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
            <p className="text-gray-600">Manage your account information and preferences.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Card */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header Card */}
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <Avatar className="h-24 w-24 ring-4 ring-blue-200 shadow-lg">
                      <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">
                        {getInitials(userData.name || 'User')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {userData.name || 'User'}
                      </h2>
                      <p className="text-gray-600 mb-3">{userData.email}</p>
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        {userData.accountStatus === 'active' ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active Account
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending Verification
                          </Badge>
                        )}
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                          <Shield className="h-3 w-3 mr-1" />
                          Data Contributor
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => setIsEditDialogOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Your personal and contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <Label className="text-xs font-medium text-gray-500">Full Name</Label>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 ml-7">
                        {userData.name || 'Not set'}
                      </p>
                    </div>

                    {/* Community Name */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <Label className="text-xs font-medium text-gray-500">Community Name</Label>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 ml-7">
                        {userData.communityName || 'Not set'}
                      </p>
                    </div>

                    {/* Email */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <Mail className="h-4 w-4 text-red-600" />
                        <Label className="text-xs font-medium text-gray-500">Email Address</Label>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 ml-7 truncate">
                        {userData.email}
                      </p>
                    </div>

                    {/* Phone */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <Phone className="h-4 w-4 text-green-600" />
                        <Label className="text-xs font-medium text-gray-500">Phone Number</Label>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 ml-7">
                        {userData.phone || 'Not set'}
                      </p>
                    </div>

                    {/* Country */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <Globe className="h-4 w-4 text-indigo-600" />
                        <Label className="text-xs font-medium text-gray-500">Country</Label>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 ml-7">
                        {userData.country || 'Not set'}
                      </p>
                    </div>

                    {/* Region */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin className="h-4 w-4 text-orange-600" />
                        <Label className="text-xs font-medium text-gray-500">Region</Label>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 ml-7">
                        {userData.region || 'Not set'}
                      </p>
                    </div>

                    {/* Community */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="h-4 w-4 text-teal-600" />
                        <Label className="text-xs font-medium text-gray-500">Community</Label>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 ml-7">
                        {userData.community || 'Not set'}
                      </p>
                    </div>

                    {/* Tribe */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="h-4 w-4 text-pink-600" />
                        <Label className="text-xs font-medium text-gray-500">Tribe (Optional)</Label>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 ml-7">
                        {userData.tribe || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {profileActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={action.id}
                        variant={action.variant}
                        className="w-full justify-start"
                        onClick={action.onClick}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {action.label}
                      </Button>
                    );
                  })}
                  
                  <Separator className="my-3" />
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </CardContent>
              </Card>

              {/* Account Stats */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    Account Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <Badge variant="secondary">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-sm text-gray-600">Account Status</span>
                    {userData.accountStatus === 'active' ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                        Pending
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Profile
            </DialogTitle>
            <DialogDescription>
              Update your profile information. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="communityName">Community Name</Label>
                <Input
                  id="communityName"
                  value={editFormData.communityName}
                  onChange={(e) => setEditFormData({ ...editFormData, communityName: e.target.value })}
                  placeholder="Enter your community name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                placeholder="Enter your email"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={editFormData.country}
                  onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                  placeholder="Enter your country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region *</Label>
                <Input
                  id="region"
                  value={editFormData.region}
                  onChange={(e) => setEditFormData({ ...editFormData, region: e.target.value })}
                  placeholder="Enter your region"
                  className={errors.region ? 'border-red-500' : ''}
                />
                {errors.region && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.region}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="community">Community</Label>
                <Input
                  id="community"
                  value={editFormData.community}
                  onChange={(e) => setEditFormData({ ...editFormData, community: e.target.value })}
                  placeholder="Enter your community"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tribe">Tribe (Optional)</Label>
                <Input
                  id="tribe"
                  value={editFormData.tribe}
                  onChange={(e) => setEditFormData({ ...editFormData, tribe: e.target.value })}
                  placeholder="Enter your tribe"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setErrors({});
              }}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleEditProfile}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password *</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className={errors.currentPassword ? 'border-red-500' : ''}
              />
              {errors.currentPassword && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.currentPassword}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password *</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Enter new password"
                className={errors.newPassword ? 'border-red-500' : ''}
              />
              {errors.newPassword && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.newPassword}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPasswordDialogOpen(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setErrors({});
              }}
              disabled={isChangingPassword}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;