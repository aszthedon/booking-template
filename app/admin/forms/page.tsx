export default function AdminFormsPage() {
  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Forms</h1>
      <p className="muted max-2xl">
        Manage booking forms, intake forms, and client questionnaire settings.
      </p>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card card-body">
          <h2>Client Intake</h2>
          <p className="muted">
            Use this area to manage appointment intake requirements and custom fields.
          </p>
        </div>

        <div className="card card-body">
          <h2>Policies & Consent</h2>
          <p className="muted">
            Review and update the booking terms clients agree to before checkout.
          </p>
        </div>
      </div>
    </main>
  );
}
