import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant';

type ServiceRow = {
  id: string;
  name: string | null;
  description: string | null;
  image_url: string | null;
};

export default async function ServicesPage() {
  const supabase = await createClient();
  const tenant = await getCurrentTenant();

  const { data, error } = await supabase
    .from('services')
    .select(`
      id,
      name,
      description,
      image_url
    `)
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    return (
      <main className="section shell">
        <p className="eyebrow">Services</p>
        <h1>Services</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  const services = (data ?? []) as ServiceRow[];

  return (
    <main className="section shell">
      <p className="eyebrow">Services</p>
      <h1>{tenant.name} Services</h1>
      <p className="muted max-2xl">
        Browse available services and book the experience that fits your needs.
      </p>

      {services.length === 0 ? (
        <div className="card card-body" style={{ marginTop: 24 }}>
          <p>No services available yet.</p>
        </div>
      ) : (
        <div className="dashboard-grid" style={{ marginTop: 24 }}>
          {services.map((service) => (
            <div key={service.id} className="card card-body">
              {service.image_url ? (
                <img
                  src={service.image_url}
                  alt={service.name || 'Service'}
                  style={{
                    width: '100%',
                    height: 220,
                    objectFit: 'cover',
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                />
              ) : null}

              <h2>{service.name || 'Untitled Service'}</h2>
              <p className="muted">{service.description || 'No description available.'}</p>

              <div className="actions-row" style={{ marginTop: 16 }}>
                <Link href="/book" className="button">
                  Book This Service
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
