'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const OptimizedDashboard = dynamic(
  () => import('./optimized-page').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
);

export default function DashboardClient() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <OptimizedDashboard />
    </Suspense>
  );
}
