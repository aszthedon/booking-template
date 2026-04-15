import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('site_content')
    .select('title, body, json_content')
    .eq('content_key', 'homepage_content')
    .single();

  const content = data?.json_content || {};

  return (
    <main>
      <section className="shell section">
        <div className="dashboard-grid mobile-one-col" style={{ alignItems: 'center' }}>
          <div>
            <p className="eyebrow">{content.hero_eyebrow || 'Premium booking template'}</p>
            <h1>{content.hero_title || 'Crown Studio'}</h1>
            <p className="muted max-2xl">
              {content.hero_text ||
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
            <h2>{content.feature_1_title || 'Services with built-in variations'}</h2>
            <p className="muted">
              {content.feature_1_text ||
                'Each service can include multiple variations, pricing tiers, durations, deposits, and add-ons.'}
            </p>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="dashboard-grid">
          <div className="card card-body">
            <h2>{content.feature_2_title || 'Admin dashboard'}</h2>
            <p className="muted">
              {content.feature_2_text ||
                'Business name, address, policies, images, services, and content are managed without editing code.'}
            </p>
          </div>

          <div className="card card-body">
            <h2>{content.feature_3_title || 'Client dashboard'}</h2>
            <p className="muted">
              {content.feature_3_text ||
                'Clients can rebook, pay balances, upload inspiration photos, and manage appointments in one place.'}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
