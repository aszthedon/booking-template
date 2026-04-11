import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  sendAdminBookingNotification,
  sendClientConfirmationEmail,
  sendStaffBookingNotification,
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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      const supabase = createAdminClient();
      const amountPaid = session.amount_total ? session.amount_total / 100 : 0;

      await supabase
        .from('bookings')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          amount_paid: amountPaid,
          stripe_payment_intent_id:
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : null,
        })
        .eq('id', bookingId);

      const { data: booking } = await supabase
        .from('bookings')
        .select(`
          id,
          client_name,
          client_email,
          appointment_date,
          appointment_time,
          services ( name ),
          service_variations ( name ),
          staff ( name, email )
        `)
        .eq('id', bookingId)
        .single();

      if (booking) {
        const serviceName = Array.isArray(booking.services)
          ? booking.services[0]?.name || 'Service'
          : booking.services?.name || 'Service';

        const variationName = Array.isArray(booking.service_variations)
          ? booking.service_variations[0]?.name || 'Variation'
          : booking.service_variations?.name || 'Variation';

        const staffRecord = Array.isArray(booking.staff)
          ? booking.staff[0]
          : booking.staff;

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

        if (staffRecord?.email) {
          await sendStaffBookingNotification({
            to: staffRecord.email,
            providerName: staffRecord.name || 'Provider',
            clientName: booking.client_name || 'Client',
            serviceName,
            variationName,
            appointmentDate: booking.appointment_date || 'TBD',
            appointmentTime: booking.appointment_time || 'TBD',
          });
        }
      }
    }
  }

  return new Response('OK', { status: 200 });
}
