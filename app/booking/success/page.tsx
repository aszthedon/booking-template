import Link from 'next/link';

export default function BookingSuccessPage() {
  return (
    <main className="section shell">
      <div
        className="card card-body"
        style={{
          maxWidth: 720,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <p className="eyebrow">Booking Confirmed</p>
        <h1>Your deposit was received</h1>
        <p className="muted max-2xl" style={{ margin: '0 auto' }}>
          Your appointment has been created and your payment was submitted successfully.
          A confirmation email should arrive shortly, and you can review your bookings in your dashboard.
        </p>

        <div
          style={{
            display: 'grid',
            gap: 12,
            marginTop: 24,
          }}
        >
          <div className="list-row">
            <strong>What happens next?</strong>
            <span>Check your email for confirmation details.</span>
            <span>Review your booking inside your client dashboard.</span>
            <span>Upload additional inspiration photos anytime if needed.</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: 24,
          }}
        >
          <Link href="/client/appointments" className="button">
            View My Appointments
          </Link>
          <Link href="/book" className="button secondary">
            Book Another Appointment
          </Link>
        </div>
      </div>
    </main>
  );
}
