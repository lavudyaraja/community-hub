"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AdminSidebar } from '../components/sidebar';
import {
  User,
  Mail,
  MapPin,
  Shield,
  Calendar,
  Edit,
  Lock,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  Settings,
  Activity,
  LogOut,
  Save,
  X,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { getCurrentAdmin, isAdminAuthenticated, logoutAdmin, AdminData } from '@/lib/auth';
import { toast } from 'sonner';

const AdminProfile = () => {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    country: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    validateAndLoadAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateAndLoadAdmin = () => {
    try {
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
      setEditFormData({
        name: currentAdmin.name || '',
        email: currentAdmin.email || '',
        country: currentAdmin.country || '',
      });
    } catch (error) {
      console.error('Error loading admin:', error);
      toast.error('Failed to load admin data');
      router.push('/auth/admin-auth/login');
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
      // In a real app, you would call an API here
      // For now, we'll just update local storage
      const updatedAdmin: AdminData = {
        ...admin!,
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        country: editFormData.country.trim() || admin!.country || '',
      };

      localStorage.setItem('adminData', JSON.stringify(updatedAdmin));
      setAdmin(updatedAdmin);
      setIsEditDialogOpen(false);
      setErrors({});
      toast.success('Profile updated successfully!', {
        description: 'Your changes have been saved.'
      });
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

    setIsChangingPassword(true);
    try {
      // In a real app, you would call an API here
      toast.success('Password changed successfully!', {
        description: 'Your password has been updated.'
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsPasswordDialogOpen(false);
      setErrors({});
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
    logoutAdmin();
    toast.success('Logged out successfully');
    router.push('/auth/admin-auth/login');
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
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
        <AdminSidebar activeItem="Profile" />
        <div className="flex-1 flex items-center justify-center" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-gray-600 font-medium">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!admin) {
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
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      onClick: () => router.push('/admin-dashboard/settings'),
      variant: 'outline' as const
    }
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <AdminSidebar activeItem="Profile" />

      <div className="flex-1" style={{ marginLeft: 'var(--admin-sidebar-width, 256px)' }}>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Profile</h1>
            <p className="text-gray-600">Manage your administrator account and preferences.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Card */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header Card */}
              <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <Avatar className="h-24 w-24 ring-4 ring-indigo-200">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-2xl font-bold">
                        {getInitials(admin.name || 'Admin')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {admin.name || 'Admin'}
                      </h2>
                      <p className="text-gray-600 mb-3">{admin.email}</p>
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        {admin.accountStatus === 'active' ? (
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
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 border-indigo-200">
                          <Shield className="h-3 w-3 mr-1" />
                          {admin.adminRole?.replace('_', ' ') || 'Administrator'}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => setIsEditDialogOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700"
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
                    <User className="h-5 w-5 text-indigo-600" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Your personal and account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="h-4 w-4 text-indigo-600" />
                        <Label className="text-xs font-medium text-gray-500">Full Name</Label>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 ml-7">
                        {admin.name || 'Not set'}
                      </p>
                    </div>

                    {/* Email */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <Mail className="h-4 w-4 text-red-600" />
                        <Label className="text-xs font-medium text-gray-500">Email Address</Label>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 ml-7 truncate">
                        {admin.email || 'Not set'}
                      </p>
                    </div>

                    {/* Country */}
                    {admin.country && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <MapPin className="h-4 w-4 text-purple-600" />
                          <Label className="text-xs font-medium text-gray-500">Country / Region</Label>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 ml-7">
                          {admin.country}
                        </p>
                      </div>
                    )}

                    {/* Account Status */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <Label className="text-xs font-medium text-gray-500">Account Status</Label>
                      </div>
                      <Badge className={`ml-7 ${admin.accountStatus === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                        {(admin.accountStatus || 'pending').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-indigo-600" />
                    Account Security
                  </CardTitle>
                  <CardDescription>Manage your account security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-indigo-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Password</p>
                        <p className="text-xs text-gray-500">Last updated: Never</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsPasswordDialogOpen(true)}>
                      Change Password
                    </Button>
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
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-indigo-600" />
                    Account Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <Badge variant="secondary">
                      <Calendar className="h-3 w-3 mr-1" />
                      {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-sm text-gray-600">Account Status</span>
                    {admin.accountStatus === 'active' ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                        Pending
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <span className="text-sm text-gray-600">Access Level</span>
                    <Badge className={admin.adminRole === 'super_admin' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-purple-100 text-purple-800 border-purple-200'}>
                      {admin.adminRole === 'super_admin' ? 'Full Access' : 'Validator Access'}
                    </Badge>
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
              <Label htmlFor="country">Country / Region</Label>
              <Input
                id="country"
                value={editFormData.country}
                onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                placeholder="Enter your country"
              />
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
              className="bg-indigo-600 hover:bg-indigo-700"
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
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className={errors.currentPassword ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
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
              className="bg-indigo-600 hover:bg-indigo-700"
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

export default AdminProfile;
