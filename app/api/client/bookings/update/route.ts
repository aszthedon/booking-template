import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookingId, action, newDate, newTime } = body;

    if (!bookingId || !action) {
      return NextResponse.json(
        { error: 'Missing bookingId or action.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const admin = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { data: booking, error: bookingError } = await admin
      .from('bookings')
      .select('id, client_email, status, payment_status')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    if (booking.client_email !== user.email) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    if (action === 'cancel') {
      const { error } = await admin
        .from('bookings')
        .update({
          status: 'cancelled',
        })
        .eq('id', bookingId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'reschedule') {
      if (!newDate || !newTime) {
        return NextResponse.json(
          { error: 'Missing new date or time.' },
          { status: 400 }
        );
      }

      const { data: conflict, error: conflictError } = await admin
        .from('bookings')
        .select('id')
        .eq('appointment_date', newDate)
        .eq('appointment_time', newTime)
        .in('status', ['pending', 'confirmed'])
        .neq('id', bookingId)
        .maybeSingle();

      if (conflictError) {
        return NextResponse.json({ error: conflictError.message }, { status: 500 });
      }

      if (conflict) {
        return NextResponse.json(
          { error: 'That time slot is already taken.' },
          { status: 409 }
        );
      }

      const { error } = await admin
        .from('bookings')
        .update({
          appointment_date: newDate,
          appointment_time: newTime,
        })
        .eq('id', bookingId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    console.error('Client booking update error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking.' },
      { status: 500 }
    );
  }
}
