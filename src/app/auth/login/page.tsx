"use client" ;

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticateUser } from "@/lib/auth";
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof LoginFormData, string>> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const user = authenticateUser(formData.email, formData.password);
      
      if (user) {
        toast.success("Login Successful!", {
          description: "Redirecting to dashboard...",
        });
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        toast.error("Login Failed", {
          description: "Invalid email or password. Please try again.",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="max-w-md mx-auto px-4 py-16">
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Sign In
              </h2>
              <p className="text-gray-600">
                Access your professional account
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="your.email@organization.gov"
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
                <Link href="/auth/forgot" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSubmit}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </Button>
              </div>

              <p className="text-center text-sm text-gray-500 pt-2">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Security Notice:</strong> For your protection, ensure you are accessing this portal from a secure network. Do not share your login credentials with anyone.
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;