'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck2, CheckCircle2, Flame, Gauge, Mail, Target, TrendingUp, UserRound } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';


type WeeklyDatum = { label: string; value: number };
type ProfileStats = {
  name: string;
  email: string;
  joinedAt: string;
  totalTasksCompleted: number;
  activeGoals: number;
  completionRate: number;
  productivityStreak: number;
  weekly: WeeklyDatum[];
  monthly: WeeklyDatum[];
};

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/taskzen/profile/stats', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load profile stats');
        setStats(data.stats || null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load profile stats');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const peakWeekly = useMemo(() => Math.max(1, ...(stats?.weekly || []).map((entry) => entry.value)), [stats]);
  const peakMonthly = useMemo(() => Math.max(1, ...(stats?.monthly || []).map((entry) => entry.value)), [stats]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#9997BF] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24">
      <Card className="taskzen-card">
        <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-[#9997BF]/35">
              <AvatarImage src={user?.profilePicture || undefined} alt={stats?.name || 'User avatar'} />
              <AvatarFallback>{initials(stats?.name || user?.name || 'TZ')}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-[#282623]">{stats?.name || user?.name || 'Task-Zen User'}</h2>
              <p className="flex items-center gap-1 text-sm text-[#746D6C]"><Mail className="h-4 w-4" />{stats?.email || user?.email || 'No email set'}</p>
              <p className="mt-1 text-xs text-[#746D6C]">Joined {new Date(stats?.joinedAt || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>
          <p className="rounded-full bg-white/70 px-3 py-1 text-xs text-[#746D6C]">Profile dashboard synced with your account data</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="taskzen-card">
          <CardContent className="pt-5">
            <p className="text-xs text-[#746D6C]">Total Tasks Completed</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-[#282623]"><CheckCircle2 className="h-5 w-5" />{stats?.totalTasksCompleted || 0}</p>
          </CardContent>
        </Card>
        <Card className="taskzen-card">
          <CardContent className="pt-5">
            <p className="text-xs text-[#746D6C]">Active Goals</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-[#282623]"><Target className="h-5 w-5" />{stats?.activeGoals || 0}</p>
          </CardContent>
        </Card>
        <Card className="taskzen-card">
          <CardContent className="pt-5">
            <p className="text-xs text-[#746D6C]">Completion Rate</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-[#282623]"><Gauge className="h-5 w-5" />{stats?.completionRate || 0}%</p>
          </CardContent>
        </Card>
        <Card className="taskzen-card">
          <CardContent className="pt-5">
            <p className="text-xs text-[#746D6C]">Productivity Streak</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-[#282623]"><Flame className="h-5 w-5" />{stats?.productivityStreak || 0} days</p>
          </CardContent>
        </Card>
      </div>

      <Card className="taskzen-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" />Weekly Productivity Graph</CardTitle>
          <CardDescription>Completed sessions over the last 7 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-3">
            {(stats?.weekly || []).map((entry) => (
              <div key={entry.label} className="flex flex-col items-center gap-2">
                <div className="flex h-32 w-full items-end rounded-xl bg-[#F2ECF0] px-1 py-1">
                  <motion.div
                    className="w-full rounded-lg bg-gradient-to-t from-[#9997BF] to-[#ABC1C7]"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(8, Math.round((entry.value / peakWeekly) * 100))}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-[#746D6C]">{entry.label}</p>
                <p className="text-sm font-semibold text-[#282623]">{entry.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="taskzen-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" />Monthly Productivity Graph</CardTitle>
          <CardDescription>Completed sessions across the last 6 months.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3">
            {(stats?.monthly || []).map((entry) => (
              <div key={entry.label} className="flex flex-col items-center gap-2">
                <div className="flex h-32 w-full items-end rounded-xl bg-[#F2ECF0] px-1 py-1">
                  <motion.div
                    className="w-full rounded-lg bg-gradient-to-t from-[#282623] to-[#9997BF]"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(8, Math.round((entry.value / peakMonthly) * 100))}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-[#746D6C]">{entry.label}</p>
                <p className="text-sm font-semibold text-[#282623]">{entry.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="taskzen-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarCheck2 className="h-4 w-4" />Account Snapshot</CardTitle>
          <CardDescription>Current profile configuration and account visibility.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-[#746D6C]/20 bg-white/70 p-3">
            <p className="text-xs text-[#746D6C]">Display name</p>
            <p className="text-sm font-medium text-[#282623]">{stats?.name || user?.name || 'Not set'}</p>
          </div>
          <div className="rounded-xl border border-[#746D6C]/20 bg-white/70 p-3">
            <p className="text-xs text-[#746D6C]">Email address</p>
            <p className="text-sm font-medium text-[#282623]">{stats?.email || user?.email || 'Not set'}</p>
          </div>
          <div className="rounded-xl border border-[#746D6C]/20 bg-white/70 p-3">
            <p className="text-xs text-[#746D6C]">Account type</p>
            <p className="flex items-center gap-1 text-sm font-medium text-[#282623]"><UserRound className="h-4 w-4" />Standard</p>
          </div>
          <div className="rounded-xl border border-[#746D6C]/20 bg-white/70 p-3">
            <p className="text-xs text-[#746D6C]">System status</p>
            <p className="text-sm font-medium text-[#282623]">Synced</p>
          </div>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
