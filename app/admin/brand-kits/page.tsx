'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type BrandKit = {
  id: string;
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
  const [kits, setKits] = useState<BrandKit[]>([]);
  const [themeId, setThemeId] = useState<string | null>(null);
  const [siteSettingsId, setSiteSettingsId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [{ data: kitData }, { data: themeData }, { data: settingsData }] =
      await Promise.all([
        supabase.from('brand_kits').select('*').order('created_at', { ascending: false }),
        supabase.from('theme_settings').select('id').limit(1).single(),
        supabase.from('site_settings').select('id').limit(1).single(),
      ]);

    setKits(kitData || []);
    setThemeId(themeData?.id || null);
    setSiteSettingsId(settingsData?.id || null);
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

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Brand Kits</h1>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        {kits.map((kit) => (
          <div key={kit.id} className="card card-body">
            <h2>{kit.name}</h2>
            <div className="list-stack" style={{ marginTop: 12 }}>
              <div className="list-row">
                <strong>Business</strong>
                <span>{kit.business_name || '—'}</span>
              </div>
              <div className="list-row">
                <strong>Primary Color</strong>
                <span>{kit.primary_color || '—'}</span>
              </div>
              <div className="list-row">
                <strong>Heading Font</strong>
                <span>{kit.font_heading || '—'}</span>
              </div>
            </div>

            <button className="button" style={{ marginTop: 16 }} onClick={() => applyKit(kit)}>
              Apply Brand Kit
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
