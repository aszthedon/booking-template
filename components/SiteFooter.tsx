import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant';

export async function SiteFooter() {
  const supabase = await createClient();
  const tenant = await getCurrentTenant();

  const [{ data: settings }, { data: links }] = await Promise.all([
    supabase
      .from('site_settings')
      .select('business_name, tagline, support_email, phone, address')
      .eq('tenant_id', tenant.id)
      .limit(1)
      .single(),
    supabase
      .from('navigation_links')
      .select('label, href')
      .eq('tenant_id', tenant.id)
      .eq('location', 'footer')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ]);

  return (
    <footer className="section shell">
      <div className="card card-body">
        <h2>{settings?.business_name || tenant.name || 'Booking Template'}</h2>
        <p className="muted">
          {settings?.tagline || 'Luxury booking, polished branding, and a premium client experience.'}
        </p>

        <div className="dashboard-grid" style={{ marginTop: 24 }}>
          <div className="list-stack">
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

          <div className="list-stack">
            {(links || []).map((link) => (
              <div key={`${link.href}-${link.label}`} className="list-row">
                <Link href={link.href}>{link.label}</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
