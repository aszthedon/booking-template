import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import StaffScheduleManager from '@/components/StaffScheduleManager';

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
      <StaffScheduleManager bookings={bookings} />
    </main>
  );
}
