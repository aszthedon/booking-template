export default function AdminContentPage() {
  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Content</h1>
      <p className="muted max-2xl">
        Manage homepage text, marketing copy, and informational sections across the site.
      </p>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card card-body">
          <h2>Homepage Content</h2>
          <p className="muted">
            Update landing page headlines, service descriptions, and call-to-action sections.
          </p>
        </div>

        <div className="card card-body">
          <h2>Support Pages</h2>
          <p className="muted">
            Manage text for About, Contact, Policies, and other informational pages.
          </p>
        </div>
      </div>
    </main>
  );
}
