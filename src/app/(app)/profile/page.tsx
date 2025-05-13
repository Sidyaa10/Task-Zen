
"use client";
import type { ReactNode } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Edit3, Mail, Phone, MapPin, Briefcase, BarChart2, Shield, Settings } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// Mock user data - in a real app, this would come from an API or auth context
const userProfile = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  avatarUrl: "https://picsum.photos/seed/alex/200/200",
  title: "Senior Product Manager",
  location: "San Francisco, CA",
  phone: "+1 (555) 123-4567",
  bio: "Passionate about building innovative products that solve real-world problems. Experienced in agile methodologies, user research, and cross-functional team leadership. Always eager to learn and grow.",
  skills: ["Product Strategy", "Agile Development", "UX Research", "Market Analysis", "Team Leadership"],
  recentActivity: [
    { id: "1", action: "Updated task 'Finalize Q3 Roadmap'", timestamp: "2 hours ago" },
    { id: "2", action: "Commented on project 'Website Redesign'", timestamp: "5 hours ago" },
    { id: "3", action: "Completed task 'User Persona Interviews'", timestamp: "1 day ago" },
  ],
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export default function ProfilePage() {
  const { toast } = useToast();

  const handleSaveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Mock save logic
    const formData = new FormData(event.currentTarget);
    const updatedProfile = {
      name: formData.get('name') as string,
      title: formData.get('title') as string,
      location: formData.get('location') as string,
      phone: formData.get('phone') as string,
      bio: formData.get('bio') as string,
    };
    console.log("Saving profile:", updatedProfile);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">View and manage your personal information.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" /> Edit in Settings
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar and Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar className="h-32 w-32 mb-4 border-4 border-primary shadow-md" data-ai-hint="profile picture large">
                <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} />
                <AvatarFallback className="text-4xl">{getInitials(userProfile.name)}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-semibold">{userProfile.name}</h2>
              <p className="text-muted-foreground">{userProfile.title}</p>
              <Button variant="outline" size="sm" className="mt-4">
                <Edit3 className="mr-2 h-4 w-4" /> Change Photo
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center">
                <Mail className="mr-3 h-5 w-5 text-muted-foreground" />
                <span>{userProfile.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="mr-3 h-5 w-5 text-muted-foreground" />
                <span>{userProfile.phone}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-3 h-5 w-5 text-muted-foreground" />
                <span>{userProfile.location}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Editable Details and Activity */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>About Me</CardTitle>
              <CardDescription>This information will be displayed publicly so be careful what you share.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" defaultValue={userProfile.name} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="title">Job Title / Role</Label>
                        <Input id="title" name="title" defaultValue={userProfile.title} />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" name="location" defaultValue={userProfile.location} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" type="tel" defaultValue={userProfile.phone} />
                    </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" name="bio" defaultValue={userProfile.bio} rows={4} placeholder="Tell us about yourself..." />
                </div>
                <Button type="submit">Save Profile</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {userProfile.skills.map((skill) => (
                <span key={skill} className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full shadow-sm">
                  {skill}
                </span>
              ))}
               {userProfile.skills.length === 0 && <p className="text-sm text-muted-foreground">No skills listed.</p>}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions within TaskZen.</CardDescription>
            </CardHeader>
            <CardContent>
              {userProfile.recentActivity.length > 0 ? (
                <ul className="space-y-4">
                  {userProfile.recentActivity.map((activity) => (
                    <li key={activity.id} className="flex items-start">
                      <BarChart2 className="mr-3 mt-1 h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity to display.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

    