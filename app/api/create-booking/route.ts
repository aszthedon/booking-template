import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { parseTimeToMinutes, rangesOverlap } from '@/lib/time';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      service_id,
      variation_id,
      staff_id,
      client_name,
      client_email,
      appointment_date,
      appointment_time,
      amount_due,
    } = body;

    if (
      !service_id ||
      !variation_id ||
      !staff_id ||
      !client_name ||
      !client_email ||
      !appointment_date ||
      !appointment_time
    ) {
      return NextResponse.json(
        { error: 'Missing required booking fields.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const authClient = await createClient();

    const {
      data: { user },
    } = await authClient.auth.getUser();

    const { data: variation, error: variationError } = await supabase
      .from('service_variations')
      .select('id, duration_minutes, buffer_minutes')
      .eq('id', variation_id)
      .single();

    if (variationError || !variation) {
      return NextResponse.json(
        { error: 'Could not load selected service variation.' },
        { status: 400 }
      );
    }

    const requestedStart = parseTimeToMinutes(appointment_time);
    const requestedEnd =
      requestedStart + variation.duration_minutes + variation.buffer_minutes;

    const { data: existingBookings, error: existingError } = await supabase
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
      .eq('appointment_date', appointment_date)
      .eq('staff_id', staff_id)
      .in('status', ['pending', 'confirmed']);

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    const hasConflict = (existingBookings || []).some((booking: any) => {
      const existingStart = parseTimeToMinutes(booking.appointment_time);

      const variation = Array.isArray(booking.service_variations)
        ? booking.service_variations[0]
        : booking.service_variations;

      const existingEnd =
        existingStart +
        (variation?.duration_minutes || 30) +
        (variation?.buffer_minutes || 0);

      return rangesOverlap(requestedStart, requestedEnd, existingStart, existingEnd);
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: 'That time range is no longer available.' },
        { status: 409 }
      );
    }

    const { data: booking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        service_id,
        variation_id,
        staff_id,
        client_id: user?.id || null,
        client_name,
        client_email,
        appointment_date,
        appointment_time,
        status: 'pending',
        payment_status: 'unpaid',
        amount_due,
      })
      .select()
      .single();

    if (insertError || !booking) {
      return NextResponse.json(
        { error: insertError?.message || 'Failed to create booking.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Unexpected booking error.' },
      { status: 500 }
    );
  }
}