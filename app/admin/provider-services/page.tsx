'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Staff = { id: string; name: string };
type Service = { id: string; name: string };

type StaffService = {
  id: string;
  staff_id: string;
  service_id: string;
  duration_override_minutes: number | null;
  buffer_override_minutes: number | null;
};

export default function ProviderServicesPage() {
  const supabase = createClient();

  const [providers, setProviders] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [assignments, setAssignments] = useState<StaffService[]>([]);

  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [durationOverride, setDurationOverride] = useState('');
  const [bufferOverride, setBufferOverride] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [{ data: providerData }, { data: serviceData }, { data: assignmentData }] =
      await Promise.all([
        supabase.from('staff').select('id, name').eq('is_active', true),
        supabase.from('services').select('id, name').eq('is_active', true),
        supabase
          .from('staff_services')
          .select('id, staff_id, service_id, duration_override_minutes, buffer_override_minutes'),
      ]);

    setProviders(providerData || []);
    setServices(serviceData || []);
    setAssignments(assignmentData || []);
  }

  async function addAssignment() {
    if (!selectedProvider || !selectedService) {
      alert('Select provider and service.');
      return;
    }

    const { error } = await supabase.from('staff_services').insert({
      staff_id: selectedProvider,
      service_id: selectedService,
      duration_override_minutes: durationOverride ? Number(durationOverride) : null,
      buffer_override_minutes: bufferOverride ? Number(bufferOverride) : null,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setSelectedProvider('');
    setSelectedService('');
    setDurationOverride('');
    setBufferOverride('');
    loadAll();
  }

  async function deleteAssignment(id: string) {
    const { error } = await supabase
      .from('staff_services')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    loadAll();
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Provider Services</h1>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card card-body">
          <h2>Assign Service to Provider</h2>
          <div className="form-stack">
            <select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)}>
              <option value="">Select provider</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
              <option value="">Select service</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Duration override in minutes (optional)"
              value={durationOverride}
              onChange={(e) => setDurationOverride(e.target.value)}
            />

            <input
              type="number"
              placeholder="Buffer override in minutes (optional)"
              value={bufferOverride}
              onChange={(e) => setBufferOverride(e.target.value)}
            />

            <button className="button" onClick={addAssignment}>
              Save Assignment
            </button>
          </div>
        </div>

        <div className="card card-body">
          <h2>Current Assignments</h2>
          <div className="list-stack">
            {assignments.map((a) => {
              const provider = providers.find((p) => p.id === a.staff_id);
              const service = services.find((s) => s.id === a.service_id);

              return (
                <div key={a.id} className="list-row">
                  <strong>{provider?.name || 'Unknown Provider'}</strong>
                  <span>{service?.name || 'Unknown Service'}</span>
                  <span>
                    Duration override: {a.duration_override_minutes ?? 'Default'}
                  </span>
                  <span>
                    Buffer override: {a.buffer_override_minutes ?? 'Default'}
                  </span>
                  <button className="button secondary" onClick={() => deleteAssignment(a.id)}>
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
