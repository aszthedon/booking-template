import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import { staffNav } from '@/lib/dashboard-nav';

export default async function StaffLayout({
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'staff' && profile.role !== 'admin')) {
    redirect('/');
  }

  return (
    <div style={{ display: 'flex' }}>
      <DashboardSidebar title="Staff Dashboard" links={staffNav} />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
