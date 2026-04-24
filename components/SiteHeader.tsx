import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant';

const defaultLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Policies', href: '/policies' },
  { label: 'Contact', href: '/contact' },
  { label: 'Book Now', href: '/book' },
];

export async function SiteHeader() {
  const supabase = await createClient();

  let businessName = 'Booking Template';
  let links = defaultLinks;

  try {
    const tenant = await getCurrentTenant();

    if (tenant?.id) {
      const [{ data: settings }, { data: navLinks }] = await Promise.all([
        supabase
          .from('site_settings')
          .select('business_name')
          .eq('tenant_id', tenant.id)
          .limit(1)
          .maybeSingle(),
        supabase
          .from('navigation_links')
          .select('label, href')
          .eq('tenant_id', tenant.id)
          .eq('location', 'header')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
      ]);

      businessName = settings?.business_name || tenant.name || businessName;

      const merged = [...(navLinks || []), ...defaultLinks];
      links = Array.from(new Map(merged.map((link) => [link.href, link])).values());
    }
  } catch {
    links = defaultLinks;
  }

  return (
    <header className="lux-header">
      <div className="shell lux-nav-shell">
        <Link href="/" className="lux-brand">
          {businessName}
        </Link>

        <nav className="lux-nav-links">
          {links.map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              className={link.label.toLowerCase().includes('book') ? 'lux-nav-cta' : 'lux-nav-link'}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="portal-menu">
          <span className="portal-trigger">Portals</span>

          <div className="portal-dropdown">
            <Link href="/login">Login</Link>
            <Link href="/client/appointments">Client</Link>
            <Link href="/staff">Staff</Link>
            <Link href="/admin">Admin</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
