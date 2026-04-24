'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type ThemeSettings = {
  id: string;
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

export default function AdminThemePage() {
  const supabase = createClient();
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  async function loadTheme() {
    const { data, error } = await supabase
      .from('theme_settings')
      .select('*')
      .limit(1)
      .single();

    if (!error) setTheme(data);
  }

  function updateField(field: keyof ThemeSettings, value: string) {
    if (!theme) return;
    setTheme({ ...theme, [field]: value });
  }

  async function saveTheme() {
    if (!theme) return;
    setSaving(true);

    const { error } = await supabase
      .from('theme_settings')
      .update({
        primary_color: theme.primary_color,
        background_color: theme.background_color,
        panel_color: theme.panel_color,
        text_color: theme.text_color,
        muted_color: theme.muted_color,
        accent_soft: theme.accent_soft,
        border_color: theme.border_color,
        shadow: theme.shadow,
        font_body: theme.font_body,
        font_heading: theme.font_heading,
        border_radius: theme.border_radius,
        button_radius: theme.button_radius,
        updated_at: new Date().toISOString(),
      })
      .eq('id', theme.id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert('Theme updated');
  }

  if (!theme) {
    return (
      <main className="section shell">
        <h1>Theme Settings</h1>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Theme Settings</h1>

      <div className="card card-body" style={{ marginTop: 24 }}>
        <div className="form-stack">
          <input value={theme.primary_color || ''} onChange={(e) => updateField('primary_color', e.target.value)} placeholder="Primary Color" />
          <input value={theme.background_color || ''} onChange={(e) => updateField('background_color', e.target.value)} placeholder="Background Color" />
          <input value={theme.panel_color || ''} onChange={(e) => updateField('panel_color', e.target.value)} placeholder="Panel Color" />
          <input value={theme.text_color || ''} onChange={(e) => updateField('text_color', e.target.value)} placeholder="Text Color" />
          <input value={theme.muted_color || ''} onChange={(e) => updateField('muted_color', e.target.value)} placeholder="Muted Color" />
          <input value={theme.accent_soft || ''} onChange={(e) => updateField('accent_soft', e.target.value)} placeholder="Soft Accent" />
          <input value={theme.border_color || ''} onChange={(e) => updateField('border_color', e.target.value)} placeholder="Border Color" />
          <input value={theme.shadow || ''} onChange={(e) => updateField('shadow', e.target.value)} placeholder="Shadow CSS" />
          <input value={theme.font_body || ''} onChange={(e) => updateField('font_body', e.target.value)} placeholder="Body Font" />
          <input value={theme.font_heading || ''} onChange={(e) => updateField('font_heading', e.target.value)} placeholder="Heading Font" />
          <input value={theme.border_radius || ''} onChange={(e) => updateField('border_radius', e.target.value)} placeholder="Card Radius" />
          <input value={theme.button_radius || ''} onChange={(e) => updateField('button_radius', e.target.value)} placeholder="Button Radius" />

          <button className="button" onClick={saveTheme} disabled={saving}>
            {saving ? 'Saving...' : 'Save Theme'}
          </button>
        </div>
      </div>
    </main>
  );
}
