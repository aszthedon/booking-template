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
  const [selectedDays, setSelectedDays] = useState<number[]>([1]);
  const [startHour, setStartHour] = useState('9');
  const [endHour, setEndHour] = useState('17');
  const [intervalMinutes, setIntervalMinutes] = useState('30');

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadProviders();
    loadHours();
  }, []);

  async function loadProviders() {
    const { data } = await supabase
      .from('staff')
      .select('id, name')
      .eq('is_active', true);

    setProviders(data || []);
  }

  async function loadHours() {
    const { data } = await supabase
      .from('provider_hours')
      .select('*')
      .eq('is_active', true)
      .order('weekday', { ascending: true });

    setHours(data || []);
  }

  function resetForm() {
    setSelectedProvider('');
    setSelectedDays([1]);
    setStartHour('9');
    setEndHour('17');
    setIntervalMinutes('30');
    setEditingId(null);
  }

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function saveHours() {
    if (!selectedProvider) {
      alert('Select a provider.');
      return;
    }

    if (selectedDays.length === 0) {
      alert('Select at least one weekday.');
      return;
    }

    if (Number(startHour) >= Number(endHour)) {
      alert('End hour must be after start hour.');
      return;
    }

    if (editingId) {
      const day = selectedDays[0];

      const { error } = await supabase
        .from('provider_hours')
        .update({
          staff_id: selectedProvider,
          weekday: day,
          start_hour: Number(startHour),
          end_hour: Number(endHour),
          interval_minutes: Number(intervalMinutes),
        })
        .eq('id', editingId);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const rows = selectedDays.map((day) => ({
        staff_id: selectedProvider,
        weekday: day,
        start_hour: Number(startHour),
        end_hour: Number(endHour),
        interval_minutes: Number(intervalMinutes),
        is_active: true,
      }));

      const { error } = await supabase.from('provider_hours').insert(rows);

      if (error) {
        alert(error.message);
        return;
      }
    }

    resetForm();
    loadHours();
  }

  function editHour(hour: ProviderHour) {
    setEditingId(hour.id);
    setSelectedProvider(hour.staff_id);
    setSelectedDays([hour.weekday]);
    setStartHour(String(hour.start_hour));
    setEndHour(String(hour.end_hour));
    setIntervalMinutes(String(hour.interval_minutes));
  }

  async function deleteHour(id: string) {
    const confirmed = confirm('Delete these working hours?');
    if (!confirmed) return;

    const { error } = await supabase
      .from('provider_hours')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    loadHours();
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Provider Working Hours</h1>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card card-body">
          <h2>{editingId ? 'Edit Hours' : 'Add Hours'}</h2>

          <div className="form-stack">
            <div>
              <label>Provider</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                <option value="">Select provider</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Weekdays</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {weekdayLabels.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    className={selectedDays.includes(index) ? 'button' : 'button secondary'}
                    onClick={() => toggleDay(index)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label>Start Hour</label>
              <input
                type="number"
                min="0"
                max="23"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
              />
            </div>

            <div>
              <label>End Hour</label>
              <input
                type="number"
                min="1"
                max="24"
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
              />
            </div>

            <div>
              <label>Interval</label>
              <select
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(e.target.value)}
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="60">60 min</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="button" onClick={saveHours}>
                {editingId ? 'Update Hours' : 'Save Hours'}
              </button>

              {editingId && (
                <button className="button secondary" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card card-body">
          <h2>Saved Hours</h2>

          {hours.length === 0 ? (
            <p>No hours set yet.</p>
          ) : (
            <div className="list-stack">
              {hours.map((h) => {
                const provider = providers.find((p) => p.id === h.staff_id);

                return (
                  <div key={h.id} className="list-row">
                    <strong>{provider?.name || 'Unknown'}</strong>
                    <span>{weekdayLabels[h.weekday]}</span>
                    <span>
                      {h.start_hour}:00 - {h.end_hour}:00
                    </span>
                    <span>Every {h.interval_minutes} minutes</span>

                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <button className="button secondary" onClick={() => editHour(h)}>
                        Edit
                      </button>

                      <button className="button secondary" onClick={() => deleteHour(h.id)}>
                        Delete
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