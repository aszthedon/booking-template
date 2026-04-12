import { createClient } from '@/lib/supabase/server';

type StaffRow = {
  id: string;
  name: string | null;
  email: string | null;
  is_active: boolean | null;
};

export default async function AdminStaffPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('staff')
    .select('id, name, email, is_active')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <main className="section shell">
        <p className="eyebrow">Admin</p>
        <h1>Staff</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  const rows = (data ?? []) as StaffRow[];

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Staff</h1>

      <div className="card card-body" style={{ marginTop: 24 }}>
        {rows.length === 0 ? (
          <p>No staff records found.</p>
        ) : (
          <div className="list-stack">
            {rows.map((row) => (
              <div key={row.id} className="list-row">
                <strong>{row.name || 'Unnamed Staff Member'}</strong>
                <span>{row.email || 'No email'}</span>
                <span>Status: {row.is_active ? 'Active' : 'Inactive'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
