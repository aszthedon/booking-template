import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendClientRefundEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookingId, amount } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        client_name,
        client_email,
        amount_paid,
        stripe_payment_intent_id,
        refund_status
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    if (!booking.stripe_payment_intent_id) {
      return NextResponse.json(
        { error: 'No Stripe payment intent found for this booking.' },
        { status: 400 }
      );
    }

    const refundAmount = amount
      ? Math.round(Number(amount) * 100)
      : undefined;

    const refund = await stripe.refunds.create({
      payment_intent: booking.stripe_payment_intent_id,
      amount: refundAmount,
      reason: 'requested_by_customer',
    });

    const refundedAmount = refund.amount / 100;
    const fullRefund = Number(booking.amount_paid || 0) <= refundedAmount;

    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        refund_status: fullRefund ? 'refunded' : 'partially_refunded',
        refunded_amount: refundedAmount,
        refunded_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (booking.client_email) {
      await sendClientRefundEmail({
        to: booking.client_email,
        clientName: booking.client_name || 'Client',
        refundedAmount,
      });
    }

    return NextResponse.json({
      success: true,
      refund_id: refund.id,
      refunded_amount: refundedAmount,
    });
  } catch (error: any) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create refund.' },
      { status: 500 }
    );
  }
}
