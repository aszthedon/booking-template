'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Booking = {
  id: string;
  client_name: string | null;
  client_email: string | null;
  amount_paid: number | null;
  refund_status: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
};

export default function AdminRefundsPage() {
  const supabase = createClient();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        client_name,
        client_email,
        amount_paid,
        refund_status,
        appointment_date,
        appointment_time
      `)
      .eq('payment_status', 'paid')
      .order('appointment_date', { ascending: false });

    if (!error) setBookings(data || []);
  }

  async function refundBooking(bookingId: string, amount?: number) {
    setLoadingId(bookingId);

    const response = await fetch('/api/admin/bookings/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, amount }),
    });

    const result = await response.json();
    setLoadingId(null);

    if (!response.ok) {
      alert(result.error || 'Refund failed.');
      return;
    }

    alert(`Refund successful: $${result.refunded_amount}`);
    loadBookings();
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Refund Controls</h1>

      <div className="card card-body" style={{ marginTop: 24 }}>
        {bookings.length === 0 ? (
          <p>No paid bookings found.</p>
        ) : (
          <div className="list-stack">
            {bookings.map((booking) => (
              <div key={booking.id} className="list-row">
                <strong>{booking.client_name || 'Client'}</strong>
                <span>{booking.client_email || '—'}</span>
                <span>
                  {booking.appointment_date || '—'} at {booking.appointment_time || '—'}
                </span>
                <span>Paid: ${booking.amount_paid ?? 0}</span>
                <span>Refund status: {booking.refund_status || 'not_refunded'}</span>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                  <button
                    className="button secondary"
                    onClick={() => refundBooking(booking.id)}
                    disabled={loadingId === booking.id}
                  >
                    {loadingId === booking.id ? 'Refunding...' : 'Full Refund'}
                  </button>

                  <button
                    className="button secondary"
                    onClick={() => {
                      const amount = prompt('Enter partial refund amount:');
                      if (!amount) return;
                      refundBooking(booking.id, Number(amount));
                    }}
                    disabled={loadingId === booking.id}
                  >
                    Partial Refund
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
