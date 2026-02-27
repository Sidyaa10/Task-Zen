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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#282623]">TASK-ZEN</h1>
            <p className="text-xs text-[#746D6C]">Structured focus. Measurable growth.</p>
          </div>
          <div className="text-xs text-[#746D6C]">{new Date().toLocaleDateString(undefined, { weekday: 'long' })}</div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6">
        {children}
      </div>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
