import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="section shell">
      <p className="eyebrow">Supabase-ready template</p>
      <h1>Premium booking website</h1>
      <p className="muted max-2xl">
        This version is wired to Supabase for live services and service variations.
      </p>

      <div className="row gap-sm wrap" style={{ marginTop: 20 }}>
        <Link href="/services" className="button">
          View Services
        </Link>
        <Link href="/admin/services" className="button secondary">
          Admin Services
        </Link>
      </div>
    </main>
  );
}