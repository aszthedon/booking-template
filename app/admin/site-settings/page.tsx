export default function AdminSiteSettingsPage() {
  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Site Settings</h1>
      <p className="muted max-2xl">
        Manage core site settings, branding, URLs, and platform-wide preferences here.
      </p>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card card-body">
          <h2>Branding</h2>
          <p className="muted">
            Update your business name, logo, email sender name, and overall presentation settings.
          </p>
        </div>

        <div className="card card-body">
          <h2>Platform Settings</h2>
          <p className="muted">
            Control default site configuration, metadata, and general booking behavior.
          </p>
        </div>
      </div>
    </main>
  );
}
