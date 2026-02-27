import { ObjectId } from 'mongodb';
import { getDb } from '@/server/db/mongo';
import {
  SessionDocument,
  SubtaskDocument,
  TabType,
  TaskCategory,
  TaskCreateInput,
  TaskDocument,
  TaskStatus,
  TaskUpdateInput,
} from '@/lib/taskzen-types';

const TASKS_COLLECTION = 'tasks';
const SUBTASKS_COLLECTION = 'subtasks';
const SESSIONS_COLLECTION = 'sessions';
const USERS_COLLECTION = 'users';
let taskIndexesReady = false;

function nowIso() {
  return new Date().toISOString();
}

function toIsoDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid date');
  return date.toISOString().slice(0, 10);
}

function toTime(value: string): string {
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) {
    throw new Error('Invalid time format');
  }
  return value;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function compareDateStrings(a: string, b: string): number {
  return a.localeCompare(b);
}

function isGoalCategory(category: TaskCategory): boolean {
  return category === 'skill_development_goal' || category === 'deadline_project';
}

async function db() {
  return getDb();
}

async function ensureTaskIndexes(): Promise<void> {
  if (taskIndexesReady) return;
  const database = await db();
  await database.collection(TASKS_COLLECTION).createIndexes([
    { key: { userId: 1, status: 1, category: 1 }, name: 'tasks_user_status_category' },
    { key: { userId: 1, startDate: 1, endDate: 1 }, name: 'tasks_user_date_range' },
    { key: { userId: 1, createdAt: -1 }, name: 'tasks_user_created_at' },
  ]);
  await database.collection(SUBTASKS_COLLECTION).createIndexes([
    { key: { userId: 1, parentTaskId: 1 }, name: 'subtasks_user_parent' },
    { key: { userId: 1, scheduledDate: 1 }, name: 'subtasks_user_scheduled_date' },
  ]);
  await database.collection(SESSIONS_COLLECTION).createIndexes([
    { key: { userId: 1, parentTaskId: 1 }, name: 'sessions_user_parent' },
    { key: { userId: 1, scheduledDate: 1, completed: 1 }, name: 'sessions_user_date_completed' },
  ]);
  taskIndexesReady = true;
}

function computePriorityLevel(startDate: string): 1 | 2 {
  const today = nowIso().slice(0, 10);
  return compareDateStrings(startDate, today) > 0 ? 1 : 2;
}

function minutesDiff(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

function weekdaysFromCount(daysPerWeek: number): number[] {
  const safe = clamp(Math.floor(daysPerWeek), 1, 7);
  return Array.from({ length: safe }, (_, i) => i + 1);
}

function getIsoDay(date: Date): number {
  const d = date.getUTCDay();
  return d === 0 ? 7 : d;
}

function spreadScheduleDates(startDate: string, endDate: string, daysPerWeek: number, count: number): string[] {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  if (start > end) throw new Error('Start date must be before end date');
  const weekdays = weekdaysFromCount(daysPerWeek);
  const out: string[] = [];
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    if (weekdays.includes(getIsoDay(d))) out.push(d.toISOString().slice(0, 10));
    if (out.length >= count) break;
  }
  if (out.length < count) throw new Error('Date range and days/week are insufficient for all subtasks');
  return out;
}

async function computeAndPersistProgress(userId: string, taskId: string): Promise<void> {
  const database = await db();
  const taskObjectId = new ObjectId(taskId);
  const task = await database.collection<TaskDocument>(TASKS_COLLECTION).findOne({
    _id: taskObjectId as any,
    userId,
  });
  if (!task) throw new Error('Task not found');

  let progress: number | null = null;
  let totalSessions = 0;
  let completedSessions = 0;

  if (task.category === 'skill_development_goal') {
    totalSessions = await database.collection<SessionDocument>(SESSIONS_COLLECTION).countDocuments({ parentTaskId: taskId, userId });
    completedSessions = await database
      .collection<SessionDocument>(SESSIONS_COLLECTION)
      .countDocuments({ parentTaskId: taskId, userId, completed: true });
    progress = totalSessions === 0 ? 0 : Number(((completedSessions / totalSessions) * 100).toFixed(2));
  } else if (task.category === 'deadline_project') {
    const subtaskTotal = await database.collection<SubtaskDocument>(SUBTASKS_COLLECTION).countDocuments({ parentTaskId: taskId, userId });
    const subtaskDone = await database
      .collection<SubtaskDocument>(SUBTASKS_COLLECTION)
      .countDocuments({ parentTaskId: taskId, userId, completed: true });
    totalSessions = subtaskTotal;
    completedSessions = subtaskDone;
    progress = subtaskTotal === 0 ? clamp(task.progress ?? 0, 0, 100) : Number(((subtaskDone / subtaskTotal) * 100).toFixed(2));
  }

  const status: TaskStatus =
    isGoalCategory(task.category) && progress !== null && progress >= 100 ? 'completed' : task.status === 'completed' ? 'completed' : 'active';

  await database.collection<TaskDocument>(TASKS_COLLECTION).updateOne(
    { _id: taskObjectId as any, userId },
    {
      $set: {
        progress,
        totalSessions,
        completedSessions,
        status,
        completedAt: status === 'completed' ? task.completedAt || nowIso() : null,
        updatedAt: nowIso(),
      },
    }
  );
}

export async function createTask(userId: string, input: TaskCreateInput) {
  await ensureTaskIndexes();
  const category = input.category;
  if (!category) throw new Error('Category is required');

  const title = input.title?.trim();
  if (!title) throw new Error('Title is required');

  const startDate = toIsoDate(input.startDate);
  const requestedEndDate = toIsoDate(input.endDate || input.startDate);
  const endDate =
    category === 'event_reminder' || category === 'daily_quick_task'
      ? startDate
      : requestedEndDate;
  const timeStart = toTime(input.timeStart);
  const timeEnd = toTime(input.timeEnd);
  if (minutesDiff(timeStart, timeEnd) <= 0) throw new Error('End time must be after start time');
  if ((category === 'skill_development_goal' || category === 'deadline_project') && endDate < startDate) {
    throw new Error('End date must be on or after start date');
  }
  if (category === 'skill_development_goal') {
    if (!input.daysPerWeek || input.daysPerWeek < 1 || input.daysPerWeek > 7) {
      throw new Error('Days per week must be between 1 and 7');
    }
    if (!input.hoursPerDay || input.hoursPerDay < 1) {
      throw new Error('Hours per day must be at least 1');
    }
  }

  const createdAt = nowIso();
  const priorityLevel = computePriorityLevel(startDate);
  const manualPriority = 1000 + priorityLevel;

  const defaultsByCategory = {
    event_reminder: { oneDayBefore: true, twoHoursBefore: true, oneHourBefore: true },
    daily_quick_task: { sameDayReminder: true },
    skill_development_goal: { beforeSessionMinutes: 30 },
    deadline_project: { dailyBeforeDeadline: true, extraNearDeadline: true },
  };

  const reminderSettings = {
    ...defaultsByCategory[category],
    ...(input.reminderSettings || {}),
  };

  const doc: Omit<TaskDocument, '_id'> = {
    userId,
    taskType: category,
    category,
    title,
    description: input.description?.trim() || '',
    startDate,
    endDate,
    deadline: category === 'deadline_project' ? endDate : null,
    timeStart,
    timeEnd,
    priorityLevel,
    manualPriority,
    progress: isGoalCategory(category) ? 0 : null,
    totalSessions: 0,
    completedSessions: 0,
    reminderSettings,
    daysPerWeek: category === 'skill_development_goal' ? clamp(input.daysPerWeek || 1, 1, 7) : undefined,
    hoursPerDay: category === 'skill_development_goal' ? Math.max(1, Math.floor(input.hoursPerDay || 1)) : undefined,
    status: 'active',
    completedAt: null,
    createdAt,
    updatedAt: createdAt,
  };

  const database = await db();
  const result = await database.collection(TASKS_COLLECTION).insertOne(doc as any);
  const taskId = result.insertedId.toString();

  if (category === 'skill_development_goal') {
    const subtasks = (input.subtasks || []).map((s) => s.trim()).filter(Boolean);
    if (subtasks.length === 0) throw new Error('Skill Development Goal requires upfront subtasks');
    const dates = spreadScheduleDates(startDate, endDate, doc.daysPerWeek || 1, subtasks.length);
    const records = subtasks.map((titleText, idx) => ({
      userId,
      parentTaskId: taskId,
      title: titleText,
      scheduledDate: dates[idx],
      completed: false,
      completedAt: null,
      createdAt,
      updatedAt: createdAt,
    }));
    const sessionRecords = records.map((r) => ({
      userId,
      parentTaskId: taskId,
      subtaskId: null,
      date: r.scheduledDate,
      scheduledDate: r.scheduledDate,
      timeStart,
      timeEnd,
      duration: minutesDiff(timeStart, timeEnd),
      completed: false,
      completedAt: null,
      createdAt,
      updatedAt: createdAt,
    }));
    await database.collection(SUBTASKS_COLLECTION).insertMany(records as any[]);
    await database.collection(SESSIONS_COLLECTION).insertMany(sessionRecords as any[]);
  }

  if (category === 'deadline_project') {
    const subtasks = (input.subtasks || []).map((s) => s.trim()).filter(Boolean);
    if (subtasks.length > 0) {
      const records = subtasks.map((titleText) => ({
        userId,
        parentTaskId: taskId,
        title: titleText,
        scheduledDate: startDate,
        completed: false,
        completedAt: null,
        createdAt,
        updatedAt: createdAt,
      }));
      await database.collection(SUBTASKS_COLLECTION).insertMany(records as any[]);
    }
  }

  await computeAndPersistProgress(userId, taskId);
  return getTaskWithChildren(userId, taskId);
}

export async function listTasksForDate(userId: string, date: string, tab: TabType, page: 'home' | 'focus') {
  await ensureTaskIndexes();
  const selectedDate = toIsoDate(date);
  const database = await db();

  const baseFilter: any = { userId };
  if (tab === 'completed') {
    baseFilter.status = 'completed';
    baseFilter.category = { $in: ['skill_development_goal', 'deadline_project'] };
  } else {
    baseFilter.status = 'active';
  }

  if (page === 'focus') {
    baseFilter.category = { $in: ['skill_development_goal', 'deadline_project'] };
  }

  const tasks = await database.collection<TaskDocument>(TASKS_COLLECTION).find(baseFilter).toArray();
  const taskIds = tasks.map((t: any) => t._id.toString());

  const subtasks = taskIds.length
    ? await database.collection<SubtaskDocument>(SUBTASKS_COLLECTION).find({ userId, parentTaskId: { $in: taskIds } } as any).toArray()
    : [];
  const sessions = taskIds.length
    ? await database.collection<SessionDocument>(SESSIONS_COLLECTION).find({ userId, parentTaskId: { $in: taskIds } } as any).toArray()
    : [];

  const subtasksByTask = new Map<string, SubtaskDocument[]>();
  subtasks.forEach((s: any) => {
    const key = s.parentTaskId;
    const list = subtasksByTask.get(key) || [];
    list.push({ ...s, _id: s._id.toString() });
    subtasksByTask.set(key, list);
  });

  const sessionsByTask = new Map<string, SessionDocument[]>();
  sessions.forEach((s: any) => {
    const key = s.parentTaskId;
    const list = sessionsByTask.get(key) || [];
    list.push({ ...s, _id: s._id.toString() });
    sessionsByTask.set(key, list);
  });

  const filtered = tasks.filter((task: any) => {
    const taskId = task._id.toString();
    if (page === 'focus') return true;
    if (task.category === 'event_reminder' || task.category === 'daily_quick_task') {
      return task.startDate === selectedDate;
    }
    const taskSessions = sessionsByTask.get(taskId) || [];
    const taskSubtasks = subtasksByTask.get(taskId) || [];
    return taskSessions.some((s) => s.scheduledDate === selectedDate) || taskSubtasks.some((s) => s.scheduledDate === selectedDate);
  });

  return filtered
    .map((task: any) => ({
      ...task,
      _id: task._id.toString(),
      subtasks: subtasksByTask.get(task._id.toString()) || [],
      sessions: sessionsByTask.get(task._id.toString()) || [],
    }))
    .sort((a, b) => {
      if (a.timeStart !== b.timeStart) return a.timeStart.localeCompare(b.timeStart);
      return a.manualPriority - b.manualPriority;
    });
}

export async function getTaskWithChildren(userId: string, taskId: string) {
  const database = await db();
  const task = await database.collection<TaskDocument>(TASKS_COLLECTION).findOne({ _id: new ObjectId(taskId) as any, userId } as any);
  if (!task) throw new Error('Task not found');
  const subtasks = await database
    .collection<SubtaskDocument>(SUBTASKS_COLLECTION)
    .find({ userId, parentTaskId: taskId } as any)
    .toArray();
  const sessions = await database
    .collection<SessionDocument>(SESSIONS_COLLECTION)
    .find({ userId, parentTaskId: taskId } as any)
    .toArray();
  return {
    ...task,
    _id: task._id.toString(),
    subtasks: subtasks.map((s: any) => ({ ...s, _id: s._id.toString() })),
    sessions: sessions.map((s: any) => ({ ...s, _id: s._id.toString() })),
  };
}

export async function updateTask(userId: string, taskId: string, input: TaskUpdateInput) {
  const database = await db();
  const current = await database.collection<TaskDocument>(TASKS_COLLECTION).findOne({ _id: new ObjectId(taskId) as any, userId } as any);
  if (!current) throw new Error('Task not found');

  const update: Partial<TaskDocument> = { updatedAt: nowIso() };
  if (typeof input.title === 'string') update.title = input.title.trim();
  if (typeof input.description === 'string') update.description = input.description.trim();
  if (typeof input.startDate === 'string') update.startDate = toIsoDate(input.startDate);
  if (typeof input.endDate === 'string') update.endDate = toIsoDate(input.endDate);
  if (typeof input.timeStart === 'string') update.timeStart = toTime(input.timeStart);
  if (typeof input.timeEnd === 'string') update.timeEnd = toTime(input.timeEnd);
  if (typeof input.manualPriority === 'number') update.manualPriority = Math.max(1, Math.floor(input.manualPriority));
  if (typeof input.progress === 'number' && current.category === 'deadline_project') update.progress = clamp(input.progress, 0, 100);
  if (typeof input.status === 'string') {
    update.status = input.status;
    update.completedAt = input.status === 'completed' ? nowIso() : null;
    if (current.category === 'event_reminder' || current.category === 'daily_quick_task') {
      update.progress = null;
    }
  }
  if (input.reminderSettings) update.reminderSettings = { ...current.reminderSettings, ...input.reminderSettings };
  if (update.endDate && current.category === 'deadline_project') update.deadline = update.endDate;

  await database.collection<TaskDocument>(TASKS_COLLECTION).updateOne(
    { _id: new ObjectId(taskId) as any, userId } as any,
    { $set: update as any }
  );

  await computeAndPersistProgress(userId, taskId);
  return getTaskWithChildren(userId, taskId);
}

export async function deleteTask(userId: string, taskId: string) {
  const database = await db();
  await database.collection(SUBTASKS_COLLECTION).deleteMany({ userId, parentTaskId: taskId } as any);
  await database.collection(SESSIONS_COLLECTION).deleteMany({ userId, parentTaskId: taskId } as any);
  const result = await database.collection(TASKS_COLLECTION).deleteOne({ _id: new ObjectId(taskId) as any, userId } as any);
  if (!result.deletedCount) throw new Error('Task not found');
}

export async function createSubtask(userId: string, taskId: string, title: string, scheduledDate: string) {
  const database = await db();
  const task = await database.collection<TaskDocument>(TASKS_COLLECTION).findOne({ _id: new ObjectId(taskId) as any, userId } as any);
  if (!task) throw new Error('Task not found');
  if (!isGoalCategory(task.category)) throw new Error('Subtasks only supported for goals and projects');

  const now = nowIso();
  const subtaskDoc = {
    userId,
    parentTaskId: taskId,
    title: title.trim(),
    scheduledDate: toIsoDate(scheduledDate),
    completed: false,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  const result = await database.collection(SUBTASKS_COLLECTION).insertOne(subtaskDoc as any);

  if (task.category === 'skill_development_goal') {
    await database.collection(SESSIONS_COLLECTION).insertOne({
      userId,
      parentTaskId: taskId,
      subtaskId: result.insertedId.toString(),
      date: subtaskDoc.scheduledDate,
      scheduledDate: subtaskDoc.scheduledDate,
      timeStart: task.timeStart,
      timeEnd: task.timeEnd,
      duration: minutesDiff(task.timeStart, task.timeEnd),
      completed: false,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    } as any);
  }

  await computeAndPersistProgress(userId, taskId);
  return getTaskWithChildren(userId, taskId);
}

export async function updateSubtask(userId: string, taskId: string, subtaskId: string, payload: { title?: string; completed?: boolean; scheduledDate?: string }) {
  const database = await db();
  const subtask = await database
    .collection<SubtaskDocument>(SUBTASKS_COLLECTION)
    .findOne({ _id: new ObjectId(subtaskId) as any, parentTaskId: taskId, userId } as any);
  if (!subtask) throw new Error('Subtask not found');

  const update: Partial<SubtaskDocument> = { updatedAt: nowIso() };
  if (typeof payload.title === 'string') update.title = payload.title.trim();
  if (typeof payload.scheduledDate === 'string') update.scheduledDate = toIsoDate(payload.scheduledDate);
  if (typeof payload.completed === 'boolean') {
    update.completed = payload.completed;
    update.completedAt = payload.completed ? nowIso() : null;
  }

  await database.collection(SUBTASKS_COLLECTION).updateOne(
    { _id: new ObjectId(subtaskId) as any, parentTaskId: taskId, userId } as any,
    { $set: update as any }
  );

  if (typeof payload.completed === 'boolean') {
    await database.collection(SESSIONS_COLLECTION).updateMany(
      { parentTaskId: taskId, userId, $or: [{ subtaskId }, { subtaskId: null, scheduledDate: subtask.scheduledDate }] } as any,
      { $set: { completed: payload.completed, completedAt: payload.completed ? nowIso() : null, updatedAt: nowIso() } as any }
    );
  }

  if (typeof payload.scheduledDate === 'string') {
    const normalizedDate = toIsoDate(payload.scheduledDate);
    await database.collection(SESSIONS_COLLECTION).updateMany(
      { parentTaskId: taskId, userId, $or: [{ subtaskId }, { subtaskId: null, scheduledDate: subtask.scheduledDate }] } as any,
      { $set: { scheduledDate: normalizedDate, date: normalizedDate, updatedAt: nowIso() } as any }
    );
  }

  await computeAndPersistProgress(userId, taskId);
  return getTaskWithChildren(userId, taskId);
}

export async function deleteSubtask(userId: string, taskId: string, subtaskId: string) {
  const database = await db();
  const subtask = await database
    .collection<SubtaskDocument>(SUBTASKS_COLLECTION)
    .findOne({ _id: new ObjectId(subtaskId) as any, parentTaskId: taskId, userId } as any);
  if (!subtask) throw new Error('Subtask not found');

  await database.collection(SUBTASKS_COLLECTION).deleteOne({ _id: new ObjectId(subtaskId) as any, parentTaskId: taskId, userId } as any);
  await database.collection(SESSIONS_COLLECTION).deleteMany({ parentTaskId: taskId, userId, $or: [{ subtaskId }, { subtaskId: null, scheduledDate: subtask.scheduledDate }] } as any);
  await computeAndPersistProgress(userId, taskId);
  return getTaskWithChildren(userId, taskId);
}

export async function listMonthPreview(userId: string, month: string) {
  await ensureTaskIndexes();
  const [yearStr, monthStr] = month.split('-');
  const year = Number(yearStr);
  const monthIdx = Number(monthStr);
  if (!Number.isInteger(year) || !Number.isInteger(monthIdx) || monthIdx < 1 || monthIdx > 12) {
    throw new Error('Invalid month format');
  }

  const start = `${yearStr}-${monthStr.padStart(2, '0')}-01`;
  const last = new Date(Date.UTC(year, monthIdx, 0)).toISOString().slice(0, 10);
  const database = await db();

  const tasks = await database.collection<TaskDocument>(TASKS_COLLECTION).find({ userId, status: 'active' } as any).toArray();
  const sessions = await database
    .collection<SessionDocument>(SESSIONS_COLLECTION)
    .find({ userId, scheduledDate: { $gte: start, $lte: last } } as any)
    .toArray();

  const map: Record<string, Array<{ id: string; title: string; timeStart: string; category: TaskCategory }>> = {};
  tasks.forEach((task: any) => {
    if ((task.category === 'event_reminder' || task.category === 'daily_quick_task') && task.startDate >= start && task.startDate <= last) {
      map[task.startDate] = map[task.startDate] || [];
      map[task.startDate].push({ id: task._id.toString(), title: task.title, timeStart: task.timeStart, category: task.category });
    }
  });
  const taskIndex = new Map(tasks.map((t: any) => [t._id.toString(), t]));
  sessions.forEach((s: any) => {
    const parent = taskIndex.get(s.parentTaskId);
    if (!parent) return;
    map[s.scheduledDate] = map[s.scheduledDate] || [];
    map[s.scheduledDate].push({ id: parent._id.toString(), title: parent.title, timeStart: parent.timeStart, category: parent.category });
  });

  Object.keys(map).forEach((date) => {
    map[date] = map[date].sort((a, b) => a.timeStart.localeCompare(b.timeStart)).slice(0, 4);
  });
  return map;
}

export async function markSession(userId: string, sessionId: string, completed: boolean) {
  const database = await db();
  const session = await database.collection<SessionDocument>(SESSIONS_COLLECTION).findOne({ _id: new ObjectId(sessionId) as any, userId } as any);
  if (!session) throw new Error('Session not found');

  await database.collection(SESSIONS_COLLECTION).updateOne(
    { _id: new ObjectId(sessionId) as any, userId } as any,
    { $set: { completed, completedAt: completed ? nowIso() : null, updatedAt: nowIso() } as any }
  );

  if (session.subtaskId) {
    await database.collection(SUBTASKS_COLLECTION).updateOne(
      { _id: new ObjectId(session.subtaskId) as any, userId } as any,
      { $set: { completed, completedAt: completed ? nowIso() : null, updatedAt: nowIso() } as any }
    );
  }

  await computeAndPersistProgress(userId, session.parentTaskId);
  return getTaskWithChildren(userId, session.parentTaskId);
}

function streakFromDates(dates: string[]): number {
  const set = new Set(dates);
  let streak = 0;
  for (let i = 0; i < 365; i += 1) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (set.has(key)) streak += 1;
    else if (i > 0) break;
  }
  return streak;
}

export async function profileStats(userId: string) {
  const database = await db();
  const user = await database.collection(USERS_COLLECTION).findOne({ _id: new ObjectId(userId) as any } as any);
  const tasks = await database.collection<TaskDocument>(TASKS_COLLECTION).find({ userId } as any).toArray();
  const sessions = await database.collection<SessionDocument>(SESSIONS_COLLECTION).find({ userId, completed: true } as any).toArray();

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const goals = tasks.filter((t) => t.category === 'skill_development_goal' || t.category === 'deadline_project').length;
  const completionRate = tasks.length ? Number(((completedTasks / tasks.length) * 100).toFixed(2)) : 0;
  const dates = sessions.map((s) => s.completedAt?.slice(0, 10)).filter(Boolean) as string[];

  const weekly: Array<{ label: string; value: number }> = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    weekly.push({
      label: d.toLocaleDateString(undefined, { weekday: 'short' }),
      value: sessions.filter((s) => s.completedAt?.slice(0, 10) === key).length,
    });
  }

  const monthly: Array<{ label: string; value: number }> = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date();
    d.setUTCMonth(d.getUTCMonth() - i);
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    monthly.push({
      label: d.toLocaleDateString(undefined, { month: 'short' }),
      value: sessions.filter((s) => {
        if (!s.completedAt) return false;
        const completed = new Date(s.completedAt);
        return completed.getUTCFullYear() === year && completed.getUTCMonth() === month;
      }).length,
    });
  }

  return {
    name: (user as any)?.name || 'Task-Zen User',
    email: (user as any)?.email || '',
    joinedAt: (user as any)?.createdAt || nowIso(),
    totalTasksCompleted: completedTasks,
    activeGoals: goals,
    completionRate,
    productivityStreak: streakFromDates(dates),
    weekly,
    monthly,
  };
}
