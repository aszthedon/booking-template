export default function ContactPage() {
  return (
    <main className="section shell">
      <p className="eyebrow">Contact</p>
      <h1>Contact Us</h1>
      <p className="muted max-2xl">
        Reach out for booking questions, service inquiries, or support related to your appointment.
      </p>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card card-body">
          <h2>Email</h2>
          <p className="muted">
            Use your business support email here for booking and service-related questions.
          </p>
        </div>

        <div className="card card-body">
          <h2>Support</h2>
          <p className="muted">
            Clients can also manage appointments directly through the dashboard after logging in.
          </p>
        </div>
      </div>
    </main>
  );
}
