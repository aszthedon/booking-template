import Link from 'next/link';

export default function DashboardSidebar({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <aside
      style={{
        width: 240,
        borderRight: '1px solid #eee',
        padding: 24,
        minHeight: '100vh',
      }}
    >
      <h2 style={{ marginBottom: 24 }}>{title}</h2>
      <nav style={{ display: 'grid', gap: 12 }}>
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
