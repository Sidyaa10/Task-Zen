'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Code2,
  Flag,
  Plus,
  Sparkles,
  TimerReset,
  Trash2,
  Pencil,
  BellRing,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';


type Category = 'event_reminder' | 'skill_development_goal' | 'deadline_project' | 'daily_quick_task';
type Tab = 'scheduled' | 'completed';

type Session = { _id: string; completed: boolean; scheduledDate: string; timeStart: string; timeEnd: string };
type Subtask = { _id: string; title: string; completed: boolean; scheduledDate: string };
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
  subtasks: Subtask[];
  sessions: Session[];
};

type MonthPreview = Record<string, Array<{ id: string; title: string; timeStart: string; category: Category }>>;

function isoDate(date: Date): string {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().slice(0, 10);
}

function addDays(baseIso: string, offset: number): string {
  const d = new Date(`${baseIso}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function toMonthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function categoryMeta(category: Category) {
  switch (category) {
    case 'event_reminder':
      return {
        label: 'Event Reminder',
        color: 'bg-[#ABC1C7]/65 text-[#282623]',
        icon: CalendarDays,
        reminder: '1 day, 2 hours, and 1 hour before',
      };
    case 'skill_development_goal':
      return {
        label: 'Skill Development Goal',
        color: 'bg-[#9997BF]/55 text-[#282623]',
        icon: Code2,
        reminder: 'Before each scheduled session',
      };
    case 'deadline_project':
      return {
        label: 'Deadline Project',
        color: 'bg-[#D0CBE3]/80 text-[#282623]',
        icon: Flag,
        reminder: 'Daily + near-deadline escalation',
      };
    case 'daily_quick_task':
      return {
        label: 'Daily Quick Task',
        color: 'bg-[#ABC1C7]/45 text-[#282623]',
        icon: TimerReset,
        reminder: 'Optional same-day reminder',
      };
  }
}

function buildMonthCells(anchor: Date): Array<{ date: string; day: number; inMonth: boolean }> {
  const start = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1));
  const end = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1, 0));
  const firstWeekDay = start.getUTCDay();

  const cells: Array<{ date: string; day: number; inMonth: boolean }> = [];
  for (let i = 0; i < firstWeekDay; i += 1) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() - (firstWeekDay - i));
    cells.push({ date: d.toISOString().slice(0, 10), day: d.getUTCDate(), inMonth: false });
  }

  for (let day = 1; day <= end.getUTCDate(); day += 1) {
    const d = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), day));
    cells.push({ date: d.toISOString().slice(0, 10), day, inMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const d = new Date(`${cells[cells.length - 1].date}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    cells.push({ date: d.toISOString().slice(0, 10), day: d.getUTCDate(), inMonth: false });
  }

  return cells;
}

export default function HomePage() {
  const todayIso = isoDate(new Date());
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [selectedMonth, setSelectedMonth] = useState(new Date(`${todayIso}T00:00:00.000Z`));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [monthPreview, setMonthPreview] = useState<MonthPreview>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>('scheduled');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [category, setCategory] = useState<Category>('event_reminder');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(todayIso);
  const [endDate, setEndDate] = useState(addDays(todayIso, 30));
  const [timeStart, setTimeStart] = useState('10:00');
  const [timeEnd, setTimeEnd] = useState('11:00');
  const [daysPerWeek, setDaysPerWeek] = useState('3');
  const [hoursPerDay, setHoursPerDay] = useState('2');
  const [subtasksText, setSubtasksText] = useState('');
  const [sameDayReminder, setSameDayReminder] = useState(true);

  const [progressEdit, setProgressEdit] = useState<Record<string, string>>({});

  const dates = useMemo(() => Array.from({ length: 17 }, (_, i) => addDays(selectedDate, i - 4)), [selectedDate]);
  const monthCells = useMemo(() => buildMonthCells(selectedMonth), [selectedMonth]);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/taskzen/tasks?date=${selectedDate}&tab=${tab}&page=home`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load tasks');
      setTasks(data.tasks || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadMonthPreview = async (month = monthKey(selectedMonth)) => {
    try {
      const res = await fetch(`/api/taskzen/calendar/month?month=${month}`, { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) setMonthPreview(data.preview || {});
    } catch {
      // Ignore month preview errors to keep primary task flow responsive.
    }
  };

  useEffect(() => {
    void loadTasks();
  }, [selectedDate, tab]);

  useEffect(() => {
    void loadMonthPreview(monthKey(selectedMonth));
  }, [selectedMonth]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubtasksText('');
    setStartDate(selectedDate);
    setEndDate(addDays(selectedDate, 30));
    setTimeStart('10:00');
    setTimeEnd('11:00');
    setDaysPerWeek('3');
    setHoursPerDay('2');
    setSameDayReminder(true);
    setCategory('event_reminder');
    setEditingTask(null);
  };

  const submitTask = async () => {
    if (!title.trim() || busy) return;
    setBusy(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        category,
        title,
        description,
        startDate,
        endDate: category === 'event_reminder' || category === 'daily_quick_task' ? startDate : endDate,
        timeStart,
        timeEnd,
      };

      if (category === 'skill_development_goal') {
        payload.daysPerWeek = Number(daysPerWeek || '1');
        payload.hoursPerDay = Number(hoursPerDay || '1');
        payload.subtasks = subtasksText.split('\n').map((s) => s.trim()).filter(Boolean);
      }

      if (category === 'deadline_project') {
        payload.subtasks = subtasksText.split('\n').map((s) => s.trim()).filter(Boolean);
      }

      if (category === 'daily_quick_task') {
        payload.reminderSettings = { sameDayReminder };
      }

      const endpoint = editingTask ? `/api/taskzen/tasks/${editingTask._id}` : '/api/taskzen/tasks';
      const method = editingTask ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save task');

      resetForm();
      await loadTasks();
      await loadMonthPreview(monthKey(selectedMonth));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save task');
    } finally {
      setBusy(false);
    }
  };

  const editTask = (task: Task) => {
    setEditingTask(task);
    setCategory(task.category);
    setTitle(task.title);
    setDescription(task.description || '');
    setStartDate(task.startDate);
    setEndDate(task.endDate || task.startDate);
    setTimeStart(task.timeStart);
    setTimeEnd(task.timeEnd);
    if (task.category === 'skill_development_goal') {
      setDaysPerWeek('3');
      setHoursPerDay('2');
    }
    if (task.subtasks?.length) {
      setSubtasksText(task.subtasks.map((st) => st.title).join('\n'));
    }
  };

  const deleteTask = async (taskId: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/taskzen/tasks/${taskId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete task');
      }
      if (editingTask?._id === taskId) resetForm();
      await loadTasks();
      await loadMonthPreview(monthKey(selectedMonth));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete task');
    } finally {
      setBusy(false);
    }
  };

  const markTaskDone = async (taskId: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/taskzen/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to complete task');
      }
      await loadTasks();
      await loadMonthPreview(monthKey(selectedMonth));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to complete task');
    } finally {
      setBusy(false);
    }
  };

  const toggleSession = async (sessionId: string, checked: boolean) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/taskzen/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: checked }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update session');
      }
      await loadTasks();
      await loadMonthPreview(monthKey(selectedMonth));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update session');
    } finally {
      setBusy(false);
    }
  };

  const updateProjectProgress = async (task: Task) => {
    if (task.category !== 'deadline_project') return;
    const parsed = Number(progressEdit[task._id] ?? task.progress ?? 0);
    if (Number.isNaN(parsed)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/taskzen/tasks/${task._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: Math.max(0, Math.min(100, parsed)) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update progress');
      }
      await loadTasks();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update progress');
    } finally {
      setBusy(false);
    }
  };

  const todaySessionsCompleted = tasks
    .flatMap((task) => task.sessions || [])
    .filter((session) => session.scheduledDate === todayIso && session.completed).length;

  return (
    <div className="space-y-5 pb-24">
      <Card className="taskzen-card">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[#282623]">
              <CalendarDays className="h-4 w-4" />
              <Dialog>
                <DialogTrigger asChild>
                  <button className="rounded-full bg-white/80 px-3 py-1 text-base font-semibold shadow-sm transition hover:bg-white">
                    {toMonthLabel(selectedMonth)}
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl rounded-3xl border-[#746D6C]/20 bg-white/90 backdrop-blur-xl">
                  <DialogHeader>
                    <DialogTitle>Month View</DialogTitle>
                    <DialogDescription>Jump to any date and preview scheduled tasks.</DialogDescription>
                  </DialogHeader>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSelectedMonth(new Date(Date.UTC(selectedMonth.getUTCFullYear(), selectedMonth.getUTCMonth() - 1, 1)))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <Input
                        type="month"
                        className="w-[180px]"
                        value={monthKey(selectedMonth)}
                        onChange={(event) => {
                          const [year, month] = event.target.value.split('-').map(Number);
                          if (year && month) setSelectedMonth(new Date(Date.UTC(year, month - 1, 1)));
                        }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSelectedMonth(new Date(Date.UTC(selectedMonth.getUTCFullYear(), selectedMonth.getUTCMonth() + 1, 1)))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center text-xs text-[#746D6C]">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <p key={day}>{day}</p>
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-7 gap-2">
                    {monthCells.map((cell) => {
                      const isSelected = selectedDate === cell.date;
                      const isToday = cell.date === todayIso;
                      const preview = monthPreview[cell.date] || [];
                      return (
                        <button
                          key={cell.date}
                          type="button"
                          onClick={() => {
                            setSelectedDate(cell.date);
                            setSelectedMonth(new Date(`${cell.date}T00:00:00.000Z`));
                          }}
                          className={`min-h-[88px] rounded-xl border p-2 text-left transition ${
                            isSelected
                              ? 'border-[#9997BF] bg-[#D0CBE3]/55'
                              : isToday
                                ? 'border-[#282623]/35 bg-[#ABC1C7]/25'
                                : cell.inMonth
                                  ? 'border-[#746D6C]/20 bg-white/75'
                                  : 'border-transparent bg-[#F5F1F3]/45 text-[#746D6C]/60'
                          }`}
                        >
                          <p className="text-sm font-semibold">{cell.day}</p>
                          {preview.slice(0, 2).map((item) => (
                            <p key={item.id} className="truncate text-[10px] text-[#746D6C]">
                              {item.timeStart} {item.title}
                            </p>
                          ))}
                        </button>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="rounded-full bg-white/65 px-3 py-1 text-xs text-[#746D6C]">
              Today's sessions completed: <span className="font-semibold text-[#282623]">{todaySessionsCompleted}</span>
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {dates.map((dateItem) => {
              const isSelected = dateItem === selectedDate;
              const isToday = dateItem === todayIso;
              return (
                <button
                  key={dateItem}
                  type="button"
                  onClick={() => setSelectedDate(dateItem)}
                  className={`min-w-[74px] rounded-2xl border px-3 py-2 text-left transition ${
                    isSelected
                      ? 'border-[#9997BF] bg-[#D0CBE3]/60 text-[#282623]'
                      : isToday
                        ? 'border-[#282623]/30 bg-[#ABC1C7]/30 text-[#282623]'
                        : 'border-[#746D6C]/20 bg-white/65 text-[#746D6C] hover:bg-[#D0CBE3]/30'
                  }`}
                >
                  <p className="text-[11px] uppercase tracking-wide">{new Date(`${dateItem}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}</p>
                  <p className="text-lg font-semibold">{new Date(`${dateItem}T00:00:00`).getDate()}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="taskzen-card">
        <CardHeader>
          <CardTitle>{editingTask ? 'Edit Task' : 'Create Task'}</CardTitle>
          <CardDescription>Structured input for reminders, goals, projects, and quick tasks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Button variant={category === 'event_reminder' ? 'default' : 'outline'} onClick={() => setCategory('event_reminder')}>Event Reminder</Button>
            <Button variant={category === 'skill_development_goal' ? 'default' : 'outline'} onClick={() => setCategory('skill_development_goal')}>Skill Development Goal</Button>
            <Button variant={category === 'deadline_project' ? 'default' : 'outline'} onClick={() => setCategory('deadline_project')}>Deadline Project</Button>
            <Button variant={category === 'daily_quick_task' ? 'default' : 'outline'} onClick={() => setCategory('daily_quick_task')}>Daily Quick Task</Button>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
            <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short purpose or outcome" />
          </div>
          <div className="grid gap-2 md:grid-cols-4">
            <div className="relative">
              <Input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="pr-10 taskzen-hide-picker-indicator"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full border-2 border-[#282623] bg-white p-0.5">
                <CalendarDays className="h-3.5 w-3.5 text-[#282623]" />
              </span>
            </div>
            {(category === 'skill_development_goal' || category === 'deadline_project') ? (
              <div className="relative">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="pr-10 taskzen-hide-picker-indicator"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full border-2 border-[#282623] bg-white p-0.5">
                  <CalendarDays className="h-3.5 w-3.5 text-[#282623]" />
                </span>
              </div>
            ) : (
              <Input value="Same day" disabled />
            )}
            <div className="relative">
              <Input
                type="time"
                value={timeStart}
                onChange={(event) => setTimeStart(event.target.value)}
                className="pr-10 taskzen-hide-picker-indicator"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full border-2 border-[#282623] bg-white p-0.5">
                <Clock3 className="h-3.5 w-3.5 text-[#282623]" />
              </span>
            </div>
            <div className="relative">
              <Input
                type="time"
                value={timeEnd}
                onChange={(event) => setTimeEnd(event.target.value)}
                className="pr-10 taskzen-hide-picker-indicator"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full border-2 border-[#282623] bg-white p-0.5">
                <Clock3 className="h-3.5 w-3.5 text-[#282623]" />
              </span>
            </div>
          </div>
          {category === 'skill_development_goal' ? (
            <div className="grid gap-2 md:grid-cols-2">
              <Input type="number" min="1" max="7" value={daysPerWeek} onChange={(event) => setDaysPerWeek(event.target.value)} placeholder="Days per week" />
              <Input type="number" min="1" max="12" value={hoursPerDay} onChange={(event) => setHoursPerDay(event.target.value)} placeholder="Hours per day" />
            </div>
          ) : null}
          {(category === 'skill_development_goal' || category === 'deadline_project') ? (
            <Textarea value={subtasksText} onChange={(event) => setSubtasksText(event.target.value)} placeholder="Subtasks, one per line" />
          ) : null}
          {category === 'daily_quick_task' ? (
            <label className="flex items-center gap-2 text-sm text-[#746D6C]">
              <Checkbox checked={sameDayReminder} onCheckedChange={(checked) => setSameDayReminder(checked === true)} />
              Same-day reminder enabled
            </label>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void submitTask()} disabled={busy || !title.trim()}>
              <Plus className="mr-1 h-4 w-4" />
              {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
            {editingTask ? (
              <Button variant="outline" onClick={resetForm}>Cancel Edit</Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant={tab === 'scheduled' ? 'default' : 'outline'} onClick={() => setTab('scheduled')}>Scheduled</Button>
        <Button variant={tab === 'completed' ? 'default' : 'outline'} onClick={() => setTab('completed')}>Completed</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Clock3 className="h-6 w-6 animate-spin text-[#746D6C]" /></div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {tasks.map((task, index) => {
              const meta = categoryMeta(task.category);
              const Icon = meta.icon;
              const isExpanded = expandedTaskId === task._id;
              const daySessions = (task.sessions || []).filter((session) => session.scheduledDate === selectedDate);

              return (
                <motion.div key={task._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ delay: index * 0.03 }}>
                  <Card className="taskzen-card border-[#746D6C]/20">
                    <CardContent className="pt-4">
                      <div className="grid gap-3 lg:grid-cols-[130px,1fr,auto]">
                        <div className="rounded-xl bg-[#F1EDEE] p-3 text-[#282623]">
                          <p className="text-xs uppercase tracking-wide">Time</p>
                          <p className="text-lg font-semibold">{task.timeStart}</p>
                          <p className="text-sm text-[#746D6C]">to {task.timeEnd}</p>
                          <p className="mt-2 text-[11px] text-[#746D6C]">{task.startDate}</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${meta.color}`}>
                              <Icon className="h-3.5 w-3.5" />
                              {meta.label}
                            </span>
                            <span className="rounded-full bg-[#ABC1C7]/35 px-2 py-0.5 text-xs text-[#282623]">
                              {task.priorityLevel === 1 ? 'Primary priority' : 'Secondary priority'}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs text-[#746D6C]">
                              <BellRing className="h-3.5 w-3.5" /> {meta.reminder}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-lg font-semibold text-[#282623]">{task.title}</h3>
                            <button
                              type="button"
                              className="rounded-full bg-white/75 px-2 py-1 text-xs text-[#746D6C] transition hover:bg-white"
                              onClick={() => setExpandedTaskId(isExpanded ? null : task._id)}
                            >
                              {isExpanded ? 'Hide' : 'Expand'}
                            </button>
                          </div>

                          <p className="text-sm text-[#746D6C]">{task.description || 'No description provided.'}</p>

                          {task.progress !== null ? (
                            <div className="space-y-1">
                              <p className="text-xs text-[#746D6C]">
                                Progress {task.progress}% | {task.completedSessions}/{task.totalSessions} sessions
                              </p>
                              <div className="h-2 overflow-hidden rounded-full bg-[#E6DFE2]">
                                <motion.div
                                  className="h-full bg-[#9997BF]"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${task.progress}%` }}
                                  transition={{ duration: 0.55 }}
                                />
                              </div>
                            </div>
                          ) : null}

                          <AnimatePresence>
                            {isExpanded ? (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2 overflow-hidden rounded-xl border border-[#746D6C]/15 bg-white/70 p-3"
                              >
                                {task.category === 'skill_development_goal' ? (
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-[#282623]">Today's sessions</p>
                                    {daySessions.length ? daySessions.map((session) => (
                                      <label key={session._id} className="flex items-center justify-between rounded-lg bg-[#F6F2F4] px-2 py-1 text-sm">
                                        <span>{session.timeStart}-{session.timeEnd}</span>
                                        <Checkbox
                                          checked={session.completed}
                                          onCheckedChange={(checked) => void toggleSession(session._id, checked === true)}
                                        />
                                      </label>
                                    )) : <p className="text-sm text-[#746D6C]">No session scheduled for selected date.</p>}
                                  </div>
                                ) : null}

                                {task.category === 'deadline_project' ? (
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-[#282623]">Manual completion override</p>
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={progressEdit[task._id] ?? String(task.progress ?? 0)}
                                        onChange={(event) =>
                                          setProgressEdit((prev) => ({
                                            ...prev,
                                            [task._id]: event.target.value,
                                          }))
                                        }
                                        className="w-24"
                                      />
                                      <Button size="sm" variant="outline" onClick={() => void updateProjectProgress(task)}>
                                        Save %
                                      </Button>
                                    </div>
                                  </div>
                                ) : null}

                                {task.subtasks?.length ? (
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium text-[#282623]">Subtasks</p>
                                    {task.subtasks.map((subtask) => (
                                      <div key={subtask._id} className="flex items-center justify-between text-sm text-[#746D6C]">
                                        <span>{subtask.title}</span>
                                        <span>{subtask.completed ? 'Done' : 'Pending'}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : null}
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </div>

                        <div className="flex flex-row gap-2 lg:flex-col">
                          {(task.category === 'event_reminder' || task.category === 'daily_quick_task') && task.status === 'active' ? (
                            <Button size="sm" onClick={() => void markTaskDone(task._id)}>
                              <CheckCircle2 className="mr-1 h-4 w-4" />Done
                            </Button>
                          ) : null}
                          <Button size="sm" variant="outline" onClick={() => editTask(task)}>
                            <Pencil className="mr-1 h-4 w-4" />Edit
                          </Button>
                          <Button size="sm" variant="outline" className="text-rose-700" onClick={() => void deleteTask(task._id)}>
                            <Trash2 className="mr-1 h-4 w-4" />Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {!tasks.length ? (
            <Card className="taskzen-card">
              <CardContent className="flex items-center gap-2 py-8 text-sm text-[#746D6C]">
                <Sparkles className="h-4 w-4" />
                No items for this date. Add one from the composer above.
              </CardContent>
            </Card>
          ) : null}

          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
