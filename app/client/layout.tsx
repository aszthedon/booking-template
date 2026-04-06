import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import { clientNav } from '@/lib/dashboard-nav';

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div style={{ display: 'flex' }}>
      <DashboardSidebar title="Client Dashboard" links={clientNav} />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
