import Link from 'next/link';

export default function BookingCancelPage() {
  return (
    <main className="section shell">
      <div className="card card-body center-card">
        <p className="eyebrow">Payment Cancelled</p>
        <h1>Your booking was not completed</h1>
        <p className="muted">
          Your payment was cancelled before completion, so the appointment was not finalized.
          You can return to the booking flow whenever you’re ready.
        </p>

        <div className="actions-row" style={{ marginTop: 24 }}>
          <Link href="/book" className="button">
            Return to Booking
          </Link>
          <Link href="/policies" className="button secondary">
            Review Policies
          </Link>
        </div>
      </div>
    </main>
  );
}
