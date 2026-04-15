'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Asset = {
  id: string;
  title: string | null;
  public_url: string;
  file_path: string;
};

export default function AdminMediaPage() {
  const supabase = createClient();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAssets();
  }, []);

  async function loadAssets() {
    const { data } = await supabase
      .from('media_assets')
      .select('id, title, public_url, file_path')
      .order('created_at', { ascending: false });

    setAssets(data || []);
  }

  async function uploadAsset() {
    if (!file) {
      alert('Choose a file first.');
      return;
    }

    setUploading(true);

    const cleanName = file.name.replace(/\s+/g, '-').toLowerCase();
    const filePath = `${Date.now()}-${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from('site-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      setUploading(false);
      alert(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('site-assets')
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase
      .from('media_assets')
      .insert({
        title: title || file.name,
        file_path: filePath,
        public_url: publicUrlData.publicUrl,
        asset_type: 'image',
      });

    setUploading(false);

    if (insertError) {
      alert(insertError.message);
      return;
    }

    setTitle('');
    setFile(null);
    loadAssets();
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Media Library</h1>

      <div className="card card-body" style={{ marginTop: 24 }}>
        <div className="form-stack">
          <input
            placeholder="Asset title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button className="button" onClick={uploadAsset} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        {assets.map((asset) => (
          <div key={asset.id} className="card card-body">
            <img
              src={asset.public_url}
              alt={asset.title || 'Asset'}
              style={{
                width: '100%',
                height: 220,
                objectFit: 'cover',
                borderRadius: 12,
                marginBottom: 12,
              }}
            />
            <strong>{asset.title || 'Untitled Asset'}</strong>
            <span className="muted">{asset.public_url}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
