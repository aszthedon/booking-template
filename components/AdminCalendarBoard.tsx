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

function getWeekDates(dateString: string) {
  const date = new Date(`${dateString}T12:00:00`);
  const day = date.getDay();
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - day);

  return Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + index);
    return d.toISOString().split('T')[0];
  });
}

function prettyDate(dateString: string) {
  const d = new Date(`${dateString}T12:00:00`);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminCalendarBoard({
  bookings,
  staffOptions,
}: {
  bookings: CalendarBooking[];
  staffOptions: StaffOption[];
}) {
  const [rows, setRows] = useState(bookings);
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [activeBooking, setActiveBooking] = useState<CalendarBooking | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  const slots = useMemo(() => buildSlots(), []);
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  const filteredBookings = useMemo(() => {
    return rows.filter((booking) => {
      const providerName = Array.isArray(booking.staff)
        ? booking.staff[0]?.name
        : booking.staff?.name;

      const matchesProvider =
        selectedProvider === 'all' || providerName === selectedProvider;

      const matchesDate =
        viewMode === 'day'
          ? booking.appointment_date === selectedDate
          : weekDates.includes(booking.appointment_date || '');

      return matchesProvider && matchesDate;
    });
  }, [rows, selectedProvider, selectedDate, viewMode, weekDates]);

  const bookingsByTime = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();

    for (const booking of filteredBookings) {
      const time = booking.appointment_time || '';
      if (!map.has(time)) map.set(time, []);
      map.get(time)!.push(booking);
    }

    return map;
  }, [filteredBookings]);

  const bookingsByDayAndTime = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();

    for (const booking of filteredBookings) {
      const key = `${booking.appointment_date}__${booking.appointment_time}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(booking);
    }

    return map;
  }, [filteredBookings]);

  async function moveBooking(bookingId: string, newDate: string, newTime: string) {
    setMovingId(bookingId);

    const response = await fetch('/api/admin/bookings/reschedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId,
        appointment_date: newDate,
        appointment_time: newTime,
      }),
    });

    const result = await response.json();
    setMovingId(null);

    if (!response.ok) {
      alert(result.error || 'Failed to move booking.');
      return;
    }

    setRows((prev) =>
      prev.map((row) =>
        row.id === bookingId
          ? { ...row, appointment_date: newDate, appointment_time: newTime }
          : row
      )
    );
  }

  function onDropToSlot(newDate: string, newTime: string) {
    if (!draggingId) return;
    moveBooking(draggingId, newDate, newTime);
    setDraggingId(null);
  }

  return (
    <>
      <div className="card card-body" style={{ marginTop: 24 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
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

          <div>
            <label>View</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className={viewMode === 'day' ? 'button' : 'button secondary'}
                onClick={() => setViewMode('day')}
              >
                Day
              </button>
              <button
                className={viewMode === 'week' ? 'button' : 'button secondary'}
                onClick={() => setViewMode('week')}
              >
                Week
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'day' ? (
        <div className="card card-body" style={{ marginTop: 24 }}>
          <h2>{prettyDate(selectedDate)}</h2>

          <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
            {slots.map((slot) => {
              const slotBookings = bookingsByTime.get(slot) || [];

              return (
                <div
                  key={slot}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDropToSlot(selectedDate, slot)}
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

                  <div
                    style={{
                      display: 'grid',
                      gap: 12,
                      minHeight: 56,
                      borderRadius: 12,
                      background: draggingId ? '#fcfbf8' : 'transparent',
                    }}
                  >
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
                      slotBookings.map((booking) => (
                        <BookingCard
                          key={booking.id}
                          booking={booking}
                          moving={movingId === booking.id}
                          onOpen={() => setActiveBooking(booking)}
                          onDragStart={() => setDraggingId(booking.id)}
                          onDragEnd={() => setDraggingId(null)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card card-body" style={{ marginTop: 24, overflowX: 'auto' }}>
          <h2>Week of {prettyDate(weekDates[0])}</h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `120px repeat(7, minmax(180px, 1fr))`,
              gap: 8,
              marginTop: 16,
            }}
          >
            <div />
            {weekDates.map((date) => (
              <div
                key={date}
                style={{
                  padding: 12,
                  border: '1px solid #eee',
                  borderRadius: 12,
                  background: '#fafafa',
                  fontWeight: 700,
                }}
              >
                {prettyDate(date)}
              </div>
            ))}

            {slots.map((slot) => (
              <>
                <div
                  key={`label-${slot}`}
                  style={{
                    padding: 12,
                    fontWeight: 700,
                    borderTop: '1px solid #f1f1f1',
                  }}
                >
                  {slot}
                </div>

                {weekDates.map((date) => {
                  const key = `${date}__${slot}`;
                  const cellBookings = bookingsByDayAndTime.get(key) || [];

                  return (
                    <div
                      key={`${date}-${slot}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDropToSlot(date, slot)}
                      style={{
                        minHeight: 90,
                        border: '1px dashed #ddd',
                        borderRadius: 12,
                        padding: 8,
                        background: draggingId ? '#fcfbf8' : '#fff',
                        display: 'grid',
                        gap: 8,
                      }}
                    >
                      {cellBookings.map((booking) => (
                        <BookingCard
                          key={booking.id}
                          booking={booking}
                          moving={movingId === booking.id}
                          onOpen={() => setActiveBooking(booking)}
                          onDragStart={() => setDraggingId(booking.id)}
                          onDragEnd={() => setDraggingId(null)}
                        />
                      ))}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      )}

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

function BookingCard({
  booking,
  moving,
  onOpen,
  onDragStart,
  onDragEnd,
}: {
  booking: CalendarBooking;
  moving: boolean;
  onOpen: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
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
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      style={{
        textAlign: 'left',
        padding: 14,
        borderRadius: 14,
        border: '1px solid #ddd',
        background: moving ? '#f3ece7' : '#fff',
        cursor: 'grab',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
      }}
    >
      <strong>{booking.client_name || 'Client'}</strong>
      <div style={{ marginTop: 6 }}>{serviceName || 'Service'} / {variationName || 'Variation'}</div>
      <div style={{ marginTop: 4, fontSize: '0.92rem', color: '#666' }}>
        {providerName || 'Unassigned'} · {booking.status} · {booking.payment_status}
      </div>
    </div>
  );
}
