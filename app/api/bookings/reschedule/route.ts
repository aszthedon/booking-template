import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseTimeToMinutes, rangesOverlap } from '@/lib/time';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookingId, appointment_date, appointment_time } = body;

    if (!bookingId || !appointment_date || !appointment_time) {
      return NextResponse.json(
        { error: 'Missing bookingId, date, or time.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        staff_id,
        variation_id,
        service_variations (
          duration_minutes,
          buffer_minutes
        )
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found.' },
        { status: 404 }
      );
    }

    const selectedVariation = Array.isArray(booking.service_variations)
      ? booking.service_variations[0]
      : booking.service_variations;

    const requestedStart = parseTimeToMinutes(appointment_time);
    const requestedEnd =
      requestedStart +
      (selectedVariation?.duration_minutes || 30) +
      (selectedVariation?.buffer_minutes || 0);

    const { data: existingBookings, error: existingError } = await supabase
      .from('bookings')
      .select(`
        id,
        appointment_time,
        service_variations (
          duration_minutes,
          buffer_minutes
        )
      `)
      .eq('appointment_date', appointment_date)
      .eq('staff_id', booking.staff_id)
      .in('status', ['pending', 'confirmed'])
      .neq('id', bookingId);

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    const hasConflict = (existingBookings || []).some((row: any) => {
      const existingVariation = Array.isArray(row.service_variations)
        ? row.service_variations[0]
        : row.service_variations;

      const existingStart = parseTimeToMinutes(row.appointment_time);
      const existingEnd =
        existingStart +
        (existingVariation?.duration_minutes || 30) +
        (existingVariation?.buffer_minutes || 0);

      return rangesOverlap(requestedStart, requestedEnd, existingStart, existingEnd);
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: 'That move would overlap another booking for this provider.' },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from('bookings')
      .update({
        appointment_date,
        appointment_time,
      })
      .eq('id', bookingId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin reschedule error:', error);
    return NextResponse.json(
      { error: 'Failed to move booking.' },
      { status: 500 }
    );
  }
}
