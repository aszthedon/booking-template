import { createClient } from '@/lib/supabase/server';

type PaymentRow = {
  id: string;
  client_name: string | null;
  client_email: string | null;
  payment_status: string | null;
  amount_due: number | null;
  amount_paid: number | null;
  refund_status: string | null;
};

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      client_name,
      client_email,
      payment_status,
      amount_due,
      amount_paid,
      refund_status
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <main className="section shell">
        <p className="eyebrow">Admin</p>
        <h1>Payments</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  const rows = (data ?? []) as PaymentRow[];

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Payments</h1>

      <div className="card card-body" style={{ marginTop: 24 }}>
        {rows.length === 0 ? (
          <p>No payment records found.</p>
        ) : (
          <div className="list-stack">
            {rows.map((row) => (
              <div key={row.id} className="list-row">
                <strong>{row.client_name || 'Client'}</strong>
                <span>{row.client_email || '—'}</span>
                <span>Payment: {row.payment_status || '—'}</span>
                <span>Amount Due: ${row.amount_due ?? 0}</span>
                <span>Amount Paid: ${row.amount_paid ?? 0}</span>
                <span>Refund Status: {row.refund_status || 'not_refunded'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
