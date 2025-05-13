
"use client";

import type { ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Bell, UserCircle, ShieldCheck, Palette, CreditCard, LogOut } from "lucide-react";
import { ThemeToggleButton } from '@/components/theme-toggle-button'; // Assuming this component exists for theme toggling
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function SettingsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    taskUpdates: true,
    mentions: true,
  });

  const handleSaveChanges = (section: string) => {
    // Mock save logic
    console.log(`Saving ${section} settings...`, notifications);
    toast({
      title: "Settings Updated",
      description: `${section} settings have been saved successfully.`,
    });
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({...prev, [key]: !prev[key]}));
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Settings Navigation (Optional - can be tabs or simple sections) */}
        {/* For simplicity, we'll use distinct cards for sections */}

        {/* Profile Settings */}
        <Card className="md:col-span-2 lg:col-span-3 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCircle className="h-6 w-6 text-primary" />
              <CardTitle>Profile</CardTitle>
            </div>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" defaultValue="Zen User" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="user@taskzen.app" disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="zenuser123" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Tell us a little about yourself"
                defaultValue="Focused on productivity and getting things done."
              />
            </div>
            <Button onClick={() => handleSaveChanges('Profile')}>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Account Settings (right sidebar or below) */}
        <div className="md:col-span-2 lg:col-span-1 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <CardTitle>Account Security</CardTitle>
              </div>
              <CardDescription>Manage your password and security options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <Button variant="outline" className="w-full">Change Password</Button>
               <Button variant="outline" className="w-full">Enable Two-Factor Authentication</Button>
               <div className="flex items-center justify-between pt-2">
                    <Label htmlFor="logout-all" className="flex flex-col space-y-1">
                        <span>Log out of all devices</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                        This will log you out of all other active sessions.
                        </span>
                    </Label>
                    <Button variant="destructive" size="sm" onClick={() => toast({title: "Logged out of all devices", variant: "destructive"})}>Log Out All</Button>
                </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Palette className="h-6 w-6 text-primary" />
                    <CardTitle>Appearance</CardTitle>
                </div>
                <CardDescription>Customize the look and feel of the app.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="theme">Theme</Label>
                    <ThemeToggleButton />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en">
                        <SelectTrigger id="language">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={() => handleSaveChanges('Appearance')} className="w-full">Save Appearance</Button>
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings */}
        <Card className="md:col-span-4 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Choose how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                  <span>Email Notifications</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Receive important updates via email.
                  </span>
                </Label>
                <Switch id="email-notifications" checked={notifications.email} onCheckedChange={() => handleNotificationChange('email')} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                  <span>Push Notifications</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Get real-time alerts in your browser or on your device.
                  </span>
                </Label>
                <Switch id="push-notifications" checked={notifications.push} onCheckedChange={() => handleNotificationChange('push')} />
              </div>
              <Separator />
               <div className="flex items-center justify-between">
                <Label htmlFor="task-updates" className="flex flex-col space-y-1">
                  <span>Task Updates</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Notify me about changes to my tasks.
                  </span>
                </Label>
                <Switch id="task-updates" checked={notifications.taskUpdates} onCheckedChange={() => handleNotificationChange('taskUpdates')} />
              </div>
               <Separator />
               <div className="flex items-center justify-between">
                <Label htmlFor="mentions" className="flex flex-col space-y-1">
                  <span>Mentions</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Notify me when someone @mentions me.
                  </span>
                </Label>
                <Switch id="mentions" checked={notifications.mentions} onCheckedChange={() => handleNotificationChange('mentions')} />
              </div>
            </div>
            <Button onClick={() => handleSaveChanges('Notification')}>Save Notification Settings</Button>
          </CardContent>
        </Card>

        {/* Billing/Subscription Settings - Placeholder */}
        <Card className="md:col-span-4 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-primary" />
              <CardTitle>Billing & Subscription</CardTitle>
            </div>
            <CardDescription>Manage your subscription plan and payment methods. (This is a placeholder section)</CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground py-12">
            <p>Billing and subscription management coming soon.</p>
            <Button variant="link" className="mt-2">Learn more about our plans</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    