import { requireUser } from '@/lib/auth';

export default async function ClientDashboardPage() {
  // 🔐 LOCK: must be logged in
  await requireUser();

  return (
    <main className="section shell">
      <p className="eyebrow">Client Dashboard</p>
      <h1>Welcome back</h1>
      <p className="muted">
        This private dashboard is where clients manage appointments, forms, payments, uploads, and preferences.
      </p>
    </main>
  );
}
