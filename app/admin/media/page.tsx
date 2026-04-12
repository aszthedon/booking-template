import { createClient } from '@/lib/supabase/server';

type PhotoRow = {
  id: string;
  public_url: string | null;
  client_email: string | null;
  created_at: string | null;
};

export default async function AdminMediaPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('booking_photos')
    .select(`
      id,
      public_url,
      client_email,
      created_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <main className="section shell">
        <p className="eyebrow">Admin</p>
        <h1>Media Library</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  const photos = (data ?? []) as PhotoRow[];

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Media Library</h1>
      <p className="muted max-2xl">
        Review uploaded inspiration photos and media associated with bookings.
      </p>

      {photos.length === 0 ? (
        <div className="card card-body" style={{ marginTop: 24 }}>
          <p>No uploaded media found.</p>
        </div>
      ) : (
        <div className="dashboard-grid" style={{ marginTop: 24 }}>
          {photos.map((photo) => (
            <div key={photo.id} className="card card-body">
              {photo.public_url ? (
                <img
                  src={photo.public_url}
                  alt="Uploaded inspiration"
                  style={{
                    width: '100%',
                    height: 220,
                    objectFit: 'cover',
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: 220,
                    borderRadius: 12,
                    marginBottom: 12,
                    background: '#f4f1ed',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  No Preview
                </div>
              )}

              <strong>{photo.client_email || 'Unknown Client'}</strong>
              <span className="muted">
                Uploaded: {photo.created_at ? new Date(photo.created_at).toLocaleString() : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
