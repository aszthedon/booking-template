import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, status, payment_status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing booking id.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const updatePayload: {
      status?: string;
      payment_status?: string;
    } = {};

    if (status) updatePayload.status = status;
    if (payment_status) updatePayload.payment_status = payment_status;

    const { error } = await supabase
      .from('bookings')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking.' },
      { status: 500 }
    );
  }
}