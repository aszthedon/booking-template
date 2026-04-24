import { createClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant';

type AssetRow = {
  id: string;
  title: string | null;
  public_url: string | null;
  created_at: string | null;
};

export default async function AdminMediaPage() {
  const supabase = await createClient();
  const tenant = await getCurrentTenant();

  const { data, error } = await supabase
    .from('media_assets')
    .select(`
      id,
      title,
      public_url,
      created_at
    `)
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <main className="section shell">
        <h1>Media Library</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  const assets = (data ?? []) as AssetRow[];

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>{tenant.name} Media Library</h1>

      {assets.length === 0 ? (
        <div className="card card-body" style={{ marginTop: 24 }}>
          <p>No media assets found.</p>
        </div>
      ) : (
        <div className="dashboard-grid" style={{ marginTop: 24 }}>
          {assets.map((asset) => (
            <div key={asset.id} className="card card-body">
              {asset.public_url ? (
                <img
                  src={asset.public_url}
                  alt={asset.title || 'Media asset'}
                  style={{
                    width: '100%',
                    height: 220,
                    objectFit: 'cover',
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                />
              ) : null}

              <strong>{asset.title || 'Untitled Asset'}</strong>
              <span className="muted">
                {asset.created_at
                  ? new Date(asset.created_at).toLocaleString()
                  : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
