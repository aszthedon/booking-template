'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Tenant = {
  id: string;
  name: string;
};

type NavLink = {
  id: string;
  tenant_id: string | null;
  label: string;
  href: string;
  location: string;
  sort_order: number;
  is_active: boolean;
};

export default function AdminNavigationPage() {
  const supabase = createClient();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [links, setLinks] = useState<NavLink[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [newHref, setNewHref] = useState('');
  const [newLocation, setNewLocation] = useState('header');

  useEffect(() => {
    loadLinks();
  }, []);

  async function loadLinks() {
    const tenantRes = await fetch('/api/admin/current-tenant');
    const tenantJson = await tenantRes.json();

    if (!tenantRes.ok) {
      alert(tenantJson.error || 'Failed to load tenant.');
      return;
    }

    setTenant(tenantJson.tenant);

    const { data, error } = await supabase
      .from('navigation_links')
      .select('*')
      .eq('tenant_id', tenantJson.tenant.id)
      .order('location', { ascending: true })
      .order('sort_order', { ascending: true });

    if (!error) setLinks(data || []);
  }

  function updateField(id: string, field: keyof NavLink, value: string | number | boolean) {
    setLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, [field]: value } : link))
    );
  }

  async function saveLink(link: NavLink) {
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

    if (error) {
      alert(error.message);
      return;
    }

    loadLinks();
  }

  async function addLink() {
    if (!tenant) return;

    if (!newLabel || !newHref) {
      alert('Label and href are required.');
      return;
    }

    const maxOrder =
      Math.max(
        0,
        ...links
          .filter((l) => l.location === newLocation)
          .map((l) => l.sort_order)
      ) + 1;

    const { error } = await supabase.from('navigation_links').insert({
      tenant_id: tenant.id,
      label: newLabel,
      href: newHref,
      location: newLocation,
      sort_order: maxOrder,
      is_active: true,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setNewLabel('');
    setNewHref('');
    setNewLocation('header');
    loadLinks();
  }

  async function deleteLink(id: string) {
    const { error } = await supabase
      .from('navigation_links')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    loadLinks();
  }

  function moveLink(id: string, direction: 'up' | 'down') {
    setLinks((prev) => {
      const sorted = [...prev];
      const index = sorted.findIndex((item) => item.id === id);
      if (index === -1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= sorted.length) return prev;

      const current = sorted[index];
      const target = sorted[targetIndex];

      if (current.location !== target.location) return prev;

      const currentOrder = current.sort_order;
      current.sort_order = target.sort_order;
      target.sort_order = currentOrder;

      return [...sorted];
    });
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>{tenant?.name || 'Brand'} Navigation</h1>

      <div className="card card-body" style={{ marginTop: 24 }}>
        <h2>Add Link</h2>
        <div className="form-stack">
          <input
            placeholder="Label"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
          <input
            placeholder="Href"
            value={newHref}
            onChange={(e) => setNewHref(e.target.value)}
          />
          <select value={newLocation} onChange={(e) => setNewLocation(e.target.value)}>
            <option value="header">Header</option>
            <option value="footer">Footer</option>
          </select>
          <button className="button" onClick={addLink}>
            Add Link
          </button>
        </div>
      </div>

      <div className="page-stack" style={{ marginTop: 24 }}>
        {links.map((link) => (
          <div key={link.id} className="card card-body">
            <div className="form-stack">
              <input
                value={link.label}
                onChange={(e) => updateField(link.id, 'label', e.target.value)}
              />
              <input
                value={link.href}
                onChange={(e) => updateField(link.id, 'href', e.target.value)}
              />
              <select
                value={link.location}
                onChange={(e) => updateField(link.id, 'location', e.target.value)}
              >
                <option value="header">Header</option>
                <option value="footer">Footer</option>
              </select>
              <input
                type="number"
                value={link.sort_order}
                onChange={(e) => updateField(link.id, 'sort_order', Number(e.target.value))}
              />
              <label>
                <input
                  type="checkbox"
                  checked={link.is_active}
                  onChange={(e) => updateField(link.id, 'is_active', e.target.checked)}
                />{' '}
                Active
              </label>

              <div className="actions-row">
                <button className="button secondary" onClick={() => moveLink(link.id, 'up')}>
                  Move Up
                </button>
                <button className="button secondary" onClick={() => moveLink(link.id, 'down')}>
                  Move Down
                </button>
                <button className="button" onClick={() => saveLink(link)}>
                  Save
                </button>
                <button className="button secondary" onClick={() => deleteLink(link.id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
