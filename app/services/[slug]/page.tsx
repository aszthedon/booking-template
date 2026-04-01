import { createClient } from '@/lib/supabase/server';

type Variation = {
  id: string;
  name: string;
  description: string | null;
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
  full_description: string | null;
  image_url: string | null;
  service_variations: Variation[];
};

export default async function ServiceDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: service, error } = await supabase
    .from('services')
    .select(`
      id,
      name,
      slug,
      category,
      full_description,
      image_url,
      service_variations (
        id,
        name,
        description,
        price,
        duration_minutes,
        deposit_type,
        deposit_value
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !service) {
    return (
      <main className="section shell">
        <h1>Service not found</h1>
      </main>
    );
  }

  const typedService = service as Service;

  return (
    <main className="section shell">
      <p className="eyebrow">{typedService.category}</p>
      <h1>{typedService.name}</h1>

      {typedService.image_url ? (
        <img
          src={typedService.image_url}
          alt={typedService.name}
          className="card-image card"
          style={{ marginTop: 20 }}
        />
      ) : null}

      <p className="muted" style={{ marginTop: 20 }}>
        {typedService.full_description || 'No full description yet.'}
      </p>

      <section style={{ marginTop: 28 }}>
        <h2>Variations</h2>
        <div className="grid grid-2" style={{ marginTop: 16 }}>
          {typedService.service_variations.map((variation) => (
            <article key={variation.id} className="card card-body">
              <h3>{variation.name}</h3>
              <p className="muted">{variation.description}</p>
              <p>
                <strong>${variation.price}</strong> · {variation.duration_minutes} min
              </p>
              <p className="muted">
                Deposit:{' '}
                {variation.deposit_type === 'flat'
                  ? `$${variation.deposit_value}`
                  : `${variation.deposit_value}%`}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}