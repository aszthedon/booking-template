import Link from 'next/link';

export default function BookingCancelPage() {
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
        <p className="eyebrow">Payment Cancelled</p>
        <h1>Your booking was not completed</h1>
        <p className="muted max-2xl" style={{ margin: '0 auto' }}>
          Your payment was cancelled before completion, so your booking was not finalized.
          You can return to the booking page and try again whenever you’re ready.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: 24,
          }}
        >
          <Link href="/book" className="button">
            Return to Booking
          </Link>
          <Link href="/" className="button secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
