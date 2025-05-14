
"use client"; // Add "use client"
import type { ReactNode } from 'react'; // Added ReactNode
import { useState, useCallback } from 'react'; // Added useState, useCallback
import { TaskCard } from "@/components/task-card";
import { CommandPalettePlaceholder } from "@/components/command-palette-placeholder";
import { CalendarViewPlaceholder } from "@/components/calendar-view-placeholder";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { lookupFlow } from '@genkit-ai/next/client';
import type { ParseTaskFlowInput, ParsedTaskOutput } from '@/ai/flows/parse-task-flow';


export default function DashboardPage() {
  const taskColumns = [
    { title: "To Do", tasks: [
      { id: "1", title: "Design homepage mockups", description: "Create detailed mockups in Figma", dueDate: "Oct 25", tags: ["design", "ui"], priority: "high" },
      { id: "2", title: "Setup project repository", dueDate: "Oct 22", tags: ["dev", "setup"], commentsCount: 2 },
    ]},
    { title: "In Progress", tasks: [
      { id: "3", title: "Develop authentication flow", description: "Implement Supabase auth", dueDate: "Nov 01", tags: ["dev", "auth"], attachmentsCount: 1, priority: "medium" },
    ]},
    { title: "Done", tasks: [
      { id: "4", title: "Define MVP features", dueDate: "Oct 15", tags: ["planning"], priority: "low" },
      { id: "5", title: "Choose tech stack", description: "Finalize frontend and backend technologies", dueDate: "Oct 10", tags: ["research"], commentsCount: 5, attachmentsCount: 3 },
    ]},
  ];

  const { toast } = useToast();
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [naturalLanguageTask, setNaturalLanguageTask] = useState("");
  const [isParsingTask, setIsParsingTask] = useState(false);

  const handleParseTask = useCallback(async () => {
    if (!naturalLanguageTask.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a task description.",
        variant: "destructive",
      });
      return;
    }

    setIsParsingTask(true);
    try {
      const clientParseTaskFlow = lookupFlow('parseTaskFlow');
      const currentDate = new Date().toISOString();
      const input: ParseTaskFlowInput = { naturalLanguageInput: naturalLanguageTask, currentDate };
      
      const parsedTask: ParsedTaskOutput = await clientParseTaskFlow(input);
      
      let description = `Title: ${parsedTask.title || 'N/A'}`;
      if (parsedTask.description) description += `\nDescription: ${parsedTask.description}`;
      if (parsedTask.dueDate) description += `\nDue: ${parsedTask.dueDate}`;
      if (parsedTask.assignee) description += `\nAssignee: ${parsedTask.assignee}`;
      if (parsedTask.project) description += `\nProject: ${parsedTask.project}`;
      if (parsedTask.tags && parsedTask.tags.length > 0) description += `\nTags: ${parsedTask.tags.join(', ')}`;
      if (parsedTask.priority) description += `\nPriority: ${parsedTask.priority}`;
      
      toast({
        title: "Task Parsed (Preview)",
        description: <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4 whitespace-pre-wrap"><code className="text-white">{JSON.stringify(parsedTask, null, 2)}</code></pre>,
        duration: 9000, // Keep toast longer for preview
      });
      console.log("Parsed Task:", parsedTask);
      // Here you would typically use this data to populate a task creation form or directly create a task
      setNaturalLanguageTask(""); // Clear input
      setIsCreateTaskDialogOpen(false); // Close dialog
    } catch (error) {
      console.error("Failed to parse task:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "Parsing Error",
        description: `Could not parse the task. ${errorMessage}. Please try again or rephrase.`,
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setIsParsingTask(false);
    }
  }, [naturalLanguageTask, toast]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        
        <Dialog open={isCreateTaskDialogOpen} onOpenChange={setIsCreateTaskDialogOpen}>
          <DialogTrigger asChild>
            <Button className="transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Task with AI</DialogTitle>
              <DialogDescription>
                Describe the task you want to create using natural language.
                For example, &quot;Review design mockups with Sarah next Friday at 2pm for Project Alpha #design #review priority high&quot;.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="naturalLanguageTask">
                  Task Description
                </Label>
                <Input
                  id="naturalLanguageTask"
                  value={naturalLanguageTask}
                  onChange={(e) => setNaturalLanguageTask(e.target.value)}
                  placeholder="e.g., Email team about Q3 budget by EOD tomorrow"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateTaskDialogOpen(false)}>Cancel</Button>
              <Button type="button" onClick={handleParseTask} disabled={isParsingTask || !naturalLanguageTask.trim()}>
                {isParsingTask ? "Parsing..." : "Parse & Create (Preview)"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>

      {/* Draggable Task Blocks Section - Placeholder */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Task Board</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {taskColumns.map((column) => (
            <div key={column.title} className="bg-secondary/50 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">{column.title}</h3>
                <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">{column.tasks.length}</span>
              </div>
              <div className="space-y-4 min-h-[200px]"> {/* Min height for D&D drop zone appearance */}
                {column.tasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    title={task.title} 
                    description={task.description} 
                    dueDate={task.dueDate}
                    tags={task.tags}
                    commentsCount={task.commentsCount}
                    attachmentsCount={task.attachmentsCount}
                    priority={task.priority as "low" | "medium" | "high" | undefined}
                  />
                ))}
                {column.tasks.length === 0 && (
                  <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-muted-foreground/30 rounded-md">
                    No tasks yet
                  </div>
                )}
              </div>
               <Button variant="ghost" className="w-full mt-4 text-muted-foreground hover:text-primary">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add task
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Markdown Formatting / Slash Commands Section - Placeholder */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Quick Note / Editor</h2>
        <CommandPalettePlaceholder />
      </section>

      {/* Calendar and Timeline View Section - Placeholder */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Upcoming Deadlines</h2>
        <CalendarViewPlaceholder />
      </section>
    </div>
  );
}

