"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, LogIn, Loader2, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = searchParams.get('callbackUrl') || '/home';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      await refreshUser();
      router.push(callbackUrl);
      router.refresh();
      toast.success('Successfully signed in');
    } catch (err: any) {
      const message = err?.message || 'Failed to sign in';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md taskzen-card">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-2 flex justify-center">
            <Rocket className="h-10 w-10 text-[#282623]" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#282623]">Welcome back</CardTitle>
          <CardDescription className="text-[#746D6C]">
            Enter your credentials to continue in TASK-ZEN
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8 pt-0 sm:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {error ? <div className="rounded-md bg-rose-100 p-4 text-sm text-rose-700">{error}</div> : null}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-[#746D6C]" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-[#746D6C]" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10"
                    autoComplete="current-password"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardContent className="pt-0 text-center text-sm">
          <p>
            Don&apos;t have an account?{" "}
            <Button variant="link" asChild className="px-0">
              <Link href="/signup">Sign up</Link>
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

