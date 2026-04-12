export default function AboutPage() {
  return (
    <main className="section shell">
      <p className="eyebrow">About</p>
      <h1>About Crown Studio</h1>
      <p className="muted max-2xl">
        Crown Studio is a premium booking experience designed to make scheduling,
        communication, deposits, and client management simple and polished.
      </p>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card card-body">
          <h2>Our Mission</h2>
          <p className="muted">
            We aim to provide a smooth and professional booking experience for
            both clients and providers, with clear scheduling, transparent
            policies, and a more elevated service process.
          </p>
        </div>

        <div className="card card-body">
          <h2>What We Offer</h2>
          <p className="muted">
            Clients can book appointments, upload inspiration photos, manage
            bookings, and receive updates, while staff and admin can manage
            scheduling, refunds, services, and reporting.
          </p>
        </div>
      </div>
    </main>
  );
}
