import Link from 'next/link';

export default function BookingSuccessPage() {
  return (
    <main className="section shell">
      <div className="card card-body center-card">
        <p className="eyebrow">Booking Confirmed</p>
        <h1>Your appointment is secured</h1>
        <p className="muted">
          Your deposit was received successfully. Your provider will see the appointment in their schedule,
          and you can manage your booking from your client dashboard.
        </p>

        <div className="page-stack" style={{ marginTop: 24 }}>
          <div className="list-row">
            <strong>Next steps</strong>
            <span>Check your email for your confirmation.</span>
            <span>Review your appointment details in your dashboard.</span>
            <span>Upload any additional inspiration photos if needed.</span>
          </div>
        </div>

        <div className="actions-row" style={{ marginTop: 24 }}>
          <Link href="/client/appointments" className="button">
            View My Appointments
          </Link>
          <Link href="/client/gallery" className="button secondary">
            View My Photo History
          </Link>
        </div>
      </div>
    </main>
  );
}
