'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type NavLink = {
  id: string;
  label: string;
  href: string;
  location: string;
  sort_order: number;
  is_active: boolean;
};

export default function AdminNavigationPage() {
  const supabase = createClient();
  const [links, setLinks] = useState<NavLink[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLinks();
  }, []);

  async function loadLinks() {
    const { data, error } = await supabase
      .from('navigation_links')
      .select('*')
      .order('location', { ascending: true })
      .order('sort_order', { ascending: true });

    if (!error) setLinks(data || []);
  }

  function updateLink(id: string, field: keyof NavLink, value: string | number | boolean) {
    setLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, [field]: value } : link))
    );
  }

  async function saveLink(link: NavLink) {
    setSaving(true);

    const { error } = await supabase
      .from('navigation_links')
      .update({
        label: link.label,
        href: link.href,
        location: link.location,
        sort_order: link.sort_order,
        is_active: link.is_active,
      })
      .eq('id', link.id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert(`Saved ${link.label}`);
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Navigation</h1>

      <div className="page-stack" style={{ marginTop: 24 }}>
        {links.map((link) => (
          <div key={link.id} className="card card-body">
            <div className="form-stack">
              <input value={link.label} onChange={(e) => updateLink(link.id, 'label', e.target.value)} placeholder="Label" />
              <input value={link.href} onChange={(e) => updateLink(link.id, 'href', e.target.value)} placeholder="Href" />
              <select value={link.location} onChange={(e) => updateLink(link.id, 'location', e.target.value)}>
                <option value="header">Header</option>
                <option value="footer">Footer</option>
              </select>
              <input
                type="number"
                value={link.sort_order}
                onChange={(e) => updateLink(link.id, 'sort_order', Number(e.target.value))}
                placeholder="Sort Order"
              />
              <label>
                <input
                  type="checkbox"
                  checked={link.is_active}
                  onChange={(e) => updateLink(link.id, 'is_active', e.target.checked)}
                />{' '}
                Active
              </label>

              <button className="button" onClick={() => saveLink(link)} disabled={saving}>
                {saving ? 'Saving...' : 'Save Link'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
