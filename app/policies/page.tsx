export default function PoliciesPage() {
  return (
    <main className="section shell">
      <p className="eyebrow">Policies</p>
      <h1>Booking Policies</h1>
      <p className="muted max-2xl">
        Please review our booking, deposit, cancellation, and refund policies before scheduling.
      </p>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card card-body">
          <h2>Deposits</h2>
          <p className="muted">
            Deposits are required at checkout to secure your appointment. Deposit amounts vary by service and variation.
          </p>
        </div>

        <div className="card card-body">
          <h2>Cancellations</h2>
          <p className="muted">
            Cancellations made at least 48 hours before the appointment may be eligible for refund consideration.
            Cancellations made less than 48 hours before the appointment may not be refundable.
          </p>
        </div>

        <div className="card card-body">
          <h2>Rescheduling</h2>
          <p className="muted">
            Clients may reschedule based on provider availability. Rescheduled appointments must fit available provider hours and service duration requirements.
          </p>
        </div>

        <div className="card card-body">
          <h2>No-Shows</h2>
          <p className="muted">
            Failure to attend an appointment without notice may result in forfeited deposits and future booking restrictions.
          </p>
        </div>

        <div className="card card-body">
          <h2>Refunds</h2>
          <p className="muted">
            Approved refunds are processed back to the original payment method. Refund timing depends on the payment provider and banking institution.
          </p>
        </div>

        <div className="card card-body">
          <h2>Photos & Consultation</h2>
          <p className="muted">
            Clients are encouraged to upload inspiration photos before checkout. Photos help providers prepare and improve appointment accuracy.
          </p>
        </div>
      </div>
    </main>
  );
}
