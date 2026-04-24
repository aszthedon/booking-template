import { createClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant';

export default async function AboutPage() {
  const supabase = await createClient();
  const tenant = await getCurrentTenant();

  const { data } = await supabase
    .from('site_content')
    .select('title, body, json_content')
    .eq('tenant_id', tenant.id)
    .eq('content_key', 'about_page')
    .single();

  const content = data?.json_content || {};

  return (
    <main className="section shell">
      <p className="eyebrow">About</p>
      <h1>{data?.title || `About ${tenant.name}`}</h1>
      <p className="muted max-2xl">
        {data?.body || 'Tell your brand story here.'}
      </p>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card card-body">
          <h2>{content.mission_heading || 'Our Mission'}</h2>
          <p className="muted">
            {content.mission_text || 'Describe your mission here.'}
          </p>
        </div>

        <div className="card card-body">
          <h2>{content.offer_heading || 'What We Offer'}</h2>
          <p className="muted">
            {content.offer_text || 'Describe the experience your business offers.'}
          </p>
        </div>
      </div>
    </main>
  );
}
