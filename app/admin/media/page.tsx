'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Tenant = {
  id: string;
  name: string;
};

type Asset = {
  id: string;
  tenant_id: string | null;
  title: string | null;
  public_url: string;
  file_path: string;
};

export default function AdminMediaPage() {
  const supabase = createClient();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAssets();
  }, []);

  async function loadAssets() {
    const tenantRes = await fetch('/api/admin/current-tenant');
    const tenantJson = await tenantRes.json();

    if (!tenantRes.ok) {
      alert(tenantJson.error || 'Failed to load tenant.');
      return;
    }

    setTenant(tenantJson.tenant);

    const { data } = await supabase
      .from('media_assets')
      .select('id, tenant_id, title, public_url, file_path')
      .eq('tenant_id', tenantJson.tenant.id)
      .order('created_at', { ascending: false });

    setAssets(data || []);
  }

  async function uploadAsset() {
    if (!tenant) return;
    if (!file) {
      alert('Choose a file first.');
      return;
    }

    setUploading(true);

    const cleanName = file.name.replace(/\s+/g, '-').toLowerCase();
    const filePath = `${tenant.id}/${Date.now()}-${cleanName}`;

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
        tenant_id: tenant.id,
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

  async function deleteAsset(id: string) {
    const { error } = await supabase
      .from('media_assets')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    loadAssets();
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>{tenant?.name || 'Brand'} Media Library</h1>

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

            <div className="actions-row" style={{ marginTop: 12 }}>
              <button className="button secondary" onClick={() => deleteAsset(asset.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
