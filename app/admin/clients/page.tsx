import { createClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant';

type ClientBooking = {
  id: string;
  client_name: string | null;
  client_email: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  status: string | null;
  payment_status: string | null;
};

export default async function AdminClientsPage() {
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
      payment_status
    `)
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <main className="section shell">
        <h1>Clients</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  const bookings = (data ?? []) as ClientBooking[];

  const grouped = bookings.reduce<Record<string, ClientBooking[]>>((acc, booking) => {
    const email = booking.client_email || 'unknown';
    if (!acc[email]) acc[email] = [];
    acc[email].push(booking);
    return acc;
  }, {});

  const clientEmails = Object.keys(grouped);

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>{tenant.name} Clients</h1>

      {clientEmails.length === 0 ? (
        <div className="card card-body" style={{ marginTop: 24 }}>
          <p>No client records found.</p>
        </div>
      ) : (
        <div className="dashboard-grid" style={{ marginTop: 24 }}>
          {clientEmails.map((email) => {
            const clientBookings = grouped[email];
            const name = clientBookings[0]?.client_name || 'Unknown Client';

            return (
              <div key={email} className="card card-body">
                <h2>{name}</h2>
                <p className="muted">{email}</p>
                <p className="muted">Total bookings: {clientBookings.length}</p>

                <div className="list-stack" style={{ marginTop: 16 }}>
                  {clientBookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="list-row">
                      <strong>
                        {booking.appointment_date || '—'} at {booking.appointment_time || '—'}
                      </strong>
                      <span>Status: {booking.status || '—'}</span>
                      <span>Payment: {booking.payment_status || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
