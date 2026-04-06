import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

type StaffBooking = {
  id: string;
  client_name: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  status: string | null;
  payment_status: string | null;
  services: { name: string | null } | null;
  service_variations: { name: string | null } | null;
};

export default async function StaffDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect('/login');
  }

  const { data: staffMember, error: staffError } = await supabase
    .from('staff')
    .select('id, name, email')
    .eq('email', user.email)
    .single();

  if (staffError || !staffMember) {
    return (
      <main className="section shell">
        <p className="eyebrow">Staff</p>
        <h1>My Schedule</h1>
        <p>No staff profile was found for this login.</p>
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

  const bookings = (data ?? []) as StaffBooking[];

  return (
    <main className="section shell">
      <p className="eyebrow">Staff Dashboard</p>
      <h1>{staffMember.name}&apos;s Schedule</h1>

      <div className="card card-body" style={{ marginTop: 24 }}>
        {bookings.length === 0 ? (
          <p>No appointments assigned yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Client</th>
                <th style={th}>Service</th>
                <th style={th}>Variation</th>
                <th style={th}>Date</th>
                <th style={th}>Time</th>
                <th style={th}>Booking Status</th>
                <th style={th}>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td style={td}>{b.client_name || '—'}</td>
                  <td style={td}>{Array.isArray(b.services) ? b.services[0]?.name : b.services?.name}</td>
                  <td style={td}>{Array.isArray(b.service_variations) ? b.service_variations[0]?.name : b.service_variations?.name}</td>
                  <td style={td}>{b.appointment_date || '—'}</td>
                  <td style={td}>{b.appointment_time || '—'}</td>
                  <td style={td}>{b.status || '—'}</td>
                  <td style={td}>{b.payment_status || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px',
  borderBottom: '1px solid #ddd',
};

const td: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #eee',
};
