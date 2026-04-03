import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

type BookingRow = {
  id: string;
  client_name: string | null;
  client_email: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  status: string | null;
  payment_status: string | null;
  amount_due: number | null;
  amount_paid: number | null;
  created_at: string | null;
  services: {
    name: string | null;
  } | null;
  service_variations: {
    name: string | null;
    price: number | null;
  } | null;
};

export default async function ClientAppointmentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

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
      created_at,
      services (
        name
      ),
      service_variations (
        name,
        price
      )
    `)
    .eq('client_email', user.email)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <main className="section shell">
        <p className="eyebrow">Client Dashboard</p>
        <h1>My Appointments</h1>
        <p>Failed to load your bookings.</p>
        <pre>{error.message}</pre>
      </main>
    );
  }

  const bookings = (data ?? []) as BookingRow[];

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed'
  );
  const completedBookings = bookings.filter((b) => b.status === 'completed');

  return (
    <main className="section shell">
      <p className="eyebrow">Client Dashboard</p>
      <h1>My Appointments</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginTop: 24,
        }}
      >
        <Card label="Total Bookings" value={bookings.length} />
        <Card label="Upcoming" value={upcomingBookings.length} />
        <Card label="Completed" value={completedBookings.length} />
      </div>

      <div className="card card-body" style={{ marginTop: 24 }}>
        {bookings.length === 0 ? (
          <p>You have no bookings yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Service</th>
                  <th style={th}>Variation</th>
                  <th style={th}>Date</th>
                  <th style={th}>Time</th>
                  <th style={th}>Booking Status</th>
                  <th style={th}>Payment Status</th>
                  <th style={th}>Amount Due</th>
                  <th style={th}>Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td style={td}>{b.services?.name || '—'}</td>
                    <td style={td}>{b.service_variations?.name || '—'}</td>
                    <td style={td}>{b.appointment_date || '—'}</td>
                    <td style={td}>{b.appointment_time || '—'}</td>
                    <td style={td}>
                      <StatusBadge value={b.status} />
                    </td>
                    <td style={td}>
                      <PaymentBadge value={b.payment_status} />
                    </td>
                    <td style={td}>${b.amount_due ?? 0}</td>
                    <td style={td}>${b.amount_paid ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="card card-body">
      <p className="eyebrow">{label}</p>
      <h2>{value}</h2>
    </div>
  );
}

function StatusBadge({ value }: { value: string | null }) {
  const color =
    value === 'confirmed'
      ? '#e6f7ec'
      : value === 'pending'
      ? '#fff4e5'
      : value === 'completed'
      ? '#e8f2ff'
      : '#eee';

  return <span style={badge(color)}>{value || '—'}</span>;
}

function PaymentBadge({ value }: { value: string | null }) {
  const color =
    value === 'paid'
      ? '#e8f2ff'
      : value === 'unpaid'
      ? '#fff1f1'
      : '#eee';

  return <span style={badge(color)}>{value || '—'}</span>;
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px',
  borderBottom: '1px solid #ddd',
  whiteSpace: 'nowrap',
};

const td: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #eee',
  whiteSpace: 'nowrap',
  verticalAlign: 'top',
};

function badge(bg: string): React.CSSProperties {
  return {
    padding: '5px 10px',
    borderRadius: '999px',
    background: bg,
    fontSize: '0.8rem',
    fontWeight: 600,
  };
}