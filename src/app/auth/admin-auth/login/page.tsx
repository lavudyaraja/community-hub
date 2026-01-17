"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticateAdmin } from "@/lib/auth";
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";

interface AdminLoginFormData {
  email: string;
  password: string;
  adminCode: string;
  rememberMe: boolean;
}

const AdminLoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<AdminLoginFormData>({
    email: "",
    password: "",
    adminCode: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof AdminLoginFormData, string>>>({});

  const handleInputChange = (field: keyof AdminLoginFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof AdminLoginFormData, string>> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (!formData.adminCode.trim()) {
      newErrors.adminCode = "Admin code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Validate admin code first
      const adminCode = formData.adminCode.trim().toLowerCase();
      const validCodes = ['super2024', 'validator'];
      
      if (!validCodes.includes(adminCode)) {
        toast.error("Invalid Admin Code", {
          description: "Please enter a valid admin code (super2024 or validator).",
        });
        return;
      }

      const admin = authenticateAdmin(formData.email, formData.password);
      
      if (admin) {
        // Store admin code in localStorage for future reference
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_code', adminCode);
        }

        // Determine redirect based on admin code
        let redirectPath = '/admin-dashboard';
        let redirectMessage = "Redirecting to admin dashboard...";
        
        if (adminCode === 'super2024') {
          redirectPath = '/regional-hub';
          redirectMessage = "Redirecting to regional hub...";
        } else if (adminCode === 'validator') {
          redirectPath = '/admin-dashboard';
          redirectMessage = "Redirecting to admin dashboard...";
        }

        toast.success("Admin Login Successful!", {
          description: redirectMessage,
        });
        
        setTimeout(() => {
          router.push(redirectPath);
        }, 1500);
      } else {
        // Check if admin exists but is pending
        const admins = JSON.parse(localStorage.getItem('admin_data') || '[]');
        const adminExists = admins.find((a: any) => a.email === formData.email);
        
        if (adminExists && adminExists.accountStatus === 'pending') {
          toast.warning("Account Pending", {
            description: "Your admin account is pending approval. Please contact system administrator.",
          });
        } else {
          toast.error("Login Failed", {
            description: "Invalid email or password. Please try again.",
          });
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-md mx-auto px-4 py-16">
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-8">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Admin Sign In
                </h2>
              </div>
              <p className="text-gray-600">
                Access your administrator account
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Official Email ID
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="admin@organization.gov"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Admin Code *
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter admin code (super2024 or validator)"
                    value={formData.adminCode}
                    onChange={(e) => handleInputChange("adminCode", e.target.value)}
                    className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {errors.adminCode && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.adminCode}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Use "super2024" for Regional Hub or "validator" for Admin Dashboard
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={formData.rememberMe}
                    onChange={(e) => handleInputChange("rememberMe", e.target.checked)}
                    className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <Link href="/auth/admin-auth/forgot" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSubmit}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In as Admin
                </Button>
              </div>

              <p className="text-center text-sm text-gray-500 pt-2">
                Don't have an admin account?{" "}
                <Link href="/auth/admin-auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-900">
            <strong>Security Notice:</strong> This is a restricted access area for authorized administrators only. All login attempts are logged and monitored. Unauthorized access attempts may result in legal action.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminLoginPage;
