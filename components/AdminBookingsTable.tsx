'use client';

import { useMemo, useState } from 'react';

type BookingPhoto = {
  id: string;
  public_url: string;
};

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
  created_at: string | null;
  services: {
    name: string | null;
  } | null;
  service_variations: {
    name: string | null;
    price: number | null;
  } | null;
  staff: {
    name: string | null;
  } | null;
  booking_photos?: BookingPhoto[];
};

export default function AdminBookingsTable({
  bookings,
}: {
  bookings: BookingRow[];
}) {
  const [rows, setRows] = useState(bookings);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        query === '' ||
        row.client_name?.toLowerCase().includes(query) ||
        row.client_email?.toLowerCase().includes(query) ||
        row.services?.name?.toLowerCase().includes(query) ||
        row.service_variations?.name?.toLowerCase().includes(query);

      const matchesBooking =
        bookingFilter === 'all' || row.status === bookingFilter;

      const matchesPayment =
        paymentFilter === 'all' || row.payment_status === paymentFilter;

      return matchesSearch && matchesBooking && matchesPayment;
    });
  }, [rows, search, bookingFilter, paymentFilter]);

  async function handleSave(id: string) {
    const row = rows.find((b) => b.id === id);
    if (!row) return;

    setSavingId(id);

    const response = await fetch('/api/admin/bookings/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        status: row.status,
        payment_status: row.payment_status,
      }),
    });

    const result = await response.json();
    setSavingId(null);

    if (!response.ok) {
      alert(result.error || 'Failed to update booking.');
      return;
    }

    alert('Booking updated successfully.');
  }

  function updateRow(
    id: string,
    field: 'status' | 'payment_status',
    value: string
  ) {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  }

  return (
    <>
      <div className="card card-body" style={{ marginTop: 24 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: 16,
          }}
        >
          <div>
            <label>Search</label>
            <input
              type="text"
              placeholder="Search client, email, service, or variation"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label>Booking Status</label>
            <select
              value={bookingFilter}
              onChange={(e) => setBookingFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>

          <div>
            <label>Payment Status</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="unpaid">unpaid</option>
              <option value="paid">paid</option>
              <option value="refunded">refunded</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card card-body" style={{ marginTop: 24 }}>
        {filteredRows.length === 0 ? (
          <p>No bookings match your filters.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Client</th>
                  <th style={th}>Service</th>
                  <th style={th}>Date</th>
                  <th style={th}>Time</th>
                  <th style={th}>Booking Status</th>
                  <th style={th}>Payment Status</th>
                  <th style={th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((b) => (
                  <>
                    <tr key={b.id}>
                      <td style={td}>{b.client_name || '—'}</td>
                      <td style={td}>
                        {b.services?.name || '—'} / {b.service_variations?.name || '—'}
                      </td>
                      <td style={td}>{b.appointment_date || '—'}</td>
                      <td style={td}>{b.appointment_time || '—'}</td>

                      <td style={td}>
                        <select
                          value={b.status || 'pending'}
                          onChange={(e) =>
                            updateRow(b.id, 'status', e.target.value)
                          }
                        >
                          <option value="pending">pending</option>
                          <option value="confirmed">confirmed</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </td>

                      <td style={td}>
                        <select
                          value={b.payment_status || 'unpaid'}
                          onChange={(e) =>
                            updateRow(b.id, 'payment_status', e.target.value)
                          }
                        >
                          <option value="unpaid">unpaid</option>
                          <option value="paid">paid</option>
                          <option value="refunded">refunded</option>
                        </select>
                      </td>

                      <td style={td}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="button"
                            onClick={() => handleSave(b.id)}
                            disabled={savingId === b.id}
                          >
                            {savingId === b.id ? 'Saving...' : 'Save'}
                          </button>

                          <button
                            className="button secondary"
                            onClick={() =>
                              setOpenId(openId === b.id ? null : b.id)
                            }
                          >
                            {openId === b.id ? 'Close' : 'Details'}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {openId === b.id && (
                      <tr>
                        <td colSpan={7} style={{ padding: 16, background: '#fafafa' }}>
                          <div style={{ display: 'grid', gap: 12 }}>
                            <div>
                              <strong>Client Email:</strong> {b.client_email || '—'}
                            </div>
                            <div>
                              <strong>Provider:</strong> {b.staff?.name || 'Unassigned'}
                            </div>
                            <div>
                              <strong>Amount Due:</strong> ${b.amount_due ?? 0}
                            </div>
                            <div>
                              <strong>Amount Paid:</strong> ${b.amount_paid ?? 0}
                            </div>

                            <div>
                              <strong>Uploaded Inspiration Photos:</strong>
                              <div
                                style={{
                                  display: 'flex',
                                  gap: 12,
                                  flexWrap: 'wrap',
                                  marginTop: 12,
                                }}
                              >
                                {b.booking_photos && b.booking_photos.length > 0 ? (
                                  b.booking_photos.map((photo) => (
                                    <img
                                      key={photo.id}
                                      src={photo.public_url}
                                      alt="Inspiration"
                                      style={{
                                        width: 120,
                                        height: 120,
                                        objectFit: 'cover',
                                        borderRadius: 12,
                                        border: '1px solid #ddd',
                                      }}
                                    />
                                  ))
                                ) : (
                                  <span>No photos uploaded.</span>
                                )}
                              </div>
                            </div>
                          </div>
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
    </>
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
<div style={{ marginTop: 16 }}>
  <strong>Move Booking</strong>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, marginTop: 8 }}>
    <input
      type="date"
      onChange={(e) => {
        setRows((prev) =>
          prev.map((row) =>
            row.id === b.id ? { ...row, appointment_date: e.target.value } : row
          )
        );
      }}
      value={b.appointment_date || ''}
    />

    <input
      type="text"
      placeholder="e.g. 2:00 PM"
      onChange={(e) => {
        setRows((prev) =>
          prev.map((row) =>
            row.id === b.id ? { ...row, appointment_time: e.target.value } : row
          )
        );
      }}
      value={b.appointment_time || ''}
    />

    <button
      className="button secondary"
      onClick={async () => {
        const response = await fetch('/api/admin/bookings/reschedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: b.id,
            appointment_date: b.appointment_date,
            appointment_time: b.appointment_time,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          alert(result.error || 'Failed to move booking.');
          return;
        }

        alert('Booking moved successfully.');
      }}
    >
      Move
    </button>
  </div>
</div>
