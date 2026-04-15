import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export async function SiteHeader() {
  const supabase = await createClient();

  const [{ data: settings }, { data: links }] = await Promise.all([
    supabase.from('site_settings').select('business_name').limit(1).single(),
    supabase
      .from('navigation_links')
      .select('label, href')
      .eq('location', 'header')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ]);

  return (
    <header>
      <div className="shell topbar">
        <Link href="/" className="brand">
          {settings?.business_name || 'Crown Studio'}
        </Link>

        <nav className="nav">
          {(links || []).map((link) => (
            <Link
              key={`${link.location}-${link.href}-${link.label}`}
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
