'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type SiteSettings = {
  id: string;
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
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
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
      <h1>Site Settings</h1>

      <div className="card card-body" style={{ marginTop: 24 }}>
        <div className="form-stack">
          <input
            placeholder="Business Name"
            value={settings.business_name || ''}
            onChange={(e) => updateField('business_name', e.target.value)}
          />
          <input
            placeholder="Tagline"
            value={settings.tagline || ''}
            onChange={(e) => updateField('tagline', e.target.value)}
          />
          <input
            placeholder="Support Email"
            value={settings.support_email || ''}
            onChange={(e) => updateField('support_email', e.target.value)}
          />
          <input
            placeholder="Phone"
            value={settings.phone || ''}
            onChange={(e) => updateField('phone', e.target.value)}
          />
          <input
            placeholder="Address"
            value={settings.address || ''}
            onChange={(e) => updateField('address', e.target.value)}
          />
          <input
            placeholder="Logo URL"
            value={settings.logo_url || ''}
            onChange={(e) => updateField('logo_url', e.target.value)}
          />
          <input
            placeholder="Hero Image URL"
            value={settings.hero_image_url || ''}
            onChange={(e) => updateField('hero_image_url', e.target.value)}
          />
          <input
            placeholder="Instagram URL"
            value={settings.instagram_url || ''}
            onChange={(e) => updateField('instagram_url', e.target.value)}
          />
          <input
            placeholder="Facebook URL"
            value={settings.facebook_url || ''}
            onChange={(e) => updateField('facebook_url', e.target.value)}
          />
          <input
            placeholder="TikTok URL"
            value={settings.tiktok_url || ''}
            onChange={(e) => updateField('tiktok_url', e.target.value)}
          />
          <input
            placeholder="YouTube URL"
            value={settings.youtube_url || ''}
            onChange={(e) => updateField('youtube_url', e.target.value)}
          />

          <button className="button" onClick={saveSettings} disabled={saving}>
            {saving ? 'Saving...' : 'Save Site Settings'}
          </button>
        </div>
      </div>
    </main>
  );
}
