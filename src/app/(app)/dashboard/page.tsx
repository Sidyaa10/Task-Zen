
"use client";
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PlusCircle, CalendarIcon, CheckCircle, ListChecks, Info } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


// Schemas for form validation
const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTimeOption: z.enum(["asap", "later"]),
  startDate: z.date().optional(),
  taskType: z.enum(["one-off", "daily-recurring"]),
  dueDate: z.date().optional(), // For one-off
  dailyStartTime: z.string().optional(), // HH:MM format for recurring
  dailyEndTime: z.string().optional(), // HH:MM format for recurring
  recurringEndDate: z.date().optional(), // For daily recurring
  reminder: z.boolean().default(false),
}).refine(data => {
  if (data.startTimeOption === 'later' && !data.startDate) return false;
  return true;
}, { message: "Start date is required if 'Later' is selected", path: ["startDate"] })
.refine(data => {
  if (data.taskType === 'one-off' && !data.dueDate) return false;
  return true;
}, { message: "Due date is required for one-off tasks", path: ["dueDate"] })
.refine(data => {
  if (data.taskType === 'daily-recurring' && (!data.dailyStartTime || !data.dailyEndTime || !data.recurringEndDate)) return false;
  return true;
}, { message: "Daily start/end times and recurring end date are required for recurring tasks", path: ["dailyStartTime"] }); // Path can be any of the three

type TaskFormData = z.infer<typeof taskSchema>;

export interface Task {
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

const CompletedTaskCard = ({ task }: { task: Task }) => {
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
    <Card className="shadow-md" data-ai-hint="completed task item">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-primary-foreground">Completed</Badge>
        </div>
        {task.description && <CardDescription className="text-sm mt-1 line-clamp-2">{task.description}</CardDescription>}
      </CardHeader>
      <CardContent className="text-sm space-y-1">
        <p><span className="font-semibold">Time Allotted:</span> {timeDetails || "N/A"}</p>
        <p><span className="font-semibold">Started:</span> {format(task.createdAt, "PPP p")}</p>
        {task.completedAt && <p><span className="font-semibold">Finished:</span> {format(task.completedAt, "PPP p")}</p>}
         <p><span className="font-semibold">Duration:</span> {task.completedAt ? formatDistanceToNow(task.createdAt, { addSuffix: false, includeSeconds: false }).replace('about ','') + ' (approx)' : 'N/A'}</p>
      </CardContent>
       <CardFooter>
        <p className="text-xs text-muted-foreground">Progress: {task.progress}%</p>
      </CardFooter>
    </Card>
  );
};

const ActiveTaskCard = ({ task, onComplete, onProgressUpdate }: { task: Task, onComplete: (id: string) => void, onProgressUpdate: (id: string, progress: number) => void }) => {
  let taskTimeInfo = "";
  if (task.taskType === "one-off") {
    taskTimeInfo = task.dueDate ? `Due: ${format(task.dueDate, "PP")}` : "No due date";
  } else if (task.taskType === 'daily-recurring') {
    taskTimeInfo = `Daily ${task.dailyStartTime}-${task.dailyEndTime}`;
    if (task.recurringEndDate) taskTimeInfo += ` until ${format(task.recurringEndDate, "PP")}`;
  }
  
  const [currentProgress, setCurrentProgress] = useState(task.progress);

  useEffect(() => {
    setCurrentProgress(task.progress);
  }, [task.progress]);

  const handleSliderChange = (value: number[]) => {
    setCurrentProgress(value[0]);
  };

  const handleSliderCommit = (value: number[]) => {
    onProgressUpdate(task.id, value[0]);
  };


  return (
    <Card className="shadow-md" data-ai-hint="active task item">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{task.title}</CardTitle>
          {task.reminder && <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">Reminder Set</Badge>}
        </div>
        {task.description && <CardDescription className="text-sm mt-1 line-clamp-3">{task.description}</CardDescription>}
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <p className="flex items-center"><CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" /> {taskTimeInfo}</p>
        {task.startTimeOption === 'later' && task.startDate && (
          <p><span className="font-semibold">Starts:</span> {format(task.startDate, "PPP")}</p>
        )}
        <div className="space-y-1">
          <Label htmlFor={`progress-${task.id}`}>Progress: {currentProgress}%</Label>
          <div className="flex items-center gap-2">
            <Slider
              id={`progress-${task.id}`}
              min={0}
              max={100}
              step={5}
              value={[currentProgress]}
              onValueChange={handleSliderChange}
              onValueCommit={handleSliderCommit} 
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onComplete(task.id)} disabled={task.progress !== 100}>
          <CheckCircle className="mr-2 h-4 w-4" /> Mark as Done
        </Button>
      </CardFooter>
    </Card>
  );
};


export default function DashboardPage() {
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const { control, handleSubmit, register, watch, formState: { errors }, reset, setValue } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      startTimeOption: "asap",
      taskType: "one-off",
      reminder: false,
    }
  });

  const startTimeOption = watch("startTimeOption");
  const taskType = watch("taskType");

  const handleCreateTask = (data: TaskFormData) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      ...data,
      startDate: data.startTimeOption === 'later' ? data.startDate : undefined,
      dueDate: data.taskType === 'one-off' ? data.dueDate : undefined,
      dailyStartTime: data.taskType === 'daily-recurring' ? data.dailyStartTime : undefined,
      dailyEndTime: data.taskType === 'daily-recurring' ? data.dailyEndTime : undefined,
      recurringEndDate: data.taskType === 'daily-recurring' ? data.recurringEndDate : undefined,
      progress: 0,
      status: 'pending',
      createdAt: new Date(),
      reminder: data.reminder ?? false,
    };
    setActiveTasks(prev => [...prev, newTask]);
    toast({ title: "Task Created", description: `"${newTask.title}" has been added.` });
    reset();
    setIsFormOpen(false);
  };

  const handleCompleteTask = (taskId: string) => {
    setActiveTasks(prevTasks => {
      const taskToComplete = prevTasks.find(t => t.id === taskId);
      if (taskToComplete && taskToComplete.progress === 100) {
        const updatedTask = { ...taskToComplete, status: 'completed' as const, completedAt: new Date() };
        setCompletedTasks(prevCompleted => [updatedTask, ...prevCompleted]);
        toast({ title: "Task Completed!", description: `"${updatedTask.title}" moved to completed.` });
        return prevTasks.filter(t => t.id !== taskId);
      }
      if (taskToComplete && taskToComplete.progress !== 100) {
        toast({variant: "destructive", title: "Cannot Complete Task", description: "Task progress must be 100% to mark as complete."})
      }
      return prevTasks;
    });
  };
  
  const handleProgressUpdate = (taskId: string, progress: number) => {
    setActiveTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, progress } : task
      )
    );
    toast({ title: "Progress Updated", description: `Task progress set to ${progress}%.` });
  };


  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
              <PlusCircle className="mr-2 h-5 w-5" /> Create New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleCreateTask)} className="space-y-4 py-2">
              <div>
                <Label htmlFor="title">Task Title</Label>
                <Input id="title" {...register("title")} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea id="description" {...register("description")} />
              </div>

              <div className="space-y-2">
                <Label>When to start?</Label>
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
                        <Label htmlFor="later">Later</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>

              {startTimeOption === "later" && (
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
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
                            variant={"outline"}
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
                    <Label htmlFor="recurringEndDate">Recurring End Date</Label>
                     <Controller
                        name="recurringEndDate"
                        control={control}
                        render={({ field }) => (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
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
                <Label htmlFor="reminder">Set reminder (15 mins prior - feature conceptual)</Label>
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

      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <ListChecks className="mr-3 h-6 w-6 text-primary" /> Active Tasks
        </h2>
        {activeTasks.length === 0 ? (
          <Card className="flex items-center justify-center h-40 border-2 border-dashed bg-muted/30">
            <div className="text-center text-muted-foreground">
              <Info className="mx-auto h-10 w-10 opacity-50 mb-2" />
              <p className="text-lg font-medium">No active tasks yet!</p>
              <p className="text-sm">Click "Create New Task" to get started.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTasks.map((task) => (
              <ActiveTaskCard key={task.id} task={task} onComplete={handleCompleteTask} onProgressUpdate={handleProgressUpdate} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <CheckCircle className="mr-3 h-6 w-6 text-green-500" /> Completed Tasks
        </h2>
        {completedTasks.length === 0 ? (
           <Card className="flex items-center justify-center h-40 border-2 border-dashed bg-muted/30">
            <div className="text-center text-muted-foreground">
              <Info className="mx-auto h-10 w-10 opacity-50 mb-2" />
              <p className="text-lg font-medium">No tasks completed yet.</p>
              <p className="text-sm">Finish active tasks to see them here.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedTasks.map((task) => (
              <CompletedTaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// Minimal Slider component (if not already in your ui folder)
// For this example, assuming Slider is already available in "@/components/ui/slider"
import { Slider } from "@/components/ui/slider"; 
import { Switch } from "@/components/ui/switch";
import { Badge } from '@/components/ui/badge';
