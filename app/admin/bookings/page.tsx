import { createClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant';
import AdminBookingsTable from '@/components/AdminBookingsTable';

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const tenant = await getCurrentTenant();

  const { data, error } = await supabase
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
      service_variations ( name, price ),
      staff ( name ),
      booking_photos ( id, public_url )
    `)
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <main className="section shell">
        <p className="eyebrow">Admin</p>
        <h1>Bookings</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Bookings</h1>
      <AdminBookingsTable bookings={data || []} />
    </main>
  );
}
