'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type ContentRow = {
  id: string;
  content_key: string;
  title: string | null;
  body: string | null;
  json_content: any;
};

export default function AdminContentPage() {
  const supabase = createClient();
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    const { data, error } = await supabase
      .from('site_content')
      .select('id, content_key, title, body, json_content')
      .order('content_key', { ascending: true });

    if (!error) setRows(data || []);
  }

  async function saveRow(row: ContentRow) {
    setLoading(true);

    const { error } = await supabase
      .from('site_content')
      .update({
        title: row.title,
        body: row.body,
        json_content: row.json_content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert(`${row.content_key} updated`);
  }

  function updateField(id: string, field: keyof ContentRow, value: any) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Content Manager</h1>
      <p className="muted max-2xl">
        Update public page content without editing code. JSON fields are used for structured content like FAQs and testimonials.
      </p>

      <div className="page-stack" style={{ marginTop: 24 }}>
        {rows.map((row) => (
          <div key={row.id} className="card card-body">
            <h2>{row.content_key}</h2>

            <div className="form-stack">
              <div>
                <label>Title</label>
                <input
                  value={row.title || ''}
                  onChange={(e) => updateField(row.id, 'title', e.target.value)}
                />
              </div>

              <div>
                <label>Body</label>
                <textarea
                  value={row.body || ''}
                  onChange={(e) => updateField(row.id, 'body', e.target.value)}
                />
              </div>

              <div>
                <label>JSON Content</label>
                <textarea
                  value={JSON.stringify(row.json_content ?? {}, null, 2)}
                  onChange={(e) => {
                    try {
                      updateField(row.id, 'json_content', JSON.parse(e.target.value));
                    } catch {
                      // keep typing without crashing
                    }
                  }}
                  style={{ minHeight: 260 }}
                />
              </div>

              <button className="button" onClick={() => saveRow(row)} disabled={loading}>
                {loading ? 'Saving...' : 'Save Content'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
