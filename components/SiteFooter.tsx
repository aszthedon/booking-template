import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant';

export async function SiteFooter() {
  const supabase = await createClient();

  let settings = {
    business_name: 'Booking Template',
    tagline: 'Luxury booking, polished branding, and a premium client experience.',
    support_email: 'Not set',
    phone: 'Not set',
    address: 'Not set',
  };

  let links: { label: string; href: string }[] = [
    { label: 'Policies', href: '/policies' },
    { label: 'Contact', href: '/contact' },
  ];

  try {
    const tenant = await getCurrentTenant();

    if (tenant?.id) {
      const [{ data: siteSettings }, { data: footerLinks }] = await Promise.all([
        supabase
          .from('site_settings')
          .select('business_name, tagline, support_email, phone, address')
          .eq('tenant_id', tenant.id)
          .limit(1)
          .maybeSingle(),
        supabase
          .from('navigation_links')
          .select('label, href')
          .eq('tenant_id', tenant.id)
          .eq('location', 'footer')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
      ]);

      settings = {
        business_name: siteSettings?.business_name || tenant.name || settings.business_name,
        tagline: siteSettings?.tagline || settings.tagline,
        support_email: siteSettings?.support_email || settings.support_email,
        phone: siteSettings?.phone || settings.phone,
        address: siteSettings?.address || settings.address,
      };

      links = footerLinks?.length ? footerLinks : links;
    }
  } catch {
    // Keep fallback footer
  }

  return (
    <footer className="section shell">
      <div className="card card-body">
        <h2>{settings.business_name}</h2>
        <p className="muted">{settings.tagline}</p>

        <div className="dashboard-grid" style={{ marginTop: 24 }}>
          <div className="list-stack">
            <div className="list-row">
              <strong>Email</strong>
              <span>{settings.support_email}</span>
            </div>
            <div className="list-row">
              <strong>Phone</strong>
              <span>{settings.phone}</span>
            </div>
            <div className="list-row">
              <strong>Address</strong>
              <span>{settings.address}</span>
            </div>
          </div>

          <div className="list-stack">
            {links.map((link) => (
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
