import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant';

export async function SiteHeader() {
  const supabase = await createClient();

  let businessName = 'Booking Template';
  let links: { label: string; href: string }[] = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Book Now', href: '/book' },
  ];

  try {
    const tenant = await getCurrentTenant();

    if (tenant?.id) {
      businessName = tenant.name || businessName;

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

      businessName = settings?.business_name || businessName;
      links = navLinks?.length ? navLinks : links;
    }
  } catch {
    // Keep fallback header
  }

  return (
    <header>
      <div className="shell topbar">
        <Link href="/" className="brand">
          {businessName}
        </Link>

        <nav className="nav">
          {links.map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              className={link.label === 'Book Now' ? 'pill-link' : ''}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
