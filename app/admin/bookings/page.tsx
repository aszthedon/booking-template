import { createClient } from '@/lib/supabase/server';
import AdminBookingsTable from '@/components/AdminBookingsTable';

type BookingPhoto = {
  id: string;
  public_url: string;
};

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
  booking_photos: BookingPhoto[];
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
      ),
      booking_photos (
        id,
        public_url
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginTop: 24,
        }}
      >
        <Card label="Total" value={totalBookings} />
        <Card label="Paid" value={paidBookings} />
        <Card label="Pending" value={pendingBookings} />
        <Card label="Confirmed" value={confirmedBookings} />
      </div>

      <AdminBookingsTable bookings={bookings} />
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
