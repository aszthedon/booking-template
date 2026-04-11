'use client';

import { useMemo, useState } from 'react';

type CalendarBooking = {
  id: string;
  client_name: string | null;
  client_email: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  status: string | null;
  payment_status: string | null;
  amount_due?: number | null;
  amount_paid?: number | null;
  services: { name: string | null } | null;
  service_variations: { name: string | null } | null;
  staff: { name: string | null } | null;
};

type StaffOption = {
  id: string;
  name: string;
};

function buildSlots(startHour = 8, endHour = 18, intervalMinutes = 30) {
  const slots: string[] = [];

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const date = new Date();
      date.setHours(hour, minute, 0, 0);

      slots.push(
        date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        })
      );
    }
  }

  return slots;
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export default function AdminCalendarBoard({
  bookings,
  staffOptions,
}: {
  bookings: CalendarBooking[];
  staffOptions: StaffOption[];
}) {
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [activeBooking, setActiveBooking] = useState<CalendarBooking | null>(null);

  const slots = useMemo(() => buildSlots(), []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const providerName = Array.isArray(booking.staff)
        ? booking.staff[0]?.name
        : booking.staff?.name;

      const matchesProvider =
        selectedProvider === 'all' || providerName === selectedProvider;

      const matchesDate = booking.appointment_date === selectedDate;

      return matchesProvider && matchesDate;
    });
  }, [bookings, selectedProvider, selectedDate]);

  const bookingsByTime = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();

    for (const booking of filteredBookings) {
      const time = booking.appointment_time || '';
      if (!map.has(time)) map.set(time, []);
      map.get(time)!.push(booking);
    }

    return map;
  }, [filteredBookings]);

  return (
    <>
      <div className="card card-body" style={{ marginTop: 24 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}
        >
          <div>
            <label>Provider</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
            >
              <option value="all">All Providers</option>
              {staffOptions.map((staff) => (
                <option key={staff.id} value={staff.name}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card card-body" style={{ marginTop: 24 }}>
        <div style={{ display: 'grid', gap: 12 }}>
          {slots.map((slot) => {
            const slotBookings = bookingsByTime.get(slot) || [];

            return (
              <div
                key={slot}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr',
                  gap: 16,
                  alignItems: 'start',
                  padding: '12px 0',
                  borderBottom: '1px solid #eee',
                }}
              >
                <div>
                  <strong>{slot}</strong>
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                  {slotBookings.length === 0 ? (
                    <div
                      style={{
                        minHeight: 56,
                        border: '1px dashed #ddd',
                        borderRadius: 12,
                        background: '#fafafa',
                      }}
                    />
                  ) : (
                    slotBookings.map((booking) => {
                      const serviceName = Array.isArray(booking.services)
                        ? booking.services[0]?.name
                        : booking.services?.name;

                      const variationName = Array.isArray(booking.service_variations)
                        ? booking.service_variations[0]?.name
                        : booking.service_variations?.name;

                      const providerName = Array.isArray(booking.staff)
                        ? booking.staff[0]?.name
                        : booking.staff?.name;

                      return (
                        <button
                          key={booking.id}
                          type="button"
                          onClick={() => setActiveBooking(booking)}
                          style={{
                            textAlign: 'left',
                            padding: 14,
                            borderRadius: 14,
                            border: '1px solid #ddd',
                            background: '#fff',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                          }}
                        >
                          <strong>{booking.client_name || 'Client'}</strong>
                          <div style={{ marginTop: 6 }}>{serviceName || 'Service'} / {variationName || 'Variation'}</div>
                          <div style={{ marginTop: 4, fontSize: '0.92rem', color: '#666' }}>
                            {providerName || 'Unassigned'} · {booking.status} · {booking.payment_status}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeBooking && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: 360,
            height: '100vh',
            background: '#fff',
            borderLeft: '1px solid #ddd',
            boxShadow: '-8px 0 24px rgba(0,0,0,0.08)',
            padding: 24,
            overflowY: 'auto',
            zIndex: 50,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <h2 style={{ margin: 0 }}>Booking Details</h2>
            <button className="button secondary" onClick={() => setActiveBooking(null)}>
              Close
            </button>
          </div>

          <div className="list-stack" style={{ marginTop: 20 }}>
            <div className="list-row">
              <strong>Client</strong>
              <span>{activeBooking.client_name || '—'}</span>
            </div>
            <div className="list-row">
              <strong>Email</strong>
              <span>{activeBooking.client_email || '—'}</span>
            </div>
            <div className="list-row">
              <strong>Service</strong>
              <span>
                {(Array.isArray(activeBooking.services)
                  ? activeBooking.services[0]?.name
                  : activeBooking.services?.name) || '—'}
              </span>
            </div>
            <div className="list-row">
              <strong>Variation</strong>
              <span>
                {(Array.isArray(activeBooking.service_variations)
                  ? activeBooking.service_variations[0]?.name
                  : activeBooking.service_variations?.name) || '—'}
              </span>
            </div>
            <div className="list-row">
              <strong>Date</strong>
              <span>{activeBooking.appointment_date || '—'}</span>
            </div>
            <div className="list-row">
              <strong>Time</strong>
              <span>{activeBooking.appointment_time || '—'}</span>
            </div>
            <div className="list-row">
              <strong>Status</strong>
              <span>{activeBooking.status || '—'}</span>
            </div>
            <div className="list-row">
              <strong>Payment</strong>
              <span>{activeBooking.payment_status || '—'}</span>
            </div>
            <div className="list-row">
              <strong>Amount Due</strong>
              <span>${activeBooking.amount_due ?? 0}</span>
            </div>
            <div className="list-row">
              <strong>Amount Paid</strong>
              <span>${activeBooking.amount_paid ?? 0}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
