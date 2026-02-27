'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserDropdown } from '@/components/user-dropdown';
import { useAuth } from '@/contexts/auth-context';

export function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const routes = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      active: pathname === '/dashboard',
    },
    {
      href: '/projects',
      label: 'Projects',
      active: pathname.startsWith('/projects'),
    },
    {
      href: '/tasks',
      label: 'Tasks',
      active: pathname.startsWith('/tasks'),
    },
  ];

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <nav className={cn('flex items-center space-x-4 lg:space-x-6 mx-6')}>
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                route.active ? 'text-black dark:text-white' : 'text-muted-foreground'
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          {user ? (
            <UserDropdown />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
