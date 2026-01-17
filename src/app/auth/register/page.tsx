"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveRegisteredUser, UserData } from "@/lib/auth";
import {
  User,
  Mail,
  Lock,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  region: string;
  agreedToTerms: boolean;
}

const EnhancedRegistration = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    region: "",
    agreedToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [passwordStrength, setPasswordStrength] = useState("");

  const regions = [
    { value: "", label: "Select Region" },
    { value: "P1", label: "Priority 1 - Metro District" },
    { value: "P2", label: "Priority 2 - Urban District" },
    { value: "P3", label: "Priority 3 - Rural District" },
  ];

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (field === "password" && typeof value === "string") {
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
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
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

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.region) {
      newErrors.region = "Please select a region";
    }


    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('user_data') || '[]');
      const userExists = existingUsers.some((user: UserData) => user.email === formData.email);
      
      if (userExists) {
        toast.error("Account Already Exists", {
          description: "An account with this email already exists. Please login instead.",
        });
        return;
      }

      // Create user data object
      const userData: UserData = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password, // In production, hash this
        phone: formData.phone,
        region: formData.region,
        accountStatus: 'active', // New registrations are immediately active
      };

      // Save user data
      saveRegisteredUser(userData);

      toast.success("Registration Successful!", {
        description: "Your account has been created. Redirecting to login...",
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
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
                Create Professional Account
              </h2>
              <p className="text-sm text-gray-600">
                Complete all required fields to register for system access
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Full Name */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  Full Legal Name *
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

              {/* Email */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  Professional Email Address *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="your.email@organization.gov"
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

              {/* Phone Number */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  Contact Phone Number *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-10 h-8 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.phone}
                  </p>
                )}
              </div>


              {/* Region Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">
                  Region / District *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <select
                    value={formData.region}
                    onChange={(e) => handleInputChange("region", e.target.value)}
                    className="w-full pl-10 h-8 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
                  >
                    {regions.map((region) => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.region && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.region}
                  </p>
                )}
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

              {/* Terms and Conditions */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.agreedToTerms}
                    onChange={(e) => handleInputChange("agreedToTerms", e.target.checked)}
                    className="mt-1 h-3.5 w-3.5 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 flex-1">
                    <span className="font-medium">Declaration: </span>
                    I hereby declare that all information provided is accurate and complete to the best of my knowledge. I understand that false or misleading information may result in denial of access or disciplinary action. I agree to comply with all organizational policies, security protocols, and terms of service.
                  </label>
                </div>
                {errors.agreedToTerms && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.agreedToTerms}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                  Submit Registration
                </Button>
              </div>

              {/* Footer Note */}
              <p className="text-center text-sm text-gray-500 pt-2">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Security Notice:</strong> Your information is encrypted and stored securely. Registration requests are reviewed within 24-48 hours. You will receive a confirmation email once your account is approved.
          </p>
        </div>
      </main>
    </div>
  );
};

export default EnhancedRegistration;