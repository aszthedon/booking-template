'use client';

import { useState } from 'react';

type StaffBooking = {
  id: string;
  client_name: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  status: string | null;
  payment_status: string | null;
  services: { name: string | null } | null;
  service_variations: { name: string | null } | null;
};

export default function StaffScheduleManager({
  bookings,
}: {
  bookings: StaffBooking[];
}) {
  const [rows, setRows] = useState(bookings);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function updateStatus(bookingId: string, status: string) {
    setLoadingId(bookingId);

    const response = await fetch('/api/staff/bookings/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, status }),
    });

    const result = await response.json();
    setLoadingId(bookingId);

    if (!response.ok) {
      alert(result.error || 'Failed to update booking.');
      setLoadingId(null);
      return;
    }

    setRows((prev) =>
      prev.map((row) =>
        row.id === bookingId ? { ...row, status } : row
      )
    );

    setLoadingId(null);
  }

  return (
    <div className="card card-body" style={{ marginTop: 24 }}>
      {rows.length === 0 ? (
        <p>No appointments assigned yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Client</th>
              <th style={th}>Service</th>
              <th style={th}>Variation</th>
              <th style={th}>Date</th>
              <th style={th}>Time</th>
              <th style={th}>Booking Status</th>
              <th style={th}>Payment Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id}>
                <td style={td}>{b.client_name || '—'}</td>
                <td style={td}>{Array.isArray(b.services) ? b.services[0]?.name : b.services?.name}</td>
                <td style={td}>{Array.isArray(b.service_variations) ? b.service_variations[0]?.name : b.service_variations?.name}</td>
                <td style={td}>{b.appointment_date || '—'}</td>
                <td style={td}>{b.appointment_time || '—'}</td>
                <td style={td}>{b.status || '—'}</td>
                <td style={td}>{b.payment_status || '—'}</td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      className="button secondary"
                      onClick={() => updateStatus(b.id, 'confirmed')}
                      disabled={loadingId === b.id}
                    >
                      Confirm
                    </button>
                    <button
                      className="button secondary"
                      onClick={() => updateStatus(b.id, 'completed')}
                      disabled={loadingId === b.id}
                    >
                      Complete
                    </button>
                    <button
                      className="button secondary"
                      onClick={() => updateStatus(b.id, 'cancelled')}
                      disabled={loadingId === b.id}
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px',
  borderBottom: '1px solid #ddd',
};

const td: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #eee',
};
