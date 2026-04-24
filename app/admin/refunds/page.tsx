import { createClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant';

type RefundBooking = {
  id: string;
  client_name: string | null;
  client_email: string | null;
  amount_paid: number | null;
  refund_status: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
};

export default async function AdminRefundsPage() {
  const supabase = await createClient();
  const tenant = await getCurrentTenant();

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      client_name,
      client_email,
      amount_paid,
      refund_status,
      appointment_date,
      appointment_time
    `)
    .eq('tenant_id', tenant.id)
    .eq('payment_status', 'paid')
    .order('appointment_date', { ascending: false });

  if (error) {
    return (
      <main className="section shell">
        <h1>Refunds</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  const bookings = (data ?? []) as RefundBooking[];

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>{tenant.name} Refunds</h1>

      <div className="card card-body" style={{ marginTop: 24 }}>
        {bookings.length === 0 ? (
          <p>No paid bookings found.</p>
        ) : (
          <div className="list-stack">
            {bookings.map((booking) => (
              <div key={booking.id} className="list-row">
                <strong>{booking.client_name || 'Client'}</strong>
                <span>{booking.client_email || '—'}</span>
                <span>
                  {booking.appointment_date || '—'} at {booking.appointment_time || '—'}
                </span>
                <span>Paid: ${booking.amount_paid ?? 0}</span>
                <span>Refund status: {booking.refund_status || 'not_refunded'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
