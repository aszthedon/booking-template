import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      bookingId,
      serviceName,
      variationName,
      customerEmail,
      depositAmount
    } = body;

    if (!bookingId || !serviceName || !variationName || !customerEmail || !depositAmount) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${serviceName} — ${variationName} Deposit`
            },
            unit_amount: Math.round(Number(depositAmount) * 100)
          }
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/cancel`,
      metadata: {
        bookingId
      }
    });

    const supabase = await createClient();

    const { error } = await supabase
      .from('bookings')
      .update({
        stripe_checkout_session_id: session.id,
        amount_due: Number(depositAmount)
      })
      .eq('id', bookingId);

    if (error) {
      console.error('❌ Failed to update booking with Stripe session:', error);
      return NextResponse.json(
        { error: 'Failed to attach checkout session to booking.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('❌ Failed to create checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session.' },
      { status: 500 }
    );
  }
}