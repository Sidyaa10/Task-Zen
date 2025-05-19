"use client";

import { useState, useEffect, useCallback, memo } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Import components directly
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, CalendarIcon, CheckCircle, ListChecks, Info, Rocket } from 'lucide-react';

// Import dynamic from next/dynamic
import dynamic from 'next/dynamic';

// Lazy load AI-related functionality
let runFlow: any = () => Promise.resolve({});

// Only load runFlow on client-side
if (typeof window !== 'undefined') {
  import('@genkit-ai/next/client').then(mod => {
    runFlow = mod.runFlow;
  });
}

type ParseTaskFlowInput = any;
type ParsedTaskOutput = any;

// Schema for task form validation
const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTimeOption: z.enum(["asap", "later"]),
  startDate: z.date().optional(),
  taskType: z.enum(["one-off", "daily-recurring"]),
  dueDate: z.date().optional(),
  dailyStartTime: z.string().optional(),
  dailyEndTime: z.string().optional(),
  recurringEndDate: z.date().optional(),
  reminder: z.boolean().default(false),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface Task {
  id: string;
  title: string;
  description?: string;
  startTimeOption: 'asap' | 'later';
  startDate?: Date;
  taskType: 'one-off' | 'daily-recurring';
  dueDate?: Date;
  dailyStartTime?: string;
  dailyEndTime?: string;
  recurringEndDate?: Date;
  progress: number;
  status: 'pending' | 'active' | 'completed';
  createdAt: Date;
  completedAt?: Date;
  reminder: boolean;
}

const CompletedTaskCard = memo(({ task }: { task: Task }) => {
  let timeDetails = "";
  if (task.taskType === "one-off" && task.dueDate) {
    timeDetails = `Due by: ${format(task.dueDate, "PPP")}`;
  } else if (task.taskType === "daily-recurring" && task.dailyStartTime && task.dailyEndTime) {
    timeDetails = `Daily: ${task.dailyStartTime} - ${task.dailyEndTime}`;
    if (task.recurringEndDate) {
      timeDetails += ` until ${format(task.recurringEndDate, "PPP")}`;
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-primary-foreground">
            Completed
          </Badge>
        </div>
        {task.description && (
          <CardDescription className="text-sm mt-1 line-clamp-2">
            {task.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="text-sm space-y-1">
        <p><span className="font-semibold">Time Allotted:</span> {timeDetails || "N/A"}</p>
        <p><span className="font-semibold">Started:</span> {format(task.createdAt, "PPP p")}</p>
        {task.completedAt && (
          <p><span className="font-semibold">Finished:</span> {format(task.completedAt, "PPP p")}</p>
        )}
        <p>
          <span className="font-semibold">Duration:</span>{" "}
          {task.completedAt
            ? formatDistanceToNow(task.createdAt, { addSuffix: false, includeSeconds: false }).replace('about ', '') + ' (approx)'
            : 'N/A'}
        </p>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">Progress: {task.progress}%</p>
      </CardFooter>
    </Card>
  );
});

CompletedTaskCard.displayName = 'CompletedTaskCard';

const ActiveTaskCard = memo(({ 
  task, 
  onComplete, 
  onProgressUpdate,
  onDelete
}: { 
  task: Task; 
  onComplete: (id: string) => void; 
  onProgressUpdate: (id: string, progress: number) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <div className="group relative">
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg pr-8">{task.title}</CardTitle>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {task.status === 'completed' ? 'Completed' : task.status === 'active' ? 'In Progress' : 'Pending'}
            </Badge>
          </div>
          {task.description && (
            <CardDescription className="mt-1">
              {task.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{task.progress}%</span>
            </div>
            <Slider
              value={[task.progress]}
              onValueChange={([value]) => onProgressUpdate(task.id, value)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDelete(task.id)}
            className="text-destructive hover:bg-destructive/10"
          >
            Delete
          </Button>
          <Button 
            size="sm" 
            onClick={() => onComplete(task.id)}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Mark Complete
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
});

ActiveTaskCard.displayName = 'ActiveTaskCard';

function DashboardPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Filter tasks
  const activeTasks = tasks.filter(task => task.status !== 'completed');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  // Initialize form
  const { 
    control, 
    handleSubmit, 
    register, 
    reset, 
    watch,
    formState: { errors } 
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      startTimeOption: 'asap',
      taskType: 'one-off',
      reminder: false,
    },
  });

  const taskType = watch('taskType');
  const startTimeOption = watch('startTimeOption');

  // Initialize with empty tasks
  useEffect(() => {
    let isMounted = true;
    
    const loadTasks = () => {
      if (!isMounted) return;
      
      try {
        console.log('[Task Loading] Initializing with empty tasks');
        
        // Always set tasks to empty array
        setTasks([]);
        
        // Clear any localStorage data that might contain tasks
        if (typeof window !== 'undefined') {
          localStorage.removeItem('tasks');
          sessionStorage.removeItem('tasks');
        }
        
      } catch (error) {
        console.error('[Task Loading] Error initializing tasks:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadTasks();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle form submission
  const onSubmit = useCallback(async (data: TaskFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTask: Task = {
        id: Date.now().toString(),
        ...data,
        progress: 0,
        status: 'active' as const,
        createdAt: new Date(),
      };

      setTasks(prev => [...prev, newTask]);
      setIsDialogOpen(false);
      reset();
      
      toast({
        title: 'Success',
        description: 'Task created successfully!',
      });
    } catch (error) {
      console.error('Failed to create task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task. Please try again.',
        variant: 'destructive',
      });
    }
  }, [reset, toast]);

  // Handle task completion
  const handleCompleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'completed', completedAt: new Date(), progress: 100 } 
        : task
    ));
    toast({
      title: 'Task completed',
      description: 'Great job! The task has been marked as completed.',
    });
  }, [toast]);

  // Handle task deletion
  const handleDeleteTask = useCallback((taskId: string) => {
    setTaskToDelete(taskId);
  }, []);

  // Confirm and delete task
  const confirmDeleteTask = useCallback(() => {
    if (taskToDelete) {
      setTasks(prev => prev.filter(task => task.id !== taskToDelete));
      setTaskToDelete(null);
      toast({
        title: "Task deleted",
        description: "The task has been successfully deleted.",
      });
    }
  }, [taskToDelete, toast]);

  // Cancel delete
  const cancelDelete = useCallback(() => {
    setTaskToDelete(null);
  }, []);

  // Handle progress update
  const handleProgressUpdate = useCallback((taskId: string, progress: number) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            progress,
            status: progress === 100 ? 'completed' : progress > 0 ? 'active' : 'pending',
            ...(progress === 100 && { completedAt: new Date() })
          } 
        : task
    ));
  }, []);

  // Memoize the task cards to prevent unnecessary re-renders
  const renderTaskCard = useCallback((task: Task) => {
    if (task.status === 'completed') {
      return <CompletedTaskCard key={task.id} task={task} />;
    } else {
      return (
        <ActiveTaskCard
          key={task.id}
          task={task}
          onComplete={handleCompleteTask}
          onProgressUpdate={handleProgressUpdate}
          onDelete={handleDeleteTask}
        />
      );
    }
  }, [handleCompleteTask, handleProgressUpdate, handleDeleteTask, handleDeleteTask]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Check if this is a new user (no tasks at all)
  const isNewUser = tasks.length === 0 && !isLoading;
  
  // Calculate tasks due today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tasksDueToday = tasks.filter(task => {
    if (task.status === 'completed') return false;
    if (!task.dueDate) return false;
    
    const taskDueDate = new Date(task.dueDate);
    taskDueDate.setHours(0, 0, 0, 0);
    
    return taskDueDate.getTime() === today.getTime();
  });

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {isNewUser && (
            <p className="text-muted-foreground mt-1">Welcome to TaskZen! Let's get started.</p>
          )}
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Create New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register('title')} placeholder="Enter task title" />
                {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Enter task description"
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>When should this task start?</Label>
                <Controller
                  name="startTimeOption"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="asap" id="asap" />
                        <Label htmlFor="asap">ASAP</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="later" id="later" />
                        <Label htmlFor="later">Schedule for later</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>

              {startTimeOption === 'later' && (
                <div>
                  <Label>Start Date</Label>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label>Task Type</Label>
                <Controller
                  name="taskType"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="one-off" id="one-off" />
                        <Label htmlFor="one-off">One-off Task</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily-recurring" id="daily-recurring" />
                        <Label htmlFor="daily-recurring">Daily Recurring</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>
              
              {taskType === "one-off" && (
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a due date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate.message}</p>}
                </div>
              )}

              {taskType === "daily-recurring" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dailyStartTime">Daily Start Time</Label>
                      <Input id="dailyStartTime" type="time" {...register("dailyStartTime")} />
                    </div>
                    <div>
                      <Label htmlFor="dailyEndTime">Daily End Time</Label>
                      <Input id="dailyEndTime" type="time" {...register("dailyEndTime")} />
                    </div>
                  </div>
                  <div>
                    <Label>Recurring End Date</Label>
                    <Controller
                      name="recurringEndDate"
                      control={control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : <span>Pick an end date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                  </div>
                  {errors.dailyStartTime && <p className="text-sm text-destructive">{errors.dailyStartTime.message}</p>}
                </div>
              )}
              
              <div className="flex items-center space-x-2 pt-2">
                <Controller
                  name="reminder"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="reminder"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="reminder">Set reminder (15 mins prior)</Label>
              </div>

              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Create Task</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Section */}
      {!isNewUser && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Tasks</p>
                <p className="text-2xl font-bold">{activeTasks.length}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <ListChecks className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Due Today</p>
                <p className="text-2xl font-bold">{tasksDueToday.length}</p>
              </div>
              <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900/20">
                <CalendarIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedTasks.length}</p>
              </div>
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/20">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {isNewUser ? (
        <Card className="border-2 border-dashed border-primary/20 bg-primary/5 p-8 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome to TaskZen!</h2>
            <p className="text-muted-foreground">
              Get started by creating your first task. Click the button below to add a new task and stay organized.
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="mt-4 gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Create Your First Task
            </Button>
          </div>
        </Card>
      ) : (
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <ListChecks className="mr-3 h-6 w-6 text-primary" /> Active Tasks
          </h2>
          {activeTasks.length === 0 ? (
            <Card className="flex items-center justify-center h-60 border-2 border-dashed bg-muted/30">
              <div className="text-center p-6 max-w-sm">
                <ListChecks className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No active tasks</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  You don't have any active tasks right now. Create a new task to get started.
                </p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  size="sm" 
                  className="gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  New Task
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeTasks.map(renderTaskCard)}
            </div>
          )}
        </section>
      )}

      {!isNewUser && (
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <CheckCircle className="mr-3 h-6 w-6 text-green-500" /> 
            <span>Completed Tasks</span>
            {completedTasks.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({completedTasks.length} {completedTasks.length === 1 ? 'task' : 'tasks'})
              </span>
            )}
          </h2>
          {completedTasks.length === 0 ? (
            <Card className="flex items-center justify-center h-40 border-2 border-dashed bg-muted/5">
              <div className="text-center p-6 max-w-sm">
                <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground">
                  Completed tasks will appear here. Keep going! 🚀
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedTasks.map(renderTaskCard)}
            </div>
          )}
        </section>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Export the memoized component as default
export default memo(DashboardPage);
