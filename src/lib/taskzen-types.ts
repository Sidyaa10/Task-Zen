export type TaskCategory =
  | 'event_reminder'
  | 'skill_development_goal'
  | 'deadline_project'
  | 'daily_quick_task';

export type TaskStatus = 'active' | 'completed';
export type TabType = 'scheduled' | 'completed';

export type TaskReminderSettings = {
  oneDayBefore?: boolean;
  twoHoursBefore?: boolean;
  oneHourBefore?: boolean;
  dailyBeforeDeadline?: boolean;
  extraNearDeadline?: boolean;
  sameDayReminder?: boolean;
  beforeSessionMinutes?: number;
};

export type TaskDocument = {
  _id: string;
  userId: string;
  taskType: TaskCategory;
  category: TaskCategory;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  deadline: string | null;
  timeStart: string;
  timeEnd: string;
  priorityLevel: 1 | 2;
  manualPriority: number;
  progress: number | null;
  totalSessions: number;
  completedSessions: number;
  reminderSettings: TaskReminderSettings;
  daysPerWeek?: number;
  hoursPerDay?: number;
  status: TaskStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SubtaskDocument = {
  _id: string;
  userId: string;
  parentTaskId: string;
  title: string;
  scheduledDate: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SessionDocument = {
  _id: string;
  userId: string;
  parentTaskId: string;
  subtaskId: string | null;
  date: string;
  scheduledDate: string;
  timeStart: string;
  timeEnd: string;
  duration: number;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskCreateInput = {
  category: TaskCategory;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  timeStart: string;
  timeEnd: string;
  daysPerWeek?: number;
  hoursPerDay?: number;
  subtasks?: string[];
  reminderSettings?: TaskReminderSettings;
};

export type TaskUpdateInput = {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  timeStart?: string;
  timeEnd?: string;
  manualPriority?: number;
  status?: TaskStatus;
  progress?: number;
  reminderSettings?: TaskReminderSettings;
};
