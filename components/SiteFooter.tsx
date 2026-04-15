import { createClient } from '@/lib/supabase/server';

export async function SiteFooter() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from('site_settings')
    .select(`
      business_name,
      tagline,
      support_email,
      phone,
      address
    `)
    .limit(1)
    .single();

  return (
    <footer className="section shell">
      <div className="card card-body">
        <h2>{settings?.business_name || 'Crown Studio'}</h2>
        <p className="muted">
          {settings?.tagline ||
            'Luxury booking, polished branding, and a premium client experience.'}
        </p>

        <div className="list-stack" style={{ marginTop: 16 }}>
          <div className="list-row">
            <strong>Email</strong>
            <span>{settings?.support_email || 'Not set'}</span>
          </div>

          <div className="list-row">
            <strong>Phone</strong>
            <span>{settings?.phone || 'Not set'}</span>
          </div>

          <div className="list-row">
            <strong>Address</strong>
            <span>{settings?.address || 'Not set'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
