import { createClient } from '@/lib/supabase/server';

type CalendarBooking = {
  id: string;
  client_name: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  status: string | null;
  payment_status: string | null;
  services: { name: string | null } | null;
  service_variations: { name: string | null } | null;
  staff: { name: string | null } | null;
};

export default async function AdminCalendarPage() {
  const supabase = await createClient();

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
      service_variations ( name ),
      staff ( name )
    `)
    .in('status', ['pending', 'confirmed', 'completed'])
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  if (error) {
    return (
      <main className="section shell">
        <h1>Admin Calendar</h1>
        <p>Failed to load calendar.</p>
        <pre>{error.message}</pre>
      </main>
    );
  }

  const bookings = (data ?? []) as CalendarBooking[];

  const grouped = bookings.reduce<Record<string, CalendarBooking[]>>((acc, booking) => {
    const key = booking.appointment_date || 'No Date';
    if (!acc[key]) acc[key] = [];
    acc[key].push(booking);
    return acc;
  }, {});

  const orderedDates = Object.keys(grouped).sort();

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Calendar View</h1>

      {orderedDates.length === 0 ? (
        <p>No scheduled bookings yet.</p>
      ) : (
        orderedDates.map((date) => (
          <section key={date} style={{ marginTop: 32 }}>
            <h2>{date}</h2>
            <div className="card card-body" style={{ marginTop: 12 }}>
              <div style={{ display: 'grid', gap: 12 }}>
                {grouped[date].map((booking) => (
                  <div
                    key={booking.id}
                    style={{
                      border: '1px solid #e5e5e5',
                      borderRadius: 12,
                      padding: 16,
                      display: 'grid',
                      gap: 6,
                    }}
                  >
                    <strong>
                      {booking.appointment_time || '—'} — {booking.client_name || 'Client'}
                    </strong>
                    <span>
                      {Array.isArray(booking.services)
                        ? booking.services[0]?.name
                        : booking.services?.name}{' '}
                      /{' '}
                      {Array.isArray(booking.service_variations)
                        ? booking.service_variations[0]?.name
                        : booking.service_variations?.name}
                    </span>
                    <span>
                      Provider:{' '}
                      {Array.isArray(booking.staff)
                        ? booking.staff[0]?.name || 'Unassigned'
                        : booking.staff?.name || 'Unassigned'}
                    </span>
                    <span>
                      Booking: {booking.status} · Payment: {booking.payment_status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))
      )}
    </main>
  );
}
