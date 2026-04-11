import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookingId, status } = body;

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'Missing bookingId or status.' },
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

    const { data: staffMember, error: staffError } = await admin
      .from('staff')
      .select('id')
      .eq('email', user.email)
      .single();

    if (staffError || !staffMember) {
      return NextResponse.json({ error: 'Staff profile not found.' }, { status: 404 });
    }

    const { data: booking, error: bookingError } = await admin
      .from('bookings')
      .select('id, staff_id')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    if (booking.staff_id !== staffMember.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const { error } = await admin
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Staff booking update error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking.' },
      { status: 500 }
    );
  }
}
