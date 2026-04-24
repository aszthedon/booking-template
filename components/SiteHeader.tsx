import Link from 'next/link';

export function SiteHeader() {
  const links = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'About', href: '/about' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Policies', href: '/policies' },
    { label: 'Contact', href: '/contact' },
    { label: 'Book Now', href: '/book' },
  ];

  return (
    <header className="lux-header">
      <div className="shell lux-nav-shell">
        <Link href="/" className="lux-brand">
          Booking Template
        </Link>

        <nav className="lux-nav-links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={link.label === 'Book Now' ? 'lux-nav-cta' : 'lux-nav-link'}
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
