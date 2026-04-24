'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Tenant = {
  id: string;
  name: string;
};

type SiteSettings = {
  id: string;
  tenant_id: string | null;
  business_name: string | null;
  tagline: string | null;
  support_email: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
};

export default function AdminSiteSettingsPage() {
  const supabase = createClient();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const tenantRes = await fetch('/api/admin/current-tenant');
    const tenantJson = await tenantRes.json();

    if (!tenantRes.ok) {
      alert(tenantJson.error || 'Failed to load tenant.');
      return;
    }

    setTenant(tenantJson.tenant);

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('tenant_id', tenantJson.tenant.id)
      .limit(1)
      .single();

    if (!error) setSettings(data);
  }

  function updateField(field: keyof SiteSettings, value: string) {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  }

  async function saveSettings() {
    if (!settings) return;
    setSaving(true);

    const { error } = await supabase
      .from('site_settings')
      .update({
        business_name: settings.business_name,
        tagline: settings.tagline,
        support_email: settings.support_email,
        phone: settings.phone,
        address: settings.address,
        logo_url: settings.logo_url,
        hero_image_url: settings.hero_image_url,
        instagram_url: settings.instagram_url,
        facebook_url: settings.facebook_url,
        tiktok_url: settings.tiktok_url,
        youtube_url: settings.youtube_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', settings.id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert('Site settings updated');
  }

  if (!settings) {
    return (
      <main className="section shell">
        <h1>Site Settings</h1>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>{tenant?.name || 'Brand'} Site Settings</h1>

      <div className="card card-body" style={{ marginTop: 24 }}>
        <div className="form-stack">
          <input value={settings.business_name || ''} onChange={(e) => updateField('business_name', e.target.value)} placeholder="Business Name" />
          <input value={settings.tagline || ''} onChange={(e) => updateField('tagline', e.target.value)} placeholder="Tagline" />
          <input value={settings.support_email || ''} onChange={(e) => updateField('support_email', e.target.value)} placeholder="Support Email" />
          <input value={settings.phone || ''} onChange={(e) => updateField('phone', e.target.value)} placeholder="Phone" />
          <input value={settings.address || ''} onChange={(e) => updateField('address', e.target.value)} placeholder="Address" />
          <input value={settings.logo_url || ''} onChange={(e) => updateField('logo_url', e.target.value)} placeholder="Logo URL" />
          <input value={settings.hero_image_url || ''} onChange={(e) => updateField('hero_image_url', e.target.value)} placeholder="Hero Image URL" />
          <input value={settings.instagram_url || ''} onChange={(e) => updateField('instagram_url', e.target.value)} placeholder="Instagram URL" />
          <input value={settings.facebook_url || ''} onChange={(e) => updateField('facebook_url', e.target.value)} placeholder="Facebook URL" />
          <input value={settings.tiktok_url || ''} onChange={(e) => updateField('tiktok_url', e.target.value)} placeholder="TikTok URL" />
          <input value={settings.youtube_url || ''} onChange={(e) => updateField('youtube_url', e.target.value)} placeholder="YouTube URL" />

          <button className="button" onClick={saveSettings} disabled={saving}>
            {saving ? 'Saving...' : 'Save Site Settings'}
          </button>
        </div>
      </div>
    </main>
  );
}
