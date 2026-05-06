import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { getCurrentTenant } from '@/lib/tenant';

export default async function StaffDashboard() {
  await requireRole('staff');

  const supabase = await createClient();
  const tenant = await getCurrentTenant();

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('tenant_id', tenant?.id)
    .eq('status', 'paid')
    .order('start_time', { ascending: true });

  return (
    <div className="shell">
      <h1>Upcoming Appointments</h1>

      {bookings?.map((b) => (
        <div key={b.id} className="card">
          <p>{b.customer_name}</p>
          <p>{b.service_name}</p>
          <p>{new Date(b.start_time).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
