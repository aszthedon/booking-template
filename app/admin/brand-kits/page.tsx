'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Tenant = {
  id: string;
  name: string;
};

type BrandKit = {
  id: string;
  tenant_id: string | null;
  name: string;
  business_name: string | null;
  tagline: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  primary_color: string | null;
  background_color: string | null;
  panel_color: string | null;
  text_color: string | null;
  muted_color: string | null;
  accent_soft: string | null;
  border_color: string | null;
  shadow: string | null;
  font_body: string | null;
  font_heading: string | null;
  border_radius: string | null;
  button_radius: string | null;
};

export default function AdminBrandKitsPage() {
  const supabase = createClient();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [kits, setKits] = useState<BrandKit[]>([]);
  const [themeId, setThemeId] = useState<string | null>(null);
  const [siteSettingsId, setSiteSettingsId] = useState<string | null>(null);

  const [newKitName, setNewKitName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const tenantRes = await fetch('/api/admin/current-tenant');
    const tenantJson = await tenantRes.json();

    if (!tenantRes.ok) {
      alert(tenantJson.error || 'Failed to load tenant.');
      return;
    }

    setTenant(tenantJson.tenant);

    const [{ data: kitData }, { data: themeData }, { data: settingsData }] =
      await Promise.all([
        supabase
          .from('brand_kits')
          .select('*')
          .eq('tenant_id', tenantJson.tenant.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('theme_settings')
          .select('id')
          .eq('tenant_id', tenantJson.tenant.id)
          .limit(1)
          .single(),
        supabase
          .from('site_settings')
          .select('id')
          .eq('tenant_id', tenantJson.tenant.id)
          .limit(1)
          .single(),
      ]);

    setKits(kitData || []);
    setThemeId(themeData?.id || null);
    setSiteSettingsId(settingsData?.id || null);
  }

  function updateKit(id: string, field: keyof BrandKit, value: string) {
    setKits((prev) =>
      prev.map((kit) => (kit.id === id ? { ...kit, [field]: value } : kit))
    );
  }

  async function createKit() {
    if (!tenant) return;
    if (!newKitName) {
      alert('Enter a kit name.');
      return;
    }

    const { data: theme } = await supabase
      .from('theme_settings')
      .select('*')
      .eq('tenant_id', tenant.id)
      .limit(1)
      .single();

    const { data: settings } = await supabase
      .from('site_settings')
      .select('*')
      .eq('tenant_id', tenant.id)
      .limit(1)
      .single();

    const { error } = await supabase.from('brand_kits').insert({
      tenant_id: tenant.id,
      name: newKitName,
      business_name: settings?.business_name || null,
      tagline: settings?.tagline || null,
      logo_url: settings?.logo_url || null,
      hero_image_url: settings?.hero_image_url || null,
      primary_color: theme?.primary_color || null,
      background_color: theme?.background_color || null,
      panel_color: theme?.panel_color || null,
      text_color: theme?.text_color || null,
      muted_color: theme?.muted_color || null,
      accent_soft: theme?.accent_soft || null,
      border_color: theme?.border_color || null,
      shadow: theme?.shadow || null,
      font_body: theme?.font_body || null,
      font_heading: theme?.font_heading || null,
      border_radius: theme?.border_radius || null,
      button_radius: theme?.button_radius || null,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setNewKitName('');
    loadData();
  }

  async function saveKit(kit: BrandKit) {
    const { error } = await supabase
      .from('brand_kits')
      .update({
        name: kit.name,
        business_name: kit.business_name,
        tagline: kit.tagline,
        logo_url: kit.logo_url,
        hero_image_url: kit.hero_image_url,
        primary_color: kit.primary_color,
        background_color: kit.background_color,
        panel_color: kit.panel_color,
        text_color: kit.text_color,
        muted_color: kit.muted_color,
        accent_soft: kit.accent_soft,
        border_color: kit.border_color,
        shadow: kit.shadow,
        font_body: kit.font_body,
        font_heading: kit.font_heading,
        border_radius: kit.border_radius,
        button_radius: kit.button_radius,
      })
      .eq('id', kit.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert(`Saved ${kit.name}`);
    loadData();
  }

  async function applyKit(kit: BrandKit) {
    if (!themeId || !siteSettingsId) return;

    const { error: settingsError } = await supabase
      .from('site_settings')
      .update({
        business_name: kit.business_name,
        tagline: kit.tagline,
        logo_url: kit.logo_url,
        hero_image_url: kit.hero_image_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', siteSettingsId);

    if (settingsError) {
      alert(settingsError.message);
      return;
    }

    const { error: themeError } = await supabase
      .from('theme_settings')
      .update({
        primary_color: kit.primary_color,
        background_color: kit.background_color,
        panel_color: kit.panel_color,
        text_color: kit.text_color,
        muted_color: kit.muted_color,
        accent_soft: kit.accent_soft,
        border_color: kit.border_color,
        shadow: kit.shadow,
        font_body: kit.font_body,
        font_heading: kit.font_heading,
        border_radius: kit.border_radius,
        button_radius: kit.button_radius,
        updated_at: new Date().toISOString(),
      })
      .eq('id', themeId);

    if (themeError) {
      alert(themeError.message);
      return;
    }

    alert(`Applied brand kit: ${kit.name}`);
  }

  async function deleteKit(id: string) {
    const { error } = await supabase
      .from('brand_kits')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    loadData();
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>{tenant?.name || 'Brand'} Brand Kits</h1>

      <div className="card card-body" style={{ marginTop: 24 }}>
        <div className="form-stack">
          <input
            placeholder="New kit name"
            value={newKitName}
            onChange={(e) => setNewKitName(e.target.value)}
          />
          <button className="button" onClick={createKit}>
            Save Current Brand as Kit
          </button>
        </div>
      </div>

      <div className="page-stack" style={{ marginTop: 24 }}>
        {kits.map((kit) => (
          <div key={kit.id} className="card card-body">
            <div className="form-stack">
              <input value={kit.name} onChange={(e) => updateKit(kit.id, 'name', e.target.value)} />
              <input value={kit.business_name || ''} onChange={(e) => updateKit(kit.id, 'business_name', e.target.value)} placeholder="Business Name" />
              <input value={kit.tagline || ''} onChange={(e) => updateKit(kit.id, 'tagline', e.target.value)} placeholder="Tagline" />
              <input value={kit.logo_url || ''} onChange={(e) => updateKit(kit.id, 'logo_url', e.target.value)} placeholder="Logo URL" />
              <input value={kit.hero_image_url || ''} onChange={(e) => updateKit(kit.id, 'hero_image_url', e.target.value)} placeholder="Hero Image URL" />
              <input value={kit.primary_color || ''} onChange={(e) => updateKit(kit.id, 'primary_color', e.target.value)} placeholder="Primary Color" />
              <input value={kit.background_color || ''} onChange={(e) => updateKit(kit.id, 'background_color', e.target.value)} placeholder="Background Color" />
              <input value={kit.font_heading || ''} onChange={(e) => updateKit(kit.id, 'font_heading', e.target.value)} placeholder="Heading Font" />

              <div className="actions-row">
                <button className="button" onClick={() => saveKit(kit)}>
                  Save Kit
                </button>
                <button className="button secondary" onClick={() => applyKit(kit)}>
                  Apply Kit
                </button>
                <button className="button secondary" onClick={() => deleteKit(kit.id)}>
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
