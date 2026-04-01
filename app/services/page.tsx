import { createClient } from '@/lib/supabase/server';

type Variation = {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  deposit_type: 'flat' | 'percent';
  deposit_value: number;
};

type Service = {
  id: string;
  name: string;
  slug: string;
  category: string;
  short_description: string | null;
  full_description: string | null;
  image_url: string | null;
  service_variations: Variation[];
};

export default async function ServicesPage() {
  const supabase = await createClient();

  const { data: services, error } = await supabase
    .from('services')
    .select(`
      id,
      name,
      slug,
      category,
      short_description,
      full_description,
      image_url,
      service_variations (
        id,
        name,
        price,
        duration_minutes,
        deposit_type,
        deposit_value
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    return (
      <main className="section shell">
        <h1>Services</h1>
        <p>Failed to load services.</p>
        <pre>{error.message}</pre>
      </main>
    );
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Services</p>
      <h1>Live services from Supabase</h1>
      <p className="muted max-2xl">
        This page is now database-driven instead of using mock template data.
      </p>

      <div className="grid grid-2" style={{ marginTop: 24 }}>
        {(services as Service[] | null)?.map((service) => (
          <article key={service.id} className="card">
            {service.image_url ? (
              <img src={service.image_url} alt={service.name} className="card-image" />
            ) : null}

            <div className="card-body">
              <p className="eyebrow">{service.category}</p>
              <h2>{service.name}</h2>
              <p className="muted">{service.short_description}</p>

              <div style={{ marginTop: 16 }}>
                <h3>Variations</h3>
                {service.service_variations?.length ? (
                  <ul>
                    {service.service_variations.map((variation) => (
                      <li key={variation.id}>
                        <strong>{variation.name}</strong> — ${variation.price} — {variation.duration_minutes} min — deposit{' '}
                        {variation.deposit_type === 'flat'
                          ? `$${variation.deposit_value}`
                          : `${variation.deposit_value}%`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">No variations yet.</p>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}