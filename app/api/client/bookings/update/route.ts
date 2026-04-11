import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  sendClientCancelledEmail,
  sendClientRescheduledEmail,
} from '@/lib/email';

function hoursUntilAppointment(date: string, time: string) {
  const appointment = new Date(`${date} ${time}`);
  const now = new Date();
  return (appointment.getTime() - now.getTime()) / (1000 * 60 * 60);
}

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
      .select(`
        id,
        client_id,
        client_name,
        client_email,
        appointment_date,
        appointment_time,
        status,
        payment_status,
        services ( name ),
        service_variations ( name )
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    const ownsBooking =
      booking.client_id === user.id ||
      (!booking.client_id && booking.client_email === user.email);

    if (!ownsBooking) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const serviceName = Array.isArray(booking.services)
      ? booking.services[0]?.name || 'Service'
      : booking.services?.name || 'Service';

    const variationName = Array.isArray(booking.service_variations)
      ? booking.service_variations[0]?.name || 'Variation'
      : booking.service_variations?.name || 'Variation';

    if (action === 'cancel') {
      const hoursRemaining = booking.appointment_date && booking.appointment_time
        ? hoursUntilAppointment(booking.appointment_date, booking.appointment_time)
        : 0;

      const refundable = hoursRemaining >= 48;

      const { error } = await admin
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          refundable,
          cancellation_policy: refundable
            ? 'Cancelled 48+ hours before appointment'
            : 'Cancelled under 48 hours before appointment',
        })
        .eq('id', bookingId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (booking.client_email) {
        await sendClientCancelledEmail({
          to: booking.client_email,
          clientName: booking.client_name || 'Client',
          serviceName,
          variationName,
          appointmentDate: booking.appointment_date || 'TBD',
          appointmentTime: booking.appointment_time || 'TBD',
        });
      }

      return NextResponse.json({ success: true, refundable });
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

      if (booking.client_email) {
        await sendClientRescheduledEmail({
          to: booking.client_email,
          clientName: booking.client_name || 'Client',
          serviceName,
          variationName,
          appointmentDate: newDate,
          appointmentTime: newTime,
        });
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
