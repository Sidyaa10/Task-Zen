import { redirect } from 'next/navigation';
import { getRequestUserFromCookies } from '@/lib/auth-server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getRequestUserFromCookies();

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
