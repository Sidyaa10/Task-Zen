import { TabType, TaskCategory, TaskCreateInput, TaskUpdateInput } from '@/lib/taskzen-types';

const TASK_CATEGORIES: TaskCategory[] = [
  'event_reminder',
  'skill_development_goal',
  'deadline_project',
  'daily_quick_task',
];

export function parseTaskCategory(value: unknown): TaskCategory {
  if (typeof value !== 'string' || !TASK_CATEGORIES.includes(value as TaskCategory)) {
    throw new Error('Invalid task category');
  }
  return value as TaskCategory;
}

export function parseTab(value: unknown): TabType {
  if (value === 'completed') return 'completed';
  return 'scheduled';
}

export function parsePage(value: unknown): 'home' | 'focus' {
  if (value === 'focus') return 'focus';
  return 'home';
}

export function parseMonth(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}$/.test(value)) {
    throw new Error('Invalid month format. Expected YYYY-MM');
  }
  return value;
}

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string') throw new Error(`${field} is required`);
  const normalized = value.trim();
  if (!normalized) throw new Error(`${field} is required`);
  return normalized;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value.trim() : undefined;
}

function asOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return undefined;
}

function asOptionalStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((v) => String(v).trim()).filter(Boolean);
}

export function parseTaskCreateInput(body: unknown): TaskCreateInput {
  if (!body || typeof body !== 'object') throw new Error('Invalid request body');
  const payload = body as Record<string, unknown>;
  const rawCategory = payload.category ?? payload.type;

  return {
    category: parseTaskCategory(rawCategory),
    title: asString(payload.title, 'title'),
    description: asOptionalString(payload.description),
    startDate: asString(payload.startDate, 'startDate'),
    endDate: asOptionalString(payload.endDate),
    timeStart: asString(payload.timeStart, 'timeStart'),
    timeEnd: asString(payload.timeEnd, 'timeEnd'),
    daysPerWeek: asOptionalNumber(payload.daysPerWeek),
    hoursPerDay: asOptionalNumber(payload.hoursPerDay),
    subtasks: asOptionalStringArray(payload.subtasks),
    reminderSettings: typeof payload.reminderSettings === 'object' && payload.reminderSettings !== null
      ? (payload.reminderSettings as TaskCreateInput['reminderSettings'])
      : undefined,
  };
}

export function parseTaskUpdateInput(body: unknown): TaskUpdateInput {
  if (!body || typeof body !== 'object') throw new Error('Invalid request body');
  const payload = body as Record<string, unknown>;

  const update: TaskUpdateInput = {};
  if (typeof payload.title === 'string') update.title = payload.title.trim();
  if (typeof payload.description === 'string') update.description = payload.description.trim();
  if (typeof payload.startDate === 'string') update.startDate = payload.startDate;
  if (typeof payload.endDate === 'string') update.endDate = payload.endDate;
  if (typeof payload.timeStart === 'string') update.timeStart = payload.timeStart;
  if (typeof payload.timeEnd === 'string') update.timeEnd = payload.timeEnd;
  if (typeof payload.manualPriority === 'number') update.manualPriority = payload.manualPriority;
  if (payload.status === 'active' || payload.status === 'completed') update.status = payload.status;
  if (typeof payload.progress === 'number') update.progress = payload.progress;
  if (typeof payload.reminderSettings === 'object' && payload.reminderSettings !== null) {
    update.reminderSettings = payload.reminderSettings as TaskUpdateInput['reminderSettings'];
  }
  return update;
}

export function parseSubtaskCreateInput(body: unknown): { title: string; scheduledDate: string } {
  if (!body || typeof body !== 'object') throw new Error('Invalid request body');
  const payload = body as Record<string, unknown>;
  return {
    title: asString(payload.title, 'title'),
    scheduledDate: asString(payload.scheduledDate, 'scheduledDate'),
  };
}

export function parseSubtaskUpdateInput(body: unknown): { title?: string; completed?: boolean; scheduledDate?: string } {
  if (!body || typeof body !== 'object') throw new Error('Invalid request body');
  const payload = body as Record<string, unknown>;
  const out: { title?: string; completed?: boolean; scheduledDate?: string } = {};
  if (typeof payload.title === 'string') out.title = payload.title.trim();
  if (typeof payload.completed === 'boolean') out.completed = payload.completed;
  if (typeof payload.scheduledDate === 'string') out.scheduledDate = payload.scheduledDate;
  return out;
}

export function parseSessionUpdateInput(body: unknown): { completed: boolean } {
  if (!body || typeof body !== 'object') throw new Error('Invalid request body');
  const payload = body as Record<string, unknown>;
  if (typeof payload.completed !== 'boolean') throw new Error('completed must be boolean');
  return { completed: payload.completed };
}
