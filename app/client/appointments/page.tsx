import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ClientAppointmentsManager from '@/components/ClientAppointmentsManager';

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
  refund_status: string | null;
  refunded_amount: number | null;
  refundable: boolean | null;
  cancellation_policy: string | null;
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
      refund_status,
      refunded_amount,
      refundable,
      cancellation_policy,
      created_at,
      services ( name ),
      service_variations ( name, price )
    `)
    .eq('client_id', user.id)
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

      <ClientAppointmentsManager bookings={bookings} />
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
