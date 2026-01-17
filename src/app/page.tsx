'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, ArrowRight, LogIn } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900 px-4 py-12">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Community Hub
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A platform for volunteers and administrators to collaborate and contribute to the community
          </p>
        </div>

        {/* Login Cards Section */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {/* Volunteer Login Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-2 hover:border-blue-500 dark:hover:border-blue-400">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl mb-2">Volunteer Login</CardTitle>
              <CardDescription className="text-base">
                Access your volunteer dashboard to submit data, track submissions, and contribute to the community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                  Submit and manage data submissions
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                  Track submission status
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                  View your profile and history
                </li>
              </ul>
              <Button asChild className="w-full" size="lg">
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-5 w-5" />
                  Login as Volunteer
                </Link>
              </Button>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Register here
                </Link>
              </p>
            </CardContent>
          </Card>

          {/* Admin Login Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-2 hover:border-purple-500 dark:hover:border-purple-400">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full w-fit">
                <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-2xl mb-2">Admin Login</CardTitle>
              <CardDescription className="text-base">
                Access the administrator dashboard to validate submissions, manage users, and oversee the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-purple-600" />
                  Validate and review submissions
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-purple-600" />
                  Manage volunteers and reports
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-purple-600" />
                  Access admin analytics
                </li>
              </ul>
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white" size="lg">
                <Link href="/auth/admin-auth/login">
                  <Shield className="mr-2 h-5 w-5" />
                  Login as Admin
                </Link>
              </Button>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Need admin access?{' '}
                <Link href="/auth/admin-auth/register" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                  Register here
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Secure platform for community data management and collaboration
          </p>
        </div>
      </div>
    </div>
  );
}
