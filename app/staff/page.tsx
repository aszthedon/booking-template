import { createClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant';
import { redirect } from 'next/navigation';
import StaffScheduleManager from '@/components/StaffScheduleManager';

export default async function StaffDashboardPage() {
  const supabase = await createClient();
  const tenant = await getCurrentTenant();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect('/login');
  }

  const { data: staffMember, error: staffError } = await supabase
    .from('staff')
    .select('id, name, email')
    .eq('tenant_id', tenant.id)
    .eq('email', user.email)
    .single();

  if (staffError || !staffMember) {
    return (
      <main className="section shell">
        <p className="eyebrow">Staff</p>
        <h1>My Schedule</h1>
        <p>No staff profile was found for this brand.</p>
      </main>
    );
  }

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      client_name,
      appointment_date,
      appointment_time,
      status,
      payment_status,
      services ( name ),
      service_variations ( name )
    `)
    .eq('tenant_id', tenant.id)
    .eq('staff_id', staffMember.id)
    .in('status', ['pending', 'confirmed', 'completed'])
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  if (error) {
    return (
      <main className="section shell">
        <p className="eyebrow">Staff</p>
        <h1>My Schedule</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Staff Dashboard</p>
      <h1>{staffMember.name}&apos;s Schedule</h1>
      <StaffScheduleManager bookings={data || []} />
    </main>
  );
}
