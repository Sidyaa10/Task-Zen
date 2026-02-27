'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, Clock3, Flag, Layers3, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


type Category = 'event_reminder' | 'skill_development_goal' | 'deadline_project' | 'daily_quick_task';
type Tab = 'scheduled' | 'completed';

type Task = {
  _id: string;
  category: Category;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  timeStart: string;
  timeEnd: string;
  progress: number | null;
  status: 'active' | 'completed';
  priorityLevel: 1 | 2;
  manualPriority: number;
  completedSessions: number;
  totalSessions: number;
};

function categoryAccent(category: Category) {
  switch (category) {
    case 'skill_development_goal':
      return 'border-[#9997BF]/45 bg-[#9997BF]/15';
    case 'deadline_project':
      return 'border-[#ABC1C7]/45 bg-[#ABC1C7]/15';
    default:
      return 'border-[#746D6C]/20 bg-white/65';
  }
}

export default function FocusPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('scheduled');

  const today = new Date().toISOString().slice(0, 10);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/taskzen/tasks?date=${today}&tab=${tab}&page=focus`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load focus board');
      setTasks(data.tasks || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load focus board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [tab]);

  const sorted = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        if (a.endDate !== b.endDate) return a.endDate.localeCompare(b.endDate);
        if (a.timeStart !== b.timeStart) return a.timeStart.localeCompare(b.timeStart);
        return a.manualPriority - b.manualPriority;
      }),
    [tasks]
  );

  const skillGoals = sorted.filter((task) => task.category === 'skill_development_goal');
  const projects = sorted.filter((task) => task.category === 'deadline_project');

  const upcomingDeadline = projects.find((task) => task.status === 'active');

  return (
    <div className="space-y-5 pb-24">
      <Card className="taskzen-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Active Goals
          </CardTitle>
          <CardDescription>Track progress-based goals and project deadlines in one workboard.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#746D6C]/20 bg-white/70 p-4">
            <p className="text-xs text-[#746D6C]">Open Skill Goals</p>
            <p className="text-2xl font-semibold text-[#282623]">{skillGoals.length}</p>
          </div>
          <div className="rounded-2xl border border-[#746D6C]/20 bg-white/70 p-4">
            <p className="text-xs text-[#746D6C]">Open Projects</p>
            <p className="text-2xl font-semibold text-[#282623]">{projects.length}</p>
          </div>
          <div className="rounded-2xl border border-[#746D6C]/20 bg-white/70 p-4">
            <p className="text-xs text-[#746D6C]">Avg Goal Progress</p>
            <p className="text-2xl font-semibold text-[#282623]">
              {skillGoals.length ? Math.round(skillGoals.reduce((acc, task) => acc + (task.progress || 0), 0) / skillGoals.length) : 0}%
            </p>
          </div>
          <div className="rounded-2xl border border-[#746D6C]/20 bg-white/70 p-4">
            <p className="text-xs text-[#746D6C]">Upcoming Deadline</p>
            <p className="text-base font-semibold text-[#282623]">{upcomingDeadline ? upcomingDeadline.endDate : 'None'}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant={tab === 'scheduled' ? 'default' : 'outline'} onClick={() => setTab('scheduled')}>
          Scheduled
        </Button>
        <Button variant={tab === 'completed' ? 'default' : 'outline'} onClick={() => setTab('completed')}>
          Completed
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Clock3 className="h-6 w-6 animate-spin text-[#746D6C]" /></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="taskzen-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Zap className="h-4 w-4" />Skill Development Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {skillGoals.length ? skillGoals.map((task, idx) => (
                <motion.div key={task._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }} className={`rounded-xl border p-3 ${categoryAccent(task.category)}`}>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-[#282623]">{task.title}</h3>
                    <span className="text-xs text-[#746D6C]">{task.completedSessions}/{task.totalSessions}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#746D6C]">{task.description || 'No description'}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E6DFE2]">
                    <motion.div className="h-full bg-[#9997BF]" initial={{ width: 0 }} animate={{ width: `${task.progress || 0}%` }} transition={{ duration: 0.5 }} />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-[#746D6C]">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {task.startDate} to {task.endDate}
                  </div>
                </motion.div>
              )) : <p className="text-sm text-[#746D6C]">No goals in this tab.</p>}
            </CardContent>
          </Card>

          <Card className="taskzen-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Layers3 className="h-4 w-4" />Deadline Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {projects.length ? projects.map((task, idx) => (
                <motion.div key={task._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }} className={`rounded-xl border p-3 ${categoryAccent(task.category)}`}>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-[#282623]">{task.title}</h3>
                    <span className="inline-flex items-center gap-1 text-xs text-[#746D6C]"><Flag className="h-3.5 w-3.5" />{task.endDate}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#746D6C]">{task.description || 'No description'}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E6DFE2]">
                    <motion.div className="h-full bg-[#ABC1C7]" initial={{ width: 0 }} animate={{ width: `${task.progress || 0}%` }} transition={{ duration: 0.5 }} />
                  </div>
                  <p className="mt-2 text-xs text-[#746D6C]">{task.progress || 0}% complete</p>
                </motion.div>
              )) : <p className="text-sm text-[#746D6C]">No projects in this tab.</p>}
            </CardContent>
          </Card>

          {upcomingDeadline ? (
            <Card className="taskzen-card lg:col-span-2 border-[#9997BF]/35">
              <CardContent className="flex items-center justify-between gap-3 py-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#746D6C]">Upcoming major deadline</p>
                  <p className="text-lg font-semibold text-[#282623]">{upcomingDeadline.title}</p>
                  <p className="text-sm text-[#746D6C]">Due on {upcomingDeadline.endDate}</p>
                </div>
                <p className="text-2xl font-semibold text-[#282623]">{upcomingDeadline.progress || 0}%</p>
              </CardContent>
            </Card>
          ) : null}

          {error ? <p className="text-sm text-rose-600 lg:col-span-2">{error}</p> : null}
        </div>
      )}
    </div>
  );
}
