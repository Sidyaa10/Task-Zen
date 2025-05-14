
"use client"; // Add "use client"
import type { ReactNode } from 'react'; // Added ReactNode
import { TaskCard } from "@/components/task-card";
import { CommandPalettePlaceholder } from "@/components/command-palette-placeholder";
import { CalendarViewPlaceholder } from "@/components/calendar-view-placeholder";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
// Removed Dialog components and Genkit/AI related imports

export default function DashboardPage() {
  // Initial task columns are now empty
  const taskColumns = [
    { title: "To Do", tasks: []},
    { title: "In Progress", tasks: []},
    { title: "Done", tasks: []},
  ];

  // Removed AI task parsing dialog state and handlers

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        {/* The main "Add New Task" button that triggered the AI dialog is removed for now.
            Users can use per-column "Add task" buttons once implemented. */}
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
