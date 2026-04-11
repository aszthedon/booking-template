'use client';

import { useMemo, useState } from 'react';

type BookingRow = {
  id: string;
  client_name: string | null;
  client_email: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  status: string | null;
  payment_status: string | null;
  amount_due: number | null;
  amount_paid: number | null;
  refund_status: string | null;
  refunded_amount: number | null;
  refundable: boolean | null;
  cancellation_policy: string | null;
  created_at: string | null;
  services: {
    name: string | null;
  } | null;
  service_variations: {
    name: string | null;
    price: number | null;
  } | null;
};

export default function ClientAppointmentsManager({
  bookings,
}: {
  bookings: BookingRow[];
}) {
  const [rows, setRows] = useState(bookings);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const upcomingRows = useMemo(
    () =>
      rows.filter(
        (b) => b.status === 'pending' || b.status === 'confirmed'
      ),
    [rows]
  );

  async function loadAvailability(date: string) {
    setLoadingSlots(true);
    setNewTime('');

    const response = await fetch(`/api/availability?date=${date}`);
    const result = await response.json();

    if (!response.ok) {
      alert(result.error || 'Failed to load available slots.');
      setAvailableSlots([]);
      setLoadingSlots(false);
      return;
    }

    setAvailableSlots(result.availableSlots || []);
    setLoadingSlots(false);
  }

  async function cancelBooking(bookingId: string) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    setSavingId(bookingId);

    const response = await fetch('/api/client/bookings/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, action: 'cancel' }),
    });

    const result = await response.json();
    setSavingId(null);

    if (!response.ok) {
      alert(result.error || 'Failed to cancel booking.');
      return;
    }

    setRows((prev) =>
      prev.map((row) =>
        row.id === bookingId
          ? {
              ...row,
              status: 'cancelled',
              refundable: result.refundable ?? row.refundable,
              cancellation_policy:
                result.refundable
                  ? 'Cancelled 48+ hours before appointment'
                  : 'Cancelled under 48 hours before appointment',
            }
          : row
      )
    );
  }

  async function rescheduleBooking(bookingId: string) {
    if (!newDate || !newTime) {
      alert('Please choose a new date and time.');
      return;
    }

    setSavingId(bookingId);

    const response = await fetch('/api/client/bookings/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId,
        action: 'reschedule',
        newDate,
        newTime,
      }),
    });

    const result = await response.json();
    setSavingId(null);

    if (!response.ok) {
      alert(result.error || 'Failed to reschedule booking.');
      return;
    }

    setRows((prev) =>
      prev.map((row) =>
        row.id === bookingId
          ? {
              ...row,
              appointment_date: newDate,
              appointment_time: newTime,
            }
          : row
      )
    );

    setActiveBookingId(null);
    setNewDate('');
    setNewTime('');
    setAvailableSlots([]);
  }

  return (
    <div className="card card-body" style={{ marginTop: 24 }}>
      {rows.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Service</th>
                <th style={th}>Variation</th>
                <th style={th}>Date</th>
                <th style={th}>Time</th>
                <th style={th}>Booking Status</th>
                <th style={th}>Payment Status</th>
                <th style={th}>Refund</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <>
                  <tr key={b.id}>
                    <td style={td}>{b.services?.name || '—'}</td>
                    <td style={td}>{b.service_variations?.name || '—'}</td>
                    <td style={td}>{b.appointment_date || '—'}</td>
                    <td style={td}>{b.appointment_time || '—'}</td>
                    <td style={td}>{b.status || '—'}</td>
                    <td style={td}>{b.payment_status || '—'}</td>
                    <td style={td}>
                      <div style={{ display: 'grid', gap: 4 }}>
                        <span>{b.refund_status || 'not_refunded'}</span>
                        {b.refundable === true && (
                          <span style={{ color: 'green', fontSize: '0.85rem' }}>
                            Eligible for refund
                          </span>
                        )}
                        {b.refundable === false && b.status === 'cancelled' && (
                          <span style={{ color: '#a15c00', fontSize: '0.85rem' }}>
                            Not eligible for refund
                          </span>
                        )}
                        {b.refunded_amount ? (
                          <span style={{ fontSize: '0.85rem' }}>
                            Refunded: ${b.refunded_amount}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td style={td}>
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button
                            className="button secondary"
                            onClick={() =>
                              setActiveBookingId(
                                activeBookingId === b.id ? null : b.id
                              )
                            }
                          >
                            {activeBookingId === b.id ? 'Close' : 'Reschedule'}
                          </button>

                          <button
                            className="button"
                            onClick={() => cancelBooking(b.id)}
                            disabled={savingId === b.id}
                          >
                            {savingId === b.id ? 'Saving...' : 'Cancel'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>

                  {activeBookingId === b.id && (
                    <tr>
                      <td colSpan={8} style={{ padding: 16, background: '#fafafa' }}>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr auto',
                            gap: 16,
                            alignItems: 'end',
                          }}
                        >
                          <div>
                            <label>New Date</label>
                            <input
                              type="date"
                              value={newDate}
                              onChange={(e) => {
                                const date = e.target.value;
                                setNewDate(date);
                                if (date) loadAvailability(date);
                              }}
                            />
                          </div>

                          <div>
                            <label>New Time</label>
                            <select
                              value={newTime}
                              onChange={(e) => setNewTime(e.target.value)}
                              disabled={!newDate || loadingSlots}
                            >
                              <option value="">
                                {loadingSlots ? 'Loading...' : 'Select available time'}
                              </option>
                              {availableSlots.map((slot) => (
                                <option key={slot} value={slot}>
                                  {slot}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <button
                              className="button"
                              onClick={() => rescheduleBooking(b.id)}
                              disabled={savingId === b.id}
                            >
                              {savingId === b.id ? 'Saving...' : 'Save New Time'}
                            </button>
                          </div>
                        </div>

                        {b.cancellation_policy ? (
                          <div style={{ marginTop: 12 }}>
                            <strong>Policy:</strong> {b.cancellation_policy}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px',
  borderBottom: '1px solid #ddd',
  whiteSpace: 'nowrap',
};

const td: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #eee',
  whiteSpace: 'nowrap',
  verticalAlign: 'top',
};
