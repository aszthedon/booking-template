import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentTenant } from '@/lib/tenant';
import { stripe } from '@/lib/stripe';

function computeAmountDue(booking: {
  amount_due: number | null;
  service_variations?:
    | {
        price: number | null;
        deposit_type: 'flat' | 'percent' | null;
        deposit_value: number | null;
      }
    | {
        price: number | null;
        deposit_type: 'flat' | 'percent' | null;
        deposit_value: number | null;
    }
    | null;
}) {
  if (typeof booking.amount_due === 'number' && booking.amount_due > 0) {
    return booking.amount_due;
  }

  const variation = booking.service_variations;
  const price = Number(variation?.price ?? 0);
  const depositValue = Number(variation?.deposit_value ?? 0);

  if ((variation?.deposit_type ?? 'flat') === 'percent') {
    return Number(((price * depositValue) / 100).toFixed(2));
  }

  return Number(depositValue.toFixed(2));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const bookingId = body?.bookingId as string | undefined;

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const tenant = await getCurrentTenant();

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        id,
        tenant_id,
        client_email,
        amount_due,
        services ( name ),
        service_variations ( price, deposit_type, deposit_value, name )
      `)
      .eq('tenant_id', tenant.id)
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    const amountDue = computeAmountDue(booking as any);
    const amountDueCents = Math.round(amountDue * 100);

    if (!amountDueCents || amountDueCents <= 0) {
      return NextResponse.json(
        { error: 'Booking deposit amount is unavailable.' },
        { status: 400 }
      );
    }

    const serviceName = Array.isArray((booking as any).services)
      ? (booking as any).services[0]?.name || 'Booking deposit'
      : (booking as any).services?.name ||
        (booking as any).service_variations?.name ||
        'Booking deposit';

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: booking.client_email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: serviceName,
            },
            unit_amount: amountDueCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/success?booking_id=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/book?booking_id=${booking.id}`,
      metadata: {
        bookingId: booking.id,
        tenantId: tenant.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Create checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to start payment.' },
      { status: 500 }
    );
  }
}
