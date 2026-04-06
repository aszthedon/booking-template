import { createClient } from '@/lib/supabase/server';
import AdminCalendarManager from '@/components/AdminCalendarManager';

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
      appointment_date,
      appointment_time,
      status,
      payment_status,
      services ( name ),
      service_variations ( name ),
      staff ( name )
    `)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  const { data: staffData } = await supabase
    .from('staff')
    .select('id, name')
    .eq('is_active', true);

  if (error) {
    return (
      <main className="section shell">
        <h1>Admin Calendar</h1>
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
      <AdminCalendarManager bookings={bookings} staffOptions={staffOptions} />
    </main>
  );
}
