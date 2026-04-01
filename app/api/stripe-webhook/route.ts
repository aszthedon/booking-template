import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    console.error('❌ Missing stripe-signature header');
    return new Response('Missing signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('❌ Webhook signature verification failed:', error);
    return new Response('Webhook Error', { status: 400 });
  }

  console.log('🔥 Stripe event received:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log('✅ Checkout session completed');
    console.log('🆔 Booking ID from metadata:', session.metadata?.bookingId);

    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      const supabase = createAdminClient();

      const { error } = await supabase
        .from('bookings')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          amount_paid: session.amount_total ? session.amount_total / 100 : null
        })
        .eq('id', bookingId);

      if (error) {
        console.error('❌ Supabase webhook update error:', error);
      } else {
        console.log('✅ Booking successfully updated in DB');
      }
    } else {
      console.error('❌ No bookingId found in Stripe metadata');
    }
  }

  return new Response('OK', { status: 200 });
}