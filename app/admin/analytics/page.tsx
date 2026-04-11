import { createClient } from '@/lib/supabase/server';

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from('bookings')
    .select('status, payment_status, amount_due, amount_paid');

  const rows = bookings || [];

  const totalBookings = rows.length;
  const confirmedBookings = rows.filter((b) => b.status === 'confirmed').length;
  const cancelledBookings = rows.filter((b) => b.status === 'cancelled').length;
  const paidBookings = rows.filter((b) => b.payment_status === 'paid').length;

  const totalRevenue = rows.reduce(
    (sum, row) => sum + Number(row.amount_paid || 0),
    0
  );

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Analytics</h1>

      <div className="stats-grid" style={{ marginTop: 24 }}>
        <div className="card card-body">
          <p className="eyebrow">Total Bookings</p>
          <h2>{totalBookings}</h2>
        </div>
        <div className="card card-body">
          <p className="eyebrow">Confirmed</p>
          <h2>{confirmedBookings}</h2>
        </div>
        <div className="card card-body">
          <p className="eyebrow">Cancelled</p>
          <h2>{cancelledBookings}</h2>
        </div>
        <div className="card card-body">
          <p className="eyebrow">Paid</p>
          <h2>{paidBookings}</h2>
        </div>
      </div>

      <div className="card card-body" style={{ marginTop: 24 }}>
        <p className="eyebrow">Revenue Collected</p>
        <h2>${totalRevenue.toFixed(2)}</h2>
      </div>
    </main>
  );
}
