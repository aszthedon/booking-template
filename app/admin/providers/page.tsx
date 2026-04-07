'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Staff = {
  id: string;
  name: string;
  email: string | null;
  is_active: boolean;
};

type BlockedDate = {
  id: string;
  staff_id: string;
  blocked_date: string;
  reason: string | null;
};

export default function AdminProvidersPage() {
  const supabase = createClient();

  const [providers, setProviders] = useState<Staff[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [selectedProvider, setSelectedProvider] = useState('');
  const [blockedDate, setBlockedDate] = useState('');
  const [reason, setReason] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProviders();
    loadBlockedDates();
  }, []);

  async function loadProviders() {
    const { data, error } = await supabase
      .from('staff')
      .select('id, name, email, is_active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load providers:', error);
      return;
    }

    setProviders(data || []);
  }

  async function loadBlockedDates() {
    const { data, error } = await supabase
      .from('provider_blocked_dates')
      .select('id, staff_id, blocked_date, reason')
      .order('blocked_date', { ascending: true });

    if (error) {
      console.error('Failed to load blocked dates:', error);
      return;
    }

    setBlockedDates(data || []);
  }

  async function addProvider() {
    if (!name.trim()) {
      alert('Provider name is required.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('staff').insert({
      name: name.trim(),
      email: email.trim() || null,
      is_active: true,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setName('');
    setEmail('');
    loadProviders();
  }

  async function addBlockedDate() {
    if (!selectedProvider || !blockedDate) {
      alert('Please choose a provider and blocked date.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('provider_blocked_dates').insert({
      staff_id: selectedProvider,
      blocked_date: blockedDate,
      reason: reason.trim() || null,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setSelectedProvider('');
    setBlockedDate('');
    setReason('');
    loadBlockedDates();
  }

  async function toggleProvider(provider: Staff) {
    const { error } = await supabase
      .from('staff')
      .update({ is_active: !provider.is_active })
      .eq('id', provider.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadProviders();
  }

  async function deleteBlockedDate(id: string) {
    const confirmed = confirm('Delete this blocked date?');
    if (!confirmed) return;

    const { error } = await supabase
      .from('provider_blocked_dates')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    loadBlockedDates();
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Provider Management</h1>
      <p className="muted max-2xl">
        Add providers, manage active status, and block dates when they are unavailable.
      </p>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card card-body">
          <h2>Add Provider</h2>
          <div className="form-stack">
            <div>
              <label>Provider Name</label>
              <input
                placeholder="Enter provider name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label>Provider Email</label>
              <input
                placeholder="Enter provider email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button className="button" onClick={addProvider} disabled={loading}>
              {loading ? 'Saving...' : 'Save Provider'}
            </button>
          </div>
        </div>

        <div className="card card-body">
          <h2>Add Blocked Date</h2>
          <div className="form-stack">
            <div>
              <label>Provider</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                <option value="">Select provider</option>
                {providers
                  .filter((provider) => provider.is_active)
                  .map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label>Blocked Date</label>
              <input
                type="date"
                value={blockedDate}
                onChange={(e) => setBlockedDate(e.target.value)}
              />
            </div>

            <div>
              <label>Reason (optional)</label>
              <input
                placeholder="Vacation, appointment, off-site, etc."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <button className="button" onClick={addBlockedDate} disabled={loading}>
              {loading ? 'Saving...' : 'Save Blocked Date'}
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card card-body">
          <h2>Providers</h2>

          {providers.length === 0 ? (
            <p>No providers yet.</p>
          ) : (
            <div className="list-stack">
              {providers.map((provider) => (
                <div key={provider.id} className="list-row">
                  <strong>{provider.name}</strong>
                  <span>{provider.email || 'No email added'}</span>
                  <span>
                    Status:{' '}
                    <strong>{provider.is_active ? 'Active' : 'Inactive'}</strong>
                  </span>

                  <div style={{ marginTop: 8 }}>
                    <button
                      className="button secondary"
                      onClick={() => toggleProvider(provider)}
                    >
                      Mark as {provider.is_active ? 'Inactive' : 'Active'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card card-body">
          <h2>Blocked Dates</h2>

          {blockedDates.length === 0 ? (
            <p>No blocked dates saved yet.</p>
          ) : (
            <div className="list-stack">
              {blockedDates.map((item) => {
                const provider = providers.find((p) => p.id === item.staff_id);

                return (
                  <div key={item.id} className="list-row">
                    <strong>{provider?.name || 'Unknown Provider'}</strong>
                    <span>{item.blocked_date}</span>
                    <span>{item.reason || 'No reason provided'}</span>

                    <div style={{ marginTop: 8 }}>
                      <button
                        className="button secondary"
                        onClick={() => deleteBlockedDate(item.id)}
                      >
                        Delete Blocked Date
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
