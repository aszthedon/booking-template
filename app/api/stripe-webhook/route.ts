import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  sendAdminBookingNotification,
  sendClientConfirmationEmail,
} from '@/lib/email';

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
    const bookingId = session.metadata?.bookingId;

    console.log('✅ Checkout session completed');
    console.log('🆔 Booking ID from metadata:', bookingId);

    if (bookingId) {
      const supabase = createAdminClient();

      const amountPaid = session.amount_total ? session.amount_total / 100 : 0;

      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          amount_paid: amountPaid,
        })
        .eq('id', bookingId);

      if (updateError) {
        console.error('❌ Supabase webhook update error:', updateError);
      } else {
        console.log('✅ Booking successfully updated in DB');
      }

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          id,
          client_name,
          client_email,
          appointment_date,
          appointment_time,
          services (
            name
          ),
          service_variations (
            name
          )
        `)
        .eq('id', bookingId)
        .single();

      if (bookingError || !booking) {
        console.error('❌ Failed to load booking for email:', bookingError);
      } else {
        const serviceName =
          Array.isArray(booking.services)
            ? booking.services[0]?.name || 'Service'
            : booking.services?.name || 'Service';

        const variationName =
          Array.isArray(booking.service_variations)
            ? booking.service_variations[0]?.name || 'Variation'
            : booking.service_variations?.name || 'Variation';

        try {
          if (booking.client_email) {
            await sendClientConfirmationEmail({
              to: booking.client_email,
              clientName: booking.client_name || 'Client',
              serviceName,
              variationName,
              appointmentDate: booking.appointment_date || 'TBD',
              appointmentTime: booking.appointment_time || 'TBD',
              amountPaid,
            });

            console.log('✅ Client confirmation email sent');
          }

          await sendAdminBookingNotification({
            bookingId: booking.id,
            clientName: booking.client_name || 'Client',
            clientEmail: booking.client_email || 'No email',
            serviceName,
            variationName,
            appointmentDate: booking.appointment_date || 'TBD',
            appointmentTime: booking.appointment_time || 'TBD',
            amountPaid,
          });

          console.log('✅ Admin booking notification sent');
        } catch (emailError) {
          console.error('❌ Email send error:', emailError);
        }
      }
    } else {
      console.error('❌ No bookingId found in Stripe metadata');
    }
  }

  return new Response('OK', { status: 200 });
}
