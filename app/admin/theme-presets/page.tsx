'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type ThemePreset = {
  id: string;
  name: string;
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

type ThemeSettings = {
  id: string;
};

export default function AdminThemePresetsPage() {
  const supabase = createClient();
  const [presets, setPresets] = useState<ThemePreset[]>([]);
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [{ data: presetData }, { data: themeData }] = await Promise.all([
      supabase.from('theme_presets').select('*').order('created_at', { ascending: true }),
      supabase.from('theme_settings').select('id').limit(1).single(),
    ]);

    setPresets(presetData || []);
    setTheme(themeData || null);
  }

  async function applyPreset(preset: ThemePreset) {
    if (!theme) return;
    setLoading(true);

    const { error } = await supabase
      .from('theme_settings')
      .update({
        primary_color: preset.primary_color,
        background_color: preset.background_color,
        panel_color: preset.panel_color,
        text_color: preset.text_color,
        muted_color: preset.muted_color,
        accent_soft: preset.accent_soft,
        border_color: preset.border_color,
        shadow: preset.shadow,
        font_body: preset.font_body,
        font_heading: preset.font_heading,
        border_radius: preset.border_radius,
        button_radius: preset.button_radius,
        updated_at: new Date().toISOString(),
      })
      .eq('id', theme.id);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert(`Applied preset: ${preset.name}`);
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Theme Presets</h1>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        {presets.map((preset) => (
          <div key={preset.id} className="card card-body">
            <h2>{preset.name}</h2>
            <div className="list-stack" style={{ marginTop: 12 }}>
              <div className="list-row">
                <strong>Primary</strong>
                <span>{preset.primary_color}</span>
              </div>
              <div className="list-row">
                <strong>Background</strong>
                <span>{preset.background_color}</span>
              </div>
              <div className="list-row">
                <strong>Body Font</strong>
                <span>{preset.font_body}</span>
              </div>
              <div className="list-row">
                <strong>Heading Font</strong>
                <span>{preset.font_heading}</span>
              </div>
            </div>

            <button
              className="button"
              style={{ marginTop: 16 }}
              onClick={() => applyPreset(preset)}
              disabled={loading}
            >
              {loading ? 'Applying...' : 'Apply Preset'}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
