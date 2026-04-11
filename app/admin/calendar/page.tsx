import { createClient } from '@/lib/supabase/server';
import AdminCalendarBoard from '@/components/AdminCalendarBoard';

type CalendarBooking = {
  id: string;
  client_name: string | null;
  client_email: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  status: string | null;
  payment_status: string | null;
  amount_due: number | null;
  amount_paid: number | null;
  services: { name: string | null } | null;
  service_variations: {
    name: string | null;
    duration_minutes: number | null;
    buffer_minutes: number | null;
  } | null;
  staff: {
    id: string | null;
    name: string | null;
  } | null;
};

type StaffOption = {
  id: string;
  name: string;
};

export default async function AdminCalendarPage() {
  const supabase = await createClient();

  const { data: bookingsData, error } = await supabase
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
      services ( name ),
      service_variations ( name, duration_minutes, buffer_minutes ),
      staff ( id, name )
    `)
    .in('status', ['pending', 'confirmed', 'completed'])
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  const { data: staffData } = await supabase
    .from('staff')
    .select('id, name')
    .eq('is_active', true);

  if (error) {
    return (
      <main className="section shell">
        <p className="eyebrow">Admin</p>
        <h1>Calendar View</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  const bookings = (bookingsData ?? []) as CalendarBooking[];
  const staffOptions = (staffData ?? []) as StaffOption[];

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Calendar View</h1>
      <AdminCalendarBoard bookings={bookings} staffOptions={staffOptions} />
    </main>
  );
}
