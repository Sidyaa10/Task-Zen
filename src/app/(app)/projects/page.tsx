
"use client";
import type { ReactNode } from 'react'; // Added ReactNode
import { memo } from 'react'; // Added memo
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ListFilter, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

// Sample project data
const projects = [
  {
    id: "proj-1",
    name: "Website Redesign",
    description: "Complete overhaul of the company website for improved UX and modern aesthetics.",
    status: "In Progress",
    team: ["Alice", "Bob", "Charlie"],
    dueDate: "2024-12-15",
    progress: 65,
    image: "https://picsum.photos/seed/project1/400/200",
    dataAiHint: "website design"
  },
  {
    id: "proj-2",
    name: "Mobile App Development",
    description: "Develop a new cross-platform mobile application for product showcase.",
    status: "Planning",
    team: ["David", "Eve"],
    dueDate: "2025-03-01",
    progress: 15,
    image: "https://picsum.photos/seed/project2/400/200",
    dataAiHint: "mobile app"
  },
  {
    id: "proj-3",
    name: "Marketing Campaign Q4",
    description: "Launch a comprehensive marketing campaign for the new product line.",
    status: "Completed",
    team: ["Frank", "Grace", "Heidi"],
    dueDate: "2024-11-30",
    progress: 100,
    image: "https://picsum.photos/seed/project3/400/200",
    dataAiHint: "marketing campaign"
  },
  {
    id: "proj-4",
    name: "API Integration",
    description: "Integrate third-party APIs for enhanced functionality.",
    status: "On Hold",
    team: ["Alice", "David"],
    dueDate: "2025-01-20",
    progress: 30,
    image: "https://picsum.photos/seed/project4/400/200",
    dataAiHint: "api integration"
  },
];

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  team: string[];
  dueDate: string;
  progress: number;
  image: string;
  dataAiHint: string;
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = memo(function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card key={project.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="relative w-full h-40">
        <Image
          src={project.image}
          alt={project.name}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
          data-ai-hint={project.dataAiHint}
          priority={false} // Consider setting priority for above-the-fold images
        />
      </div>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription className="line-clamp-2">{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <div className="text-sm text-muted-foreground">
          <strong>Status:</strong> {project.status}
        </div>
        <div className="text-sm text-muted-foreground">
          <strong>Due:</strong> {project.dueDate}
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full"
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
        <div className="text-xs text-muted-foreground text-right">{project.progress}% complete</div>
      </CardContent>
      <CardContent className="pt-0">
        <div className="flex -space-x-2 overflow-hidden">
          {project.team.map((member, index) => (
            <Image
              key={index}
              className="inline-block h-8 w-8 rounded-full ring-2 ring-background"
              src={`https://picsum.photos/seed/${member.toLowerCase()}/40/40`}
              alt={member}
              width={32}
              height={32}
              data-ai-hint="person avatar"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});


export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage all your team's projects in one place.</p>
        </div>
        <Button className="transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Project
        </Button>
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
          <Button variant="outline" size="icon">
            <LayoutGrid className="h-4 w-4" />
            <span className="sr-only">Grid View</span>
          </Button>
          <Button variant="ghost" size="icon">
            <List className="h-4 w-4" />
            <span className="sr-only">List View</span>
          </Button>
        </div>
      </div>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
           {projects.length === 0 && (
             <Card className="md:col-span-2 lg:col-span-3 flex items-center justify-center h-64 border-2 border-dashed">
                <div className="text-center text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 h-12 w-12 opacity-50"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" x2="8" y1="13" y2="13"></line><line x1="16" x2="8" y1="17" y2="17"></line><line x1="10" x2="8" y1="9" y2="9"></line></svg>
                    <p className="text-lg font-medium">No projects found</p>
                    <p className="text-sm">Create your first project to get started.</p>
                </div>
            </Card>
           )}
        </div>
      </section>
    </div>
  );
}