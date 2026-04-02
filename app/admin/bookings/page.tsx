import { createClient } from '@/lib/supabase/server';

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

export default async function AdminBookingsPage() {
  const supabase = await createClient();

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
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <main className="section shell">
        <h1>Bookings Dashboard</h1>
        <p>Failed to load bookings.</p>
        <pre>{error.message}</pre>
      </main>
    );
  }

  const bookings = (data ?? []) as BookingRow[];

  const totalBookings = bookings.length;
  const paidBookings = bookings.filter((b) => b.payment_status === 'paid').length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Bookings Dashboard</h1>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 24 }}>
        <Card label="Total" value={totalBookings} />
        <Card label="Paid" value={paidBookings} />
        <Card label="Pending" value={pendingBookings} />
        <Card label="Confirmed" value={confirmedBookings} />
      </div>

      {/* Table */}
      <div className="card card-body" style={{ marginTop: 24 }}>
        {bookings.length === 0 ? (
          <p>No bookings yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Client</th>
                  <th style={th}>Email</th>
                  <th style={th}>Service</th>
                  <th style={th}>Variation</th>
                  <th style={th}>Date</th>
                  <th style={th}>Time</th>
                  <th style={th}>Booking</th>
                  <th style={th}>Payment</th>
                  <th style={th}>Due</th>
                  <th style={th}>Paid</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td style={td}>{b.client_name}</td>
                    <td style={td}>{b.client_email}</td>
                    <td style={td}>{b.services?.name}</td>
                    <td style={td}>{b.service_variations?.name}</td>
                    <td style={td}>{b.appointment_date}</td>
                    <td style={td}>{b.appointment_time}</td>

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

/* ---------- COMPONENTS ---------- */

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
    value === 'confirmed' ? '#e6f7ec' :
    value === 'pending' ? '#fff4e5' :
    '#eee';

  return (
    <span style={badge(color)}>
      {value || '—'}
    </span>
  );
}

function PaymentBadge({ value }: { value: string | null }) {
  const color =
    value === 'paid' ? '#e8f2ff' :
    value === 'unpaid' ? '#fff1f1' :
    '#eee';

  return (
    <span style={badge(color)}>
      {value || '—'}
    </span>
  );
}

/* ---------- STYLES ---------- */

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px',
  borderBottom: '1px solid #ddd',
};

const td: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #eee',
};

function badge(bg: string): React.CSSProperties {
  return {
    padding: '5px 10px',
    borderRadius: '999px',
    background: bg,
    fontSize: '0.8rem',
    fontWeight: 600
  };
}