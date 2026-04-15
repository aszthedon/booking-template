import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export async function SiteHeader() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from('site_settings')
    .select('business_name')
    .limit(1)
    .single();

  const businessName = settings?.business_name || 'Crown Studio';

  return (
    <header>
      <div className="shell topbar">
        <Link href="/" className="brand">
          {businessName}
        </Link>

        <nav className="nav">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/services">Services</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/testimonials">Testimonials</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/book" className="pill-link">
            Book Now
          </Link>
        </nav>
      </div>
    </header>
  );
}
