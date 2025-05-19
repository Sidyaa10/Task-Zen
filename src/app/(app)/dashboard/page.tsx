"use client";

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for the dashboard client component
const DashboardClient = dynamic(
  () => import('./dashboard-client'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
);

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      }>
        <DashboardClient />
      </Suspense>
    </div>
  );
}
