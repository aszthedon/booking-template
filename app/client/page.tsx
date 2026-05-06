import { requireRole } from '@/lib/auth';

export default async function ClientDashboardPage() {
  await requireRole('client');

  return (
    <main className="section shell">
      <h1>Client Dashboard</h1>
    </main>
  );
}
