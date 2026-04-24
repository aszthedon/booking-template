import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentTenant } from '@/lib/tenant';
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
  const tenant = await getCurrentTenant();

  const jsDate = new Date(`${date}T12:00:00`);
  const weekday = jsDate.getDay();

  const { data: blockedDate } = await supabase
    .from('provider_blocked_dates')
    .select('id')
    .eq('tenant_id', tenant.id)
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
    .eq('tenant_id', tenant.id)
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

  const { data: variation, error: variationError } = await supabase
    .from('service_variations')
    .select('service_id, duration_minutes, buffer_minutes')
    .eq('tenant_id', tenant.id)
    .eq('id', variationId)
    .single();

  if (variationError || !variation) {
    return NextResponse.json(
      { error: 'Could not load selected variation.' },
      { status: 400 }
    );
  }

  const { data: override } = await supabase
    .from('staff_services')
    .select('duration_override_minutes, buffer_override_minutes')
    .eq('tenant_id', tenant.id)
    .eq('staff_id', providerId)
    .eq('service_id', variation.service_id)
    .maybeSingle();

  const totalRequestedMinutes =
    (override?.duration_override_minutes ?? variation.duration_minutes ?? 30) +
    (override?.buffer_override_minutes ?? variation.buffer_minutes ?? 0);

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
      service_variations (
        service_id,
        duration_minutes,
        buffer_minutes
      )
    `)
    .eq('tenant_id', tenant.id)
    .eq('appointment_date', date)
    .eq('staff_id', providerId)
    .in('status', ['pending', 'confirmed']);

  if (bookingsError) {
    return NextResponse.json({ error: bookingsError.message }, { status: 500 });
  }

  const existingRanges = [];

  for (const booking of bookings || []) {
    const bookingVariation = Array.isArray(booking.service_variations)
      ? booking.service_variations[0]
      : booking.service_variations;

    const { data: bookingOverride } = await supabase
      .from('staff_services')
      .select('duration_override_minutes, buffer_override_minutes')
      .eq('tenant_id', tenant.id)
      .eq('staff_id', providerId)
      .eq('service_id', bookingVariation?.service_id)
      .maybeSingle();

    const totalMinutes =
      (bookingOverride?.duration_override_minutes ??
        bookingVariation?.duration_minutes ??
        30) +
      (bookingOverride?.buffer_override_minutes ??
        bookingVariation?.buffer_minutes ??
        0);

    const start = parseTimeToMinutes(booking.appointment_time);
    existingRanges.push({
      start,
      end: start + totalMinutes,
    });
  }

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
    duration_minutes:
      override?.duration_override_minutes ?? variation.duration_minutes ?? 30,
    buffer_minutes:
      override?.buffer_override_minutes ?? variation.buffer_minutes ?? 0,
  });
}
