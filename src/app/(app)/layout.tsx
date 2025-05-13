"use client";
import type { ReactNode } from 'react';
import Link from 'next/link';
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { UserNav } from "@/components/user-nav";
import { Home, LayoutDashboard, CalendarDays, FolderKanban, Settings, Rocket, Search } from "lucide-react";
import { usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { open: sidebarOpen } = useSidebar();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar variant="sidebar" collapsible="icon" side="left">
        <SidebarHeader className="p-4 flex flex-col items-start">
            <Link href="/dashboard" className="flex items-center gap-2 mb-4 self-stretch">
              <Rocket className="h-8 w-8 text-primary" />
              {sidebarOpen && <span className="text-xl font-semibold text-foreground">TaskZen</span>}
            </Link>
            {sidebarOpen && (
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search tasks, projects..."
                        className="pl-8 w-full"
                    />
                </div>
            )}
        </SidebarHeader>
        <SidebarContent className="flex-1 p-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                  tooltip={!sidebarOpen ? item.label : undefined}
                  className="justify-start"
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          {/* Could add user profile link or quick settings here if not using UserNav in header */}
          {sidebarOpen && <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} TaskZen</p>}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col flex-1 overflow-hidden">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" /> {/* Only show trigger on mobile for main sidebar */}
            <h1 className="text-xl font-semibold">
              {navItems.find(item => pathname.startsWith(item.href))?.label || "TaskZen"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggleButton />
            <UserNav />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}
