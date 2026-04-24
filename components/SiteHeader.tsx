import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant';

export async function SiteHeader() {
  const supabase = await createClient();
  const tenant = await getCurrentTenant();

  const [{ data: settings }, { data: links }] = await Promise.all([
    supabase
      .from('site_settings')
      .select('business_name')
      .eq('tenant_id', tenant.id)
      .limit(1)
      .single(),
    supabase
      .from('navigation_links')
      .select('label, href')
      .eq('tenant_id', tenant.id)
      .eq('location', 'header')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ]);

  const businessName = settings?.business_name || tenant.name || 'Booking Template';

  return (
    <header>
      <div className="shell topbar">
        <Link href="/" className="brand">
          {businessName}
        </Link>

        <nav className="nav">
          {(links || []).map((link) => (
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
