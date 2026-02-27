'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Target, Info, UserCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/focus', label: 'Focus', icon: Target },
  { href: '/about', label: 'About', icon: Info },
  { href: '/profile', label: 'Profile', icon: UserCircle2 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[min(720px,calc(100%-1.5rem))] -translate-x-1/2">
      <nav className="mx-auto rounded-2xl border border-[#746D6C]/30 bg-[#FFFFFF]/70 px-3 py-2 shadow-[0_12px_30px_-16px_rgba(40,38,35,0.45)] backdrop-blur-xl">
        <ul className="grid grid-cols-4 gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'group flex items-center justify-center gap-2 rounded-xl px-2 py-2 text-sm font-medium transition-all duration-300',
                    active
                      ? 'bg-[#9997BF]/25 text-[#282623] shadow-inner'
                      : 'text-[#4F4A49] hover:bg-[#D0CBE3]/45 hover:text-[#282623]'
                  )}
                >
                  <Icon className={cn('h-[18px] w-[18px] transition-transform duration-300', active ? 'scale-110' : 'group-hover:scale-105')} />
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
