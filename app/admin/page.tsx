import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';

export default async function AdminDashboard() {
  await requireRole('admin');

  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  const revenue =
    bookings?.reduce((sum, b) => sum + (b.price || 0), 0) || 0;

  return (
    <div className="shell">
      <h1>Admin Dashboard</h1>

      <div className="card">
        <h3>Total Revenue</h3>
        <p>${revenue}</p>
      </div>

      <div className="card">
        <h3>Bookings</h3>

        {bookings?.map((b) => (
          <div key={b.id} className="list-row">
            <span>{b.customer_name}</span>
            <span>{b.status}</span>
            <span>${b.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
