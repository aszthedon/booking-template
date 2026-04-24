import { createClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant';

type PhotoRow = {
  id: string;
  public_url: string | null;
  client_email: string | null;
  created_at: string | null;
};

export default async function GalleryPage() {
  const supabase = await createClient();
  const tenant = await getCurrentTenant();

  const { data, error } = await supabase
    .from('booking_photos')
    .select(`
      id,
      public_url,
      client_email,
      created_at
    `)
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <main className="section shell">
        <p className="eyebrow">Gallery</p>
        <h1>Gallery</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  const photos = (data ?? []) as PhotoRow[];

  return (
    <main className="section shell">
      <p className="eyebrow">Gallery</p>
      <h1>{tenant.name} Gallery</h1>
      <p className="muted max-2xl">
        Browse inspiration images and visual references connected to this brand’s bookings.
      </p>

      {photos.length === 0 ? (
        <div className="card card-body" style={{ marginTop: 24 }}>
          <p>No gallery images available yet.</p>
        </div>
      ) : (
        <div className="dashboard-grid" style={{ marginTop: 24 }}>
          {photos.map((photo) => (
            <div key={photo.id} className="card card-body">
              {photo.public_url ? (
                <img
                  src={photo.public_url}
                  alt="Gallery item"
                  style={{
                    width: '100%',
                    height: 240,
                    objectFit: 'cover',
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                />
              ) : null}

              <strong>{photo.client_email || 'Unknown Client'}</strong>
              <span className="muted">
                Uploaded:{' '}
                {photo.created_at
                  ? new Date(photo.created_at).toLocaleString()
                  : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
