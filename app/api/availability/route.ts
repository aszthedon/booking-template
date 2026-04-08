import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { minutesToTime, parseTimeToMinutes, rangesOverlap } from '@/lib/time';

function buildSlotMinutes(startHour: number, endHour: number, intervalMinutes: number) {
  const slots: number[] = [];
  const start = startHour * 60;
  const end = endHour * 60;

  for (let current = start; current < end; current += intervalMinutes) {
    slots.push(current);
  }

  return slots;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const providerId = searchParams.get('providerId');
  const variationId = searchParams.get('variationId');

  if (!date || !providerId || !variationId) {
    return NextResponse.json(
      { error: 'Missing date, providerId, or variationId.' },
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
      blocked: false,
    });
  }

  const { data: selectedVariation, error: variationError } = await supabase
    .from('service_variations')
    .select('duration_minutes, buffer_minutes')
    .eq('id', variationId)
    .single();

  if (variationError || !selectedVariation) {
    return NextResponse.json(
      { error: 'Could not load selected variation.' },
      { status: 400 }
    );
  }

  const totalRequestedMinutes =
    selectedVariation.duration_minutes + selectedVariation.buffer_minutes;

  const slotMinutes = buildSlotMinutes(
    providerHours.start_hour,
    providerHours.end_hour,
    providerHours.interval_minutes
  );

  const businessEndMinutes = providerHours.end_hour * 60;

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select(`
      id,
      appointment_time,
      status,
      service_variations (
        duration_minutes,
        buffer_minutes
      )
    `)
    .eq('appointment_date', date)
    .eq('staff_id', providerId)
    .in('status', ['pending', 'confirmed']);

  if (bookingsError) {
    return NextResponse.json({ error: bookingsError.message }, { status: 500 });
  }

  const existingRanges = (bookings || []).map((booking: any) => {
    const start = parseTimeToMinutes(booking.appointment_time);

    const variation = Array.isArray(booking.service_variations)
      ? booking.service_variations[0]
      : booking.service_variations;

    const totalMinutes =
      (variation?.duration_minutes || 30) + (variation?.buffer_minutes || 0);

    return {
      start,
      end: start + totalMinutes,
    };
  });

  const availableSlots = slotMinutes
    .filter((slotStart) => {
      const slotEnd = slotStart + totalRequestedMinutes;

      if (slotEnd > businessEndMinutes) return false;

      return !existingRanges.some((existing) =>
        rangesOverlap(slotStart, slotEnd, existing.start, existing.end)
      );
    })
    .map((minutes) => minutesToTime(minutes));

  return NextResponse.json({
    date,
    availableSlots,
    blocked: false,
  });
}