import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

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
