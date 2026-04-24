import { createClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant';
import AdminCalendarBoard from '@/components/AdminCalendarBoard';

export default async function AdminCalendarPage() {
  const supabase = await createClient();
  const tenant = await getCurrentTenant();

  const { data: bookingsData, error } = await supabase
    .from('bookings')
    .select(`
      id,
      client_name,
      client_email,
      appointment_date,
      appointment_time,
      status,
      payment_status,
      amount_due,
      amount_paid,
      services ( name ),
      service_variations ( name, duration_minutes, buffer_minutes ),
      staff ( id, name )
    `)
    .eq('tenant_id', tenant.id)
    .in('status', ['pending', 'confirmed', 'completed'])
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  const { data: staffData } = await supabase
    .from('staff')
    .select('id, name')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true);

  if (error) {
    return (
      <main className="section shell">
        <p className="eyebrow">Admin</p>
        <h1>Calendar View</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Calendar View</h1>
      <AdminCalendarBoard
        bookings={bookingsData || []}
        staffOptions={staffData || []}
      />
    </main>
  );
}
