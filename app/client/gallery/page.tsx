import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

type PhotoRow = {
  id: string;
  public_url: string;
  created_at: string | null;
  bookings: {
    appointment_date: string | null;
    appointment_time: string | null;
    services: { name: string | null } | null;
    service_variations: { name: string | null } | null;
  } | null;
};

export default async function ClientGalleryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('booking_photos')
    .select(`
      id,
      public_url,
      created_at,
      bookings (
        appointment_date,
        appointment_time,
        services ( name ),
        service_variations ( name )
      )
    `)
    .eq('client_email', user.email)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <main className="section shell">
        <p className="eyebrow">Client Dashboard</p>
        <h1>My Photo History</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  const photos = (data ?? []) as PhotoRow[];

  return (
    <main className="section shell">
      <p className="eyebrow">Client Dashboard</p>
      <h1>My Inspiration Photo History</h1>

      {photos.length === 0 ? (
        <div className="card card-body" style={{ marginTop: 24 }}>
          <p>No uploaded inspiration photos yet.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            marginTop: 24,
          }}
        >
          {photos.map((photo) => {
            const booking = Array.isArray(photo.bookings)
              ? photo.bookings[0]
              : photo.bookings;

            const serviceName = Array.isArray(booking?.services)
              ? booking?.services[0]?.name
              : booking?.services?.name;

            const variationName = Array.isArray(booking?.service_variations)
              ? booking?.service_variations[0]?.name
              : booking?.service_variations?.name;

            return (
              <div key={photo.id} className="card card-body">
                <img
                  src={photo.public_url}
                  alt="Inspiration"
                  style={{
                    width: '100%',
                    height: 220,
                    objectFit: 'cover',
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                />
                <strong>{serviceName || 'Service'}</strong>
                <span>{variationName || 'Variation'}</span>
                <span>{booking?.appointment_date || '—'} at {booking?.appointment_time || '—'}</span>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
