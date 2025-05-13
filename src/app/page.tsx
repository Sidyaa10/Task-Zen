
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-6 sm:p-8">
      <Card className="w-full max-w-md shadow-2xl animate-fadeInDown">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <Rocket className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold">TaskZen</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            Elevate Your Productivity. Simply.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-foreground/80">
            TaskZen helps you organize your life and work with an elegant, minimal interface. Inspired by the best, built for focus.
          </p>
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <Button asChild className="flex-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg" size="lg">
              <Link href="/signup">
                <UserPlus className="mr-2 h-5 w-5" /> Get Started
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg" size="lg">
              <Link href="/login">
                <LogIn className="mr-2 h-5 w-5" /> Login
              </Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TaskZen. All rights reserved.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
