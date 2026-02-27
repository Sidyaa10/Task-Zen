'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/home');
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-xl taskzen-card">
        <CardHeader className="text-center p-6 sm:p-8">
          <div className="mb-5 inline-flex items-center justify-center">
            <Rocket className="h-14 w-14 text-[#282623]" />
          </div>
          <CardTitle className="text-4xl font-bold tracking-tight text-[#282623]">TASK-ZEN</CardTitle>
          <CardDescription className="pt-2 text-base text-[#746D6C]">Structured focus. Measurable growth.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pt-0 sm:px-8">
          <p className="text-center text-[#746D6C]">
            Professional event scheduling, progress-based goals, and deadline execution in one calm productivity workspace.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="flex-1" size="lg">
              <Link href="/signup">
                <UserPlus className="mr-2 h-5 w-5" /> Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1" size="lg">
              <Link href="/login">
                <LogIn className="mr-2 h-5 w-5" /> Login
              </Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center p-6 pt-4 text-xs text-[#746D6C] sm:p-8">
          <p>&copy; {new Date().getFullYear()} TASK-ZEN</p>
        </CardFooter>
      </Card>
    </div>
  );
}
