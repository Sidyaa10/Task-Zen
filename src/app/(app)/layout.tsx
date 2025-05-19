
"use client";
import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { UserNav } from "@/components/user-nav";
import { Home, LayoutDashboard, CalendarDays, FolderKanban, Settings, Rocket, Search, Sparkles, Plus, Clock } from "lucide-react";
import { usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';

const SidebarLogo = ({ isOpen }: { isOpen: boolean }) => (
  <Link href="/" className="flex items-center gap-2 mb-8 group">
    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent text-white shadow-lg group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-300">
      <Sparkles className="h-5 w-5" />
    </div>
    {isOpen && (
      <div className="flex flex-col">
        <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">TaskZen</span>
        <span className="text-xs text-muted-foreground -mt-1">v1.0.0</span>
      </div>
    )}
  </Link>
);

const CreateButton = ({ isOpen }: { isOpen: boolean }) => (
  <Button 
    className={cn(
      "w-full justify-start gap-2 rounded-lg px-3 py-6 text-sm font-medium transition-colors",
      "bg-gradient-to-r from-primary/10 to-accent/10 text-foreground hover:from-primary/20 hover:to-accent/20",
      "border border-border/20 hover:border-primary/30",
      isOpen ? "px-4" : "px-3"
    )}
  >
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent text-white">
      <Plus className="h-3.5 w-3.5" />
    </div>
    {isOpen && <span>New Task</span>}
  </Button>
);

const NavItem = ({
  href,
  icon: Icon,
  label,
  isActive,
  isOpen,
}: {
  href: string;
  icon: any;
  label: string;
  isActive: boolean;
  isOpen: boolean;
}) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-accent/10 text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/5 hover:text-accent-foreground",
        isOpen ? "w-full" : "w-10 justify-center"
      )}
    >
      <Icon className="h-5 w-5" />
      {isOpen && <span>{label}</span>}
    </Link>
  );
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
];

function AppLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { open: sidebarOpen } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Fixed Sidebar */}
      <Sidebar 
        variant="sidebar" 
        collapsible="icon" 
        side="left" 
        className={cn(
          "hidden md:flex w-72 border-r border-border/20 bg-background/80 backdrop-blur-lg",
          "transition-all duration-300 ease-in-out"
        )}
      >
        <SidebarHeader className="px-4 pt-6">
          <SidebarLogo isOpen={sidebarOpen} />
          {sidebarOpen && (
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tasks, projects..."
                className="pl-9 w-full bg-background/50 border-border/30 focus-visible:ring-1 focus-visible:ring-accent/50"
              />
            </div>
          )}
        </SidebarHeader>
        
        <SidebarContent className="px-3 py-2">
          <CreateButton isOpen={sidebarOpen} />
          
          <SidebarMenu className="mt-6 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <SidebarMenuItem key={item.href}>
                  <NavItem 
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    isActive={isActive}
                    isOpen={sidebarOpen}
                  />
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
          
          {/* Stats Section - Placeholder */}
          {sidebarOpen && (
            <div className="mt-8 p-4 bg-accent/5 rounded-xl border border-border/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">0 tasks</p>
                  <p className="text-xs text-muted-foreground">Due this week</p>
                </div>
              </div>
              <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-accent to-primary rounded-full" 
                  style={{ width: '0%' }}
                />
              </div>
            </div>
          )}
        </SidebarContent>
        
        <SidebarFooter className="p-4 border-t border-border/20">
          {sidebarOpen ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                  <span className="text-sm font-medium">SK</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Siddhesh</p>
                  <p className="text-xs text-muted-foreground">Free Plan</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                <span className="text-xs font-medium">SK</span>
              </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 flex h-16 items-center justify-between px-4 border-b border-border/20 bg-background/80 backdrop-blur-lg">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="text-foreground" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {navItems.find(item => pathname.startsWith(item.href))?.label || "TaskZen"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Search className="h-5 w-5" />
            </Button>
            <Button size="icon" className="bg-gradient-to-br from-primary to-accent hover:opacity-90">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
