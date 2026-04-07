'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Staff = {
  id: string;
  name: string;
};

type ProviderHour = {
  id: string;
  staff_id: string;
  weekday: number;
  start_hour: number;
  end_hour: number;
  interval_minutes: number;
  is_active: boolean;
};

const weekdayLabels = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function ProviderHoursPage() {
  const supabase = createClient();

  const [providers, setProviders] = useState<Staff[]>([]);
  const [hours, setHours] = useState<ProviderHour[]>([]);

  const [selectedProvider, setSelectedProvider] = useState('');
  const [weekday, setWeekday] = useState('1');
  const [startHour, setStartHour] = useState('9');
  const [endHour, setEndHour] = useState('17');
  const [intervalMinutes, setIntervalMinutes] = useState('30');

  useEffect(() => {
    loadProviders();
    loadHours();
  }, []);

  async function loadProviders() {
    const { data, error } = await supabase
      .from('staff')
      .select('id, name')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (!error) setProviders(data || []);
  }

  async function loadHours() {
    const { data, error } = await supabase
      .from('provider_hours')
      .select('id, staff_id, weekday, start_hour, end_hour, interval_minutes, is_active')
      .eq('is_active', true)
      .order('weekday', { ascending: true });

    if (!error) setHours(data || []);
  }

  async function saveHours() {
    if (!selectedProvider) {
      alert('Please select a provider.');
      return;
    }

    const { error } = await supabase.from('provider_hours').insert({
      staff_id: selectedProvider,
      weekday: Number(weekday),
      start_hour: Number(startHour),
      end_hour: Number(endHour),
      interval_minutes: Number(intervalMinutes),
      is_active: true,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setWeekday('1');
    setStartHour('9');
    setEndHour('17');
    setIntervalMinutes('30');
    loadHours();
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Provider Working Hours</h1>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card card-body">
          <h2>Add Working Hours</h2>
          <div className="form-stack">
            <div>
              <label>Provider</label>
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
            </div>

            <div>
              <label>Weekday</label>
              <select value={weekday} onChange={(e) => setWeekday(e.target.value)}>
                {weekdayLabels.map((label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Start Hour (24-hour)</label>
              <input
                type="number"
                min="0"
                max="23"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
              />
            </div>

            <div>
              <label>End Hour (24-hour)</label>
              <input
                type="number"
                min="1"
                max="24"
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
              />
            </div>

            <div>
              <label>Interval Minutes</label>
              <select
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(e.target.value)}
              >
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="60">60</option>
              </select>
            </div>

            <button className="button" onClick={saveHours}>
              Save Hours
            </button>
          </div>
        </div>

        <div className="card card-body">
          <h2>Saved Hours</h2>

          {hours.length === 0 ? (
            <p>No provider hours saved yet.</p>
          ) : (
            <div className="list-stack">
              {hours.map((item) => {
                const provider = providers.find((p) => p.id === item.staff_id);

                return (
                  <div key={item.id} className="list-row">
                    <strong>{provider?.name || 'Unknown Provider'}</strong>
                    <span>{weekdayLabels[item.weekday]}</span>
                    <span>
                      {item.start_hour}:00 - {item.end_hour}:00
                    </span>
                    <span>Every {item.interval_minutes} minutes</span>
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
