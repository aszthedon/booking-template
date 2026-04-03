import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const BUSINESS_HOURS = {
  start: 9,  // 9:00 AM
  end: 17,   // 5:00 PM
  intervalMinutes: 30,
};

function formatTime(hour: number, minute: number) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function buildSlots() {
  const slots: string[] = [];

  for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
    for (let minute = 0; minute < 60; minute += BUSINESS_HOURS.intervalMinutes) {
      slots.push(formatTime(hour, minute));
    }
  }

  return slots;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json({ error: 'Missing date.' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('bookings')
    .select('appointment_time, status')
    .eq('appointment_date', date)
    .in('status', ['pending', 'confirmed']);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const takenTimes = new Set((data || []).map((b) => b.appointment_time));
  const allSlots = buildSlots();

  const availableSlots = allSlots.filter((slot) => !takenTimes.has(slot));

  return NextResponse.json({
    date,
    allSlots,
    takenSlots: Array.from(takenTimes),
    availableSlots,
  });
}
