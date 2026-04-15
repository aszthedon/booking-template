'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type HomepageSection = {
  id: string;
  section_key: string;
  title: string | null;
  body: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_href: string | null;
  sort_order: number;
  is_active: boolean;
};

export default function AdminHomepagePage() {
  const supabase = createClient();
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadSections();
  }, []);

  async function loadSections() {
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error) setSections(data || []);
  }

  function updateSection(
    id: string,
    field: keyof HomepageSection,
    value: string | number | boolean
  ) {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  }

  async function saveSection(section: HomepageSection) {
    setSavingId(section.id);

    const { error } = await supabase
      .from('homepage_sections')
      .update({
        title: section.title,
        body: section.body,
        image_url: section.image_url,
        cta_label: section.cta_label,
        cta_href: section.cta_href,
        sort_order: section.sort_order,
        is_active: section.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', section.id);

    setSavingId(null);

    if (error) {
      alert(error.message);
      return;
    }

    alert(`Saved ${section.section_key}`);
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Homepage Sections</h1>

      <div className="page-stack" style={{ marginTop: 24 }}>
        {sections.map((section) => (
          <div key={section.id} className="card card-body">
            <h2>{section.section_key}</h2>

            <div className="form-stack">
              <input
                value={section.title || ''}
                onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                placeholder="Title"
              />
              <textarea
                value={section.body || ''}
                onChange={(e) => updateSection(section.id, 'body', e.target.value)}
                placeholder="Body"
              />
              <input
                value={section.image_url || ''}
                onChange={(e) => updateSection(section.id, 'image_url', e.target.value)}
                placeholder="Image URL"
              />
              <input
                value={section.cta_label || ''}
                onChange={(e) => updateSection(section.id, 'cta_label', e.target.value)}
                placeholder="CTA Label"
              />
              <input
                value={section.cta_href || ''}
                onChange={(e) => updateSection(section.id, 'cta_href', e.target.value)}
                placeholder="CTA Href"
              />
              <input
                type="number"
                value={section.sort_order}
                onChange={(e) => updateSection(section.id, 'sort_order', Number(e.target.value))}
                placeholder="Sort Order"
              />

              <label>
                <input
                  type="checkbox"
                  checked={section.is_active}
                  onChange={(e) => updateSection(section.id, 'is_active', e.target.checked)}
                />{' '}
                Active
              </label>

              <button
                className="button"
                onClick={() => saveSection(section)}
                disabled={savingId === section.id}
              >
                {savingId === section.id ? 'Saving...' : 'Save Section'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
