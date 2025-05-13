import { TaskCard } from "@/components/task-card";
import { CommandPalettePlaceholder } from "@/components/command-palette-placeholder";
import { CalendarViewPlaceholder } from "@/components/calendar-view-placeholder";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <Button className="transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Task
        </Button>
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
