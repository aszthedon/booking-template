import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

function formatTime(hour: number, minute: number) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function buildSlots(startHour: number, endHour: number, intervalMinutes: number) {
  const slots: string[] = [];

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      slots.push(formatTime(hour, minute));
    }
  }

  return slots;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const providerId = searchParams.get('providerId');

  if (!date || !providerId) {
    return NextResponse.json(
      { error: 'Missing date or providerId.' },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const jsDate = new Date(`${date}T12:00:00`);
  const weekday = jsDate.getDay();

  const { data: blockedDate } = await supabase
    .from('provider_blocked_dates')
    .select('id')
    .eq('staff_id', providerId)
    .eq('blocked_date', date)
    .maybeSingle();

  if (blockedDate) {
    return NextResponse.json({
      date,
      availableSlots: [],
      takenSlots: [],
      blocked: true,
    });
  }

  const { data: providerHours, error: hoursError } = await supabase
    .from('provider_hours')
    .select('start_hour, end_hour, interval_minutes')
    .eq('staff_id', providerId)
    .eq('weekday', weekday)
    .eq('is_active', true)
    .single();

  if (hoursError || !providerHours) {
    return NextResponse.json({
      date,
      availableSlots: [],
      takenSlots: [],
      blocked: false,
    });
  }

  const allSlots = buildSlots(
    providerHours.start_hour,
    providerHours.end_hour,
    providerHours.interval_minutes
  );

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('appointment_time')
    .eq('appointment_date', date)
    .eq('staff_id', providerId)
    .in('status', ['pending', 'confirmed']);

  if (bookingsError) {
    return NextResponse.json({ error: bookingsError.message }, { status: 500 });
  }

  const takenTimes = new Set((bookings || []).map((b) => b.appointment_time));
  const availableSlots = allSlots.filter((slot) => !takenTimes.has(slot));

  return NextResponse.json({
    date,
    availableSlots,
    takenSlots: Array.from(takenTimes),
    blocked: false,
  });
}
