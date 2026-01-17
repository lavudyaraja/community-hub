"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveRegisteredAdmin, findAdminByEmail, AdminData } from "@/lib/auth";
import {
  User,
  Mail,
  Lock,
  MapPin,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

interface AdminFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  adminRole: string;
  country: string;
  accessCode: string;
}

const AdminRegistration = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<AdminFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminRole: "",
    country: "",
    accessCode: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof AdminFormData, string>>>({});
  const [passwordStrength, setPasswordStrength] = useState("");

  const adminRoles = [
    { value: "super_admin", label: "Super Admin" },
    { value: "validator_admin", label: "Validator Admin" },
  ];

  const countries = [
    { value: "US", label: "United States" },
    { value: "CA", label: "Canada" },
    { value: "UK", label: "United Kingdom" },
    { value: "AU", label: "Australia" },
    { value: "IN", label: "India" },
    { value: "DE", label: "Germany" },
    { value: "FR", label: "France" },
    { value: "JP", label: "Japan" },
    { value: "CN", label: "China" },
    { value: "BR", label: "Brazil" },
    { value: "MX", label: "Mexico" },
    { value: "ZA", label: "South Africa" },
    { value: "NG", label: "Nigeria" },
    { value: "KE", label: "Kenya" },
    { value: "EG", label: "Egypt" },
    { value: "OTHER", label: "Other" },
  ];

  const handleInputChange = (field: keyof AdminFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (field === "password") {
      checkPasswordStrength(value);
    }
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const checkPasswordStrength = (password: string) => {
    if (password.length === 0) {
      setPasswordStrength("");
      return;
    }
    if (password.length < 6) {
      setPasswordStrength("weak");
    } else if (password.length < 10) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("strong");
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof AdminFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Official email ID is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.adminRole) {
      newErrors.adminRole = "Admin role is required";
    }

    if (!formData.country) {
      newErrors.country = "Country / Region is required";
    }

    if (!formData.accessCode.trim()) {
      newErrors.accessCode = "Admin Access Code is mandatory";
    } else if (formData.accessCode.length < 6) {
      newErrors.accessCode = "Access code must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      // Check if admin already exists in localStorage (quick check)
      const adminExists = findAdminByEmail(formData.email);
      
      if (adminExists) {
        toast.error("Admin Account Already Exists", {
          description: "An admin account with this email already exists. Please login instead.",
        });
        return;
      }

      // Validate access code (in production, this should be validated against a secure backend)
      // For now, we'll use a simple validation
      const accessCodeUpper = formData.accessCode.toUpperCase();
      const accessCodeLower = formData.accessCode.toLowerCase();
      const validAccessCodes = ['ADMIN2024', 'SUPER2024', 'VALIDATOR2024', 'SUPER2024', 'VALIDATOR']; // This should be stored securely
      const validCodesLower = ['super2024', 'validator'];
      
      // Check both uppercase and lowercase versions
      if (!validAccessCodes.includes(accessCodeUpper) && !validCodesLower.includes(accessCodeLower)) {
        toast.error("Invalid Access Code", {
          description: "The provided admin access code is invalid. Please use 'super2024' for Regional Hub or 'validator' for Admin Dashboard.",
        });
        return;
      }

      // Create admin data object
      const adminData = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password, // In production, hash this
        adminRole: formData.adminRole as 'super_admin' | 'validator_admin',
        country: formData.country,
        accountStatus: 'active' as 'active' | 'pending', // Set to 'active' for immediate access (change to 'pending' if approval needed)
      };

      // Save admin data to database
      try {
        const response = await fetch('/api/admin/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(adminData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to register admin');
        }

        const result = await response.json();
        
        // Also save to localStorage for client-side auth
        const localAdminData: AdminData = {
          name: adminData.name,
          email: adminData.email,
          password: adminData.password,
          adminRole: adminData.adminRole,
          country: adminData.country,
          accountStatus: adminData.accountStatus,
          createdAt: new Date().toISOString(),
        };
        saveRegisteredAdmin(localAdminData);

        // Store access code for redirect logic
        const accessCodeLower = formData.accessCode.toLowerCase();
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_code', accessCodeLower);
        }

        // Determine redirect based on access code
        let redirectPath = '/auth/admin-auth/login';
        let redirectMessage = "Your admin account has been created. Redirecting to login...";
        
        if (accessCodeLower === 'super2024') {
          // Auto-login and redirect to regional hub
          if (typeof window !== 'undefined') {
            localStorage.setItem('current_admin', JSON.stringify(localAdminData));
            localStorage.setItem('is_admin_authenticated', 'true');
          }
          redirectPath = '/regional-hub';
          redirectMessage = "Registration successful! Redirecting to Regional Hub...";
        } else if (accessCodeLower === 'validator') {
          // Auto-login and redirect to admin dashboard
          if (typeof window !== 'undefined') {
            localStorage.setItem('current_admin', JSON.stringify(localAdminData));
            localStorage.setItem('is_admin_authenticated', 'true');
          }
          redirectPath = '/admin-dashboard';
          redirectMessage = "Registration successful! Redirecting to Admin Dashboard...";
        }

        toast.success("Admin Registration Successful!", {
          description: redirectMessage,
        });
        
        // Redirect based on access code
        setTimeout(() => {
          router.push(redirectPath);
        }, 2000);
      } catch (error: any) {
        console.error('Error registering admin:', error);
        toast.error("Registration Failed", {
          description: error.message || "Failed to create admin account. Please try again.",
        });
      }
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case "weak":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "strong":
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 py-4">
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            {/* Page Title */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Admin Registration
              </h2>
              <p className="text-sm text-gray-600">
                Restricted / Controlled Access - Complete all required fields to register as an administrator
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Full Name */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  Full Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="pl-10 h-8 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Official Email ID */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  Official Email ID *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="admin@organization.gov"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 h-8 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.email}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Use your official organizational email address
                </p>
              </div>

              {/* Password */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10 h-8 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                {passwordStrength && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${getPasswordStrengthColor()}`}
                          style={{
                            width:
                              passwordStrength === "weak"
                                ? "33%"
                                : passwordStrength === "medium"
                                ? "66%"
                                : "100%",
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 capitalize">
                        {passwordStrength}
                      </span>
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.password}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Minimum 8 characters with letters and numbers
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  Confirm Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10 pr-10 h-8 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Admin Role */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  Admin Role *
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 z-10" />
                  <Select
                    value={formData.adminRole || undefined}
                    onValueChange={(value) => handleInputChange("adminRole", value)}
                  >
                    <SelectTrigger className="pl-10 h-8 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full">
                      <SelectValue placeholder="Select Admin Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {adminRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.adminRole && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.adminRole}
                  </p>
                )}
              </div>

              {/* Country / Region */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  Country / Region *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 z-10" />
                  <Select
                    value={formData.country || undefined}
                    onValueChange={(value) => handleInputChange("country", value)}
                  >
                    <SelectTrigger className="pl-10 h-8 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full">
                      <SelectValue placeholder="Select Country / Region" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.country && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.country}
                  </p>
                )}
              </div>

              {/* Admin Access Code */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  Admin Access Code * (Mandatory)
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter admin access code"
                    value={formData.accessCode}
                    onChange={(e) => handleInputChange("accessCode", e.target.value)}
                    className="pl-10 h-8 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {errors.accessCode && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.accessCode}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Use "super2024" for Regional Hub access or "validator" for Admin Dashboard access
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                  Register Admin
                </Button>
              </div>

              {/* Footer Note */}
              <p className="text-center text-sm text-gray-500 pt-2">
                Already have an admin account?{" "}
                <Link href="/auth/admin-auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-900">
            <strong>Security Notice:</strong> This is a restricted access area. Only authorized personnel with valid admin access codes may register. All registration attempts are logged and monitored. Unauthorized access attempts may result in legal action.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminRegistration;
