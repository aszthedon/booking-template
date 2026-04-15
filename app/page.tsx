import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: settings }, { data: content }] = await Promise.all([
    supabase.from('site_settings').select('*').limit(1).single(),
    supabase
      .from('site_content')
      .select('title, body, json_content')
      .eq('content_key', 'homepage_content')
      .single(),
  ]);

  const json = content?.json_content || {};

  return (
    <main>
      <section className="shell section">
        <div className="dashboard-grid mobile-one-col" style={{ alignItems: 'center' }}>
          <div>
            <p className="eyebrow">{json.hero_eyebrow || 'Premium booking template'}</p>
            <h1>{json.hero_title || settings?.business_name || 'Crown Studio'}</h1>
            <p className="muted max-2xl">
              {json.hero_text ||
                settings?.tagline ||
                'Luxury booking, polished branding, and a premium client experience.'}
            </p>

            <div className="actions-row" style={{ marginTop: 24 }}>
              <Link href="/book" className="button">
                Book Now
              </Link>
              <Link href="/services" className="button secondary">
                View Services
              </Link>
            </div>
          </div>

          <div className="card card-body">
            {settings?.hero_image_url ? (
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
                Hero image not set
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="dashboard-grid">
          <div className="card card-body">
            <h2>{json.feature_1_title || 'Services with built-in variations'}</h2>
            <p className="muted">
              {json.feature_1_text ||
                'Each service can include multiple variations, pricing tiers, durations, deposits, and add-ons.'}
            </p>
          </div>

          <div className="card card-body">
            <h2>{json.feature_2_title || 'Admin dashboard'}</h2>
            <p className="muted">
              {json.feature_2_text ||
                'Business name, address, policies, images, services, and content are managed without editing code.'}
            </p>
          </div>

          <div className="card card-body">
            <h2>{json.feature_3_title || 'Client dashboard'}</h2>
            <p className="muted">
              {json.feature_3_text ||
                'Clients can rebook, pay balances, upload inspiration photos, and manage appointments in one place.'}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
