"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  Send,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = () => {
    if (validateEmail()) {
      console.log("Password reset requested for:", email);
      setIsSubmitted(true);
    }
  };

  const handleInputChange = (value: string) => {
    setEmail(value);
    if (error) {
      setError("");
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">

        <main className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-600">
                We've sent password reset instructions to
              </p>
              <p className="text-gray-900 font-medium mt-2">
                {email}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Please check your inbox and click on the password reset link. If you don't see the email, check your spam folder.
              </p>

              <div className="pt-4">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                >
                  Back to Reset Password
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 pt-2">
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Return to Sign In
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> The password reset link will expire in 24 hours. If you need further assistance, contact your system administrator.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="mb-8">
            <Link href="/auth/login" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Sign In
            </Link>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Reset Password
            </h2>
            <p className="text-gray-600">
              Enter your email address and we'll send you instructions to reset your password
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="your.email@organization.gov"
                  value={email}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="w-full pl-10 h-11 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              )}
            </div>

            <div className="pt-4">
              <button
                onClick={handleSubmit}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
                Send Reset Instructions
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 pt-2">
              Remember your password?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Security Notice:</strong> For security reasons, we will not disclose whether this email address exists in our system. If you have trouble accessing your account, contact your system administrator.
          </p>
        </div>
      </main>
    </div>
  );
}