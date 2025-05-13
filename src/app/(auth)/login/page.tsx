
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Mock login logic
    console.log("Login submitted");
    // In a real app, you would call Supabase auth here
    // For now, redirect to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/30">
      <Card className="w-full max-w-lg shadow-xl m-4 sm:m-6">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <Rocket className="h-14 w-14 text-primary" />
          </Link>
          <CardTitle className="text-3xl font-bold">Welcome Back!</CardTitle>
          <CardDescription className="pt-1">Log in to continue to TaskZen.</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full transition-all duration-300 hover:scale-[1.02] hover:shadow-md !mt-8" size="lg">
              <LogIn className="mr-2 h-5 w-5" /> Login
            </Button>
          </form>
        </CardContent>
        <CardContent className="text-center text-sm pt-6">
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

