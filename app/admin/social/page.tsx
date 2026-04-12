export default function AdminSocialPage() {
  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Social Settings</h1>
      <p className="muted max-2xl">
        Manage social links, embedded content, and promotional integrations here.
      </p>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card card-body">
          <h2>Instagram</h2>
          <p className="muted">
            Add your Instagram profile, feed embed, or content links.
          </p>
        </div>

        <div className="card card-body">
          <h2>Other Social Platforms</h2>
          <p className="muted">
            Configure TikTok, Facebook, YouTube, and other branded links.
          </p>
        </div>
      </div>
    </main>
  );
}
