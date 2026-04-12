import { createClient } from '@/lib/supabase/server';

export default async function ContactPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('site_content')
    .select('title, body, json_content')
    .eq('content_key', 'contact_page')
    .single();

  const content = data?.json_content || {};

  return (
    <main className="section shell">
      <p className="eyebrow">Contact</p>
      <h1>{data?.title || 'Contact Us'}</h1>
      <p className="muted max-2xl">
        {data?.body || 'Reach out for booking questions, service inquiries, or support related to your appointment.'}
      </p>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card card-body">
          <h2>{content.email_heading || 'Email'}</h2>
          <p className="muted">
            {content.email_text || 'Use your business support email here for booking and service-related questions.'}
          </p>
        </div>

        <div className="card card-body">
          <h2>{content.support_heading || 'Support'}</h2>
          <p className="muted">
            {content.support_text || 'Clients can also manage appointments directly through the dashboard after logging in.'}
          </p>
        </div>
      </div>
    </main>
  );
}
