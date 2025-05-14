
"use client";
import type { ReactNode } from 'react';
import { memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, ListFilter, LayoutGrid, List, FolderOpen, CalendarIcon, Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from '@/hooks/use-toast';

// Schema for project form validation
const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  dueDate: z.date().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export interface Project {
  id: string;
  name: string;
  description?: string;
  dueDate?: Date;
  // For simplicity, removing image, team, progress, status for now
  // image?: string;
  // dataAiHint?: string;
  // status?: string;
  // team?: string[];
  // progress?: number;
  createdAt: Date;
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = memo(function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card key={project.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200" data-ai-hint="project item">
      {/* Placeholder image can be added back if needed, using a static one or a simple service */}
      <div className="relative w-full h-40 bg-muted rounded-t-lg flex items-center justify-center">
        <FolderOpen className="w-16 h-16 text-primary opacity-30" />
      </div>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        {project.description && <CardDescription className="line-clamp-2 h-[40px]">{project.description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
        <p>Created: {format(project.createdAt, "PPP")}</p>
        {project.dueDate && (
          <p><strong>Due:</strong> {format(project.dueDate, "PPP")}</p>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" className="w-full">View Project</Button>
      </CardFooter>
    </Card>
  );
});


export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const { control, handleSubmit, register, formState: { errors }, reset } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const handleCreateProject = (data: ProjectFormData) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      dueDate: data.dueDate,
      createdAt: new Date(),
    };
    setProjects(prev => [...prev, newProject]);
    toast({ title: "Project Created", description: `"${newProject.name}" has been added.`});
    reset();
    setIsFormOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage all your team's projects in one place.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleCreateProject)} className="space-y-4 py-2">
              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input id="projectName" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="projectDescription">Description (Optional)</Label>
                <Textarea id="projectDescription" {...register("description")} />
              </div>
              <div>
                <Label htmlFor="projectDueDate">Due Date (Optional)</Label>
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
              </div>
              <DialogFooter className="pt-4">
                 <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                <Button type="submit">Create Project</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Input placeholder="Search projects..." className="flex-1" />
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ListFilter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>All</DropdownMenuItem>
              <DropdownMenuItem>In Progress</DropdownMenuItem>
              <DropdownMenuItem>Planning</DropdownMenuItem>
              <DropdownMenuItem>Completed</DropdownMenuItem>
              <DropdownMenuItem>On Hold</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon" aria-label="Grid View">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="List View">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <section>
        {projects.length === 0 ? (
           <Card className="md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center h-64 border-2 border-dashed bg-muted/30">
                <Info className="mx-auto h-12 w-12 opacity-50 mb-2" />
                <p className="text-lg font-medium text-muted-foreground">No projects yet</p>
                <p className="text-sm text-muted-foreground">Click "Add New Project" to create your first one.</p>
            </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
