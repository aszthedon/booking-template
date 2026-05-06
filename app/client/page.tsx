import { createClient } from '@/lib/supabase/server';
import { getCurrentUserWithProfile } from '@/lib/auth';

export default async function ClientDashboard() {
  const userData = await getCurrentUserWithProfile();
  if (!userData) return <div>Please login</div>;

  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('customer_email', userData.user.email)
    .order('created_at', { ascending: false });

  return (
    <div className="shell">
      <h1>Your Bookings</h1>

      {bookings?.map((b) => (
        <div key={b.id} className="card">
          <p>{b.service_name}</p>
          <p>{b.status}</p>
          <p>{new Date(b.start_time).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
