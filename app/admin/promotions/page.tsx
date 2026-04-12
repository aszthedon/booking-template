import { createClient } from '@/lib/supabase/server';

type PromotionRow = {
  id: string;
  code: string | null;
  title: string | null;
  description: string | null;
  discount_type: string | null;
  discount_value: number | null;
  is_active: boolean | null;
  created_at: string | null;
};

export default async function AdminPromotionsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('promotions')
    .select(`
      id,
      code,
      title,
      description,
      discount_type,
      discount_value,
      is_active,
      created_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <main className="section shell">
        <p className="eyebrow">Admin</p>
        <h1>Promotions</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  const promotions = (data ?? []) as PromotionRow[];

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Promotions</h1>
      <p className="muted max-2xl">
        Manage discount codes, marketing offers, and limited-time booking promotions.
      </p>

      {promotions.length === 0 ? (
        <div className="card card-body" style={{ marginTop: 24 }}>
          <p>No promotions found.</p>
        </div>
      ) : (
        <div className="dashboard-grid" style={{ marginTop: 24 }}>
          {promotions.map((promo) => (
            <div key={promo.id} className="card card-body">
              <h2>{promo.title || 'Untitled Promotion'}</h2>
              <p className="muted">{promo.description || 'No description provided.'}</p>

              <div className="list-stack" style={{ marginTop: 16 }}>
                <div className="list-row">
                  <strong>Code</strong>
                  <span>{promo.code || '—'}</span>
                </div>

                <div className="list-row">
                  <strong>Discount Type</strong>
                  <span>{promo.discount_type || '—'}</span>
                </div>

                <div className="list-row">
                  <strong>Discount Value</strong>
                  <span>{promo.discount_value ?? 0}</span>
                </div>

                <div className="list-row">
                  <strong>Status</strong>
                  <span>{promo.is_active ? 'Active' : 'Inactive'}</span>
                </div>

                <div className="list-row">
                  <strong>Created</strong>
                  <span>
                    {promo.created_at
                      ? new Date(promo.created_at).toLocaleString()
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
