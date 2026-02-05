"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PunchlyWordmark } from "@/components/brand/logo";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { signup } from "@/lib/actions/auth";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const result = await signup(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex justify-center mb-12">
          <PunchlyWordmark />
        </Link>

        <div className="border border-zinc-200 rounded-xl p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">
              Create Account
            </h1>
            <p className="text-sm text-zinc-600">
              Sign up to join your team
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="full_name" className="mb-2 block">
                Full Name
              </Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="John Smith"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="email" className="mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@company.com"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="password" className="mb-2 block">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                minLength={6}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="role" className="mb-2 block">
                Role
              </Label>
              <select
                id="role"
                name="role"
                required
                disabled={isLoading}
                className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="engineer">Engineer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-zinc-600 hover:text-slate-900 transition-colors"
            >
              Already have an account? <span className="underline">Sign in</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
