import { createClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant';

export default async function ContactPage() {
  const supabase = await createClient();
  const tenant = await getCurrentTenant();

  const { data } = await supabase
    .from('site_content')
    .select('title, body, json_content')
    .eq('tenant_id', tenant.id)
    .eq('content_key', 'contact_page')
    .single();

  const content = data?.json_content || {};

  return (
    <main className="section shell">
      <p className="eyebrow">Contact</p>
      <h1>{data?.title || 'Contact Us'}</h1>
      <p className="muted max-2xl">
        {data?.body || 'Reach out for booking questions and support.'}
      </p>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card card-body">
          <h2>{content.email_heading || 'Email'}</h2>
          <p className="muted">
            {content.email_text || 'Use your business support email here.'}
          </p>
        </div>

        <div className="card card-body">
          <h2>{content.support_heading || 'Support'}</h2>
          <p className="muted">
            {content.support_text || 'Clients can manage appointments through the dashboard.'}
          </p>
        </div>
      </div>
    </main>
  );
}
