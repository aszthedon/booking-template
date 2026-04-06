'use client';

import { useMemo, useState } from 'react';

type CalendarBooking = {
  id: string;
  client_name: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  status: string | null;
  payment_status: string | null;
  services: { name: string | null } | null;
  service_variations: { name: string | null } | null;
  staff: { name: string | null } | null;
};

type StaffOption = {
  id: string;
  name: string;
};

export default function AdminCalendarManager({
  bookings,
  staffOptions,
}: {
  bookings: CalendarBooking[];
  staffOptions: StaffOption[];
}) {
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const providerName = Array.isArray(booking.staff)
        ? booking.staff[0]?.name
        : booking.staff?.name;

      const matchesProvider =
        selectedProvider === 'all' || providerName === selectedProvider;

      const matchesStatus =
        selectedStatus === 'all' || booking.status === selectedStatus;

      return matchesProvider && matchesStatus;
    });
  }, [bookings, selectedProvider, selectedStatus]);

  const grouped = filteredBookings.reduce<Record<string, CalendarBooking[]>>(
    (acc, booking) => {
      const key = booking.appointment_date || 'No Date';
      if (!acc[key]) acc[key] = [];
      acc[key].push(booking);
      return acc;
    },
    {}
  );

  const orderedDates = Object.keys(grouped).sort();

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
            <label>Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {orderedDates.length === 0 ? (
        <div className="card card-body" style={{ marginTop: 24 }}>
          <p>No matching bookings.</p>
        </div>
      ) : (
        orderedDates.map((date) => (
          <section key={date} style={{ marginTop: 24 }}>
            <h2>{date}</h2>
            <div className="card card-body" style={{ marginTop: 12 }}>
              <div style={{ display: 'grid', gap: 12 }}>
                {grouped[date].map((booking) => {
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
                    <div
                      key={booking.id}
                      style={{
                        border: '1px solid #e5e5e5',
                        borderRadius: 12,
                        padding: 16,
                        display: 'grid',
                        gap: 6,
                      }}
                    >
                      <strong>
                        {booking.appointment_time || '—'} — {booking.client_name || 'Client'}
                      </strong>
                      <span>{serviceName || 'Service'} / {variationName || 'Variation'}</span>
                      <span>Provider: {providerName || 'Unassigned'}</span>
                      <span>Booking: {booking.status} · Payment: {booking.payment_status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ))
      )}
    </>
  );
}
