import { requireRole } from '@/lib/auth';

export default async function AdminPage() {
  await requireRole('admin');

  return (
    <div className="shell">
      <h1>Admin Dashboard</h1>
    </div>
  );
}
