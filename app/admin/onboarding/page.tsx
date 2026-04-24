'use client';

import { useState } from 'react';

export default function AdminOnboardingPage() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [ownerUserId, setOwnerUserId] = useState('');
  const [creating, setCreating] = useState(false);

  async function createTenant() {
    if (!name || !slug || !ownerUserId) {
      alert('Complete all fields.');
      return;
    }

    setCreating(true);

    const response = await fetch('/api/admin/tenants/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug, ownerUserId }),
    });

    const result = await response.json();
    setCreating(false);

    if (!response.ok) {
      alert(result.error || 'Failed to create tenant.');
      return;
    }

    alert(`Created tenant: ${result.tenant.name}`);
    setName('');
    setSlug('');
    setOwnerUserId('');
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Brand Onboarding Wizard</h1>

      <div className="card card-body" style={{ marginTop: 24 }}>
        <div className="form-stack">
          <input
            placeholder="Brand Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Brand Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <input
            placeholder="Owner User ID"
            value={ownerUserId}
            onChange={(e) => setOwnerUserId(e.target.value)}
          />

          <button className="button" onClick={createTenant} disabled={creating}>
            {creating ? 'Creating...' : 'Create Brand'}
          </button>
        </div>
      </div>
    </main>
  );
}
