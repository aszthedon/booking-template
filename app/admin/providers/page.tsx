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

  useEffect(() => {
    loadProviders();
    loadBlockedDates();
  }, []);

  async function loadProviders() {
    const { data, error } = await supabase
      .from('staff')
      .select('id, name, email, is_active')
      .order('created_at', { ascending: false });

    if (!error) setProviders(data || []);
  }

  async function loadBlockedDates() {
    const { data, error } = await supabase
      .from('provider_blocked_dates')
      .select('id, staff_id, blocked_date, reason')
      .order('blocked_date', { ascending: true });

    if (!error) setBlockedDates(data || []);
  }

  async function addProvider() {
    if (!name) {
      alert('Provider name is required.');
      return;
    }

    const { error } = await supabase.from('staff').insert({
      name,
      email: email || null,
      is_active: true,
    });

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
      alert('Select provider and blocked date.');
      return;
    }

    const { error } = await supabase.from('provider_blocked_dates').insert({
      staff_id: selectedProvider,
      blocked_date: blockedDate,
      reason: reason || null,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setSelectedProvider('');
    setBlockedDate('');
    setReason('');
    loadBlockedDates();
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Provider Management</h1>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card card-body">
          <h2>Add Provider</h2>
          <div className="form-stack">
            <input
              placeholder="Provider name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              placeholder="Provider email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="button" onClick={addProvider}>
              Save Provider
            </button>
          </div>
        </div>

        <div className="card card-body">
          <h2>Add Blocked Date</h2>
          <div className="form-stack">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
            >
              <option value="">Select provider</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={blockedDate}
              onChange={(e) => setBlockedDate(e.target.value)}
            />

            <input
              placeholder="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <button className="button" onClick={addBlockedDate}>
              Save Blocked Date
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
                  <span>{provider.email || 'No email'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card card-body">
          <h2>Blocked Dates</h2>
          {blockedDates.length === 0 ? (
            <p>No blocked dates yet.</p>
          ) : (
            <div className="list-stack">
              {blockedDates.map((item) => {
                const provider = providers.find((p) => p.id === item.staff_id);
                return (
                  <div key={item.id} className="list-row">
                    <strong>{provider?.name || 'Unknown Provider'}</strong>
                    <span>{item.blocked_date}</span>
                    <span>{item.reason || 'No reason'}</span>
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
