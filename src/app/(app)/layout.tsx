"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { BottomNav } from '@/components/bottom-nav';

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && pathname) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4F2FA] via-[#EEF2F5] to-[#ECE9EC]">
      <header className="sticky top-0 z-30 border-b border-[#746D6C]/20 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-3 px-4 py-3 sm:items-center">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-[#282623] sm:text-xl">TASK-ZEN</h1>
            <p className="text-xs text-[#746D6C]">Structured focus. Measurable growth.</p>
          </div>
          <div className="rounded-full bg-white/70 px-3 py-1 text-[11px] text-[#746D6C] sm:text-xs">
            {new Date().toLocaleDateString(undefined, { weekday: 'long' })}
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-3 pb-28 pt-4 sm:px-4 sm:pb-24 sm:pt-6">
        {children}
      </div>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
