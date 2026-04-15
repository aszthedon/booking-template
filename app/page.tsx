import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

type HomepageSection = {
  id: string;
  section_key: string;
  title: string | null;
  body: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_href: string | null;
  sort_order: number;
  is_active: boolean;
};

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: settings }, { data: sections }] = await Promise.all([
    supabase.from('site_settings').select('*').limit(1).single(),
    supabase
      .from('homepage_sections')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ]);

  const rows = (sections ?? []) as HomepageSection[];

  return (
    <main>
      {rows.map((section, index) => {
        const isHero = index === 0;

        return (
          <section key={section.id} className="section shell">
            <div className="dashboard-grid mobile-one-col" style={{ alignItems: 'center' }}>
              <div>
                {isHero ? <p className="eyebrow">Welcome</p> : null}
                <h1>{section.title || settings?.business_name || 'Crown Studio'}</h1>
                <p className="muted max-2xl">
                  {section.body || settings?.tagline || 'Luxury booking website'}
                </p>

                {section.cta_label && section.cta_href ? (
                  <div className="actions-row" style={{ marginTop: 24 }}>
                    <Link href={section.cta_href} className="button">
                      {section.cta_label}
                    </Link>
                  </div>
                ) : null}
              </div>

              <div className="card card-body">
                {section.image_url ? (
                  <img
                    src={section.image_url}
                    alt={section.title || 'Homepage section image'}
                    style={{
                      width: '100%',
                      height: 320,
                      objectFit: 'cover',
                      borderRadius: 16,
                    }}
                  />
                ) : isHero && settings?.hero_image_url ? (
                  <img
                    src={settings.hero_image_url}
                    alt="Hero"
                    style={{
                      width: '100%',
                      height: 320,
                      objectFit: 'cover',
                      borderRadius: 16,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: 320,
                      borderRadius: 16,
                      background: '#f4f1ed',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    No image set
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </main>
  );
}
