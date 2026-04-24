'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Service = {
  id: string;
  name: string;
};

type Variation = {
  id: string;
  service_id: string;
  name: string;
  price: number;
  duration_minutes: number;
  buffer_minutes: number;
  deposit_type: 'flat' | 'percent';
  deposit_value: number;
};

type Staff = {
  id: string;
  name: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function BookingPage() {
  const supabase = createClient();

  const [tenantId, setTenantId] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const [selectedService, setSelectedService] = useState('');
  const [selectedServiceName, setSelectedServiceName] = useState('');
  const [selectedVariation, setSelectedVariation] = useState('');
  const [selectedVariationName, setSelectedVariationName] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [selectedBuffer, setSelectedBuffer] = useState(0);
  const [selectedDepositAmount, setSelectedDepositAmount] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedProviderName, setSelectedProviderName] = useState('');

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    loadBootstrap();
  }, []);

  async function loadBootstrap() {
    const response = await fetch('/api/booking-bootstrap');
    const result = await response.json();

    if (!response.ok) {
      alert(result.error || 'Failed to load booking data.');
      return;
    }

    setTenantId(result.tenantId || '');
    setServices(result.services || []);
    setAllStaff(result.staff || []);
  }

  async function loadVariations(serviceId: string) {
    const response = await fetch(`/api/service-variations?serviceId=${serviceId}`);
    const result = await response.json();

    if (!response.ok) {
      alert(result.error || 'Failed to load service variations.');
      return;
    }

    setVariations(result.variations || []);
  }

  async function loadStaffForService(serviceId: string) {
    const { data } = await supabase
      .from('staff_services')
      .select(`
        staff_id,
        staff (
          id,
          name
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('service_id', serviceId);

    const mapped =
      (data || [])
        .map((row: any) => (Array.isArray(row.staff) ? row.staff[0] : row.staff))
        .filter(Boolean) || [];

    setFilteredStaff(mapped);
  }

  async function loadProviderDuration(providerId: string, serviceId: string, variationId: string) {
    const response = await fetch(
      `/api/provider-service-config?providerId=${providerId}&serviceId=${serviceId}&variationId=${variationId}`
    );
    const result = await response.json();

    if (response.ok) {
      setSelectedDuration(result.duration_minutes || 0);
      setSelectedBuffer(result.buffer_minutes || 0);
    }
  }

  async function loadAvailability(selectedDate: string, providerId: string, variationId: string) {
    if (!selectedDate || !providerId || !variationId) return;

    setLoadingSlots(true);
    setTime('');

    const response = await fetch(
      `/api/availability?date=${selectedDate}&providerId=${providerId}&variationId=${variationId}`
    );
    const result = await response.json();

    if (!response.ok) {
      alert(result.error || 'Failed to load availability.');
      setAvailableSlots([]);
      setLoadingSlots(false);
      return;
    }

    setAvailableSlots(result.availableSlots || []);
    setSelectedDuration(result.duration_minutes || 0);
    setSelectedBuffer(result.buffer_minutes || 0);
    setLoadingSlots(false);
  }

  async function uploadPhotos(bookingId: string, clientEmail: string) {
    if (files.length === 0 || !tenantId) return;

    for (const file of files) {
      const cleanName = file.name.replace(/\s+/g, '-').toLowerCase();
      const filePath = `${bookingId}/${Date.now()}-${cleanName}`;

      const { error: uploadError } = await supabase.storage
        .from('inspiration-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) continue;

      const { data: publicUrlData } = supabase.storage
        .from('inspiration-photos')
        .getPublicUrl(filePath);

      await supabase.from('booking_photos').insert({
        tenant_id: tenantId,
        booking_id: bookingId,
        client_email: clientEmail,
        file_path: filePath,
        public_url: publicUrlData.publicUrl,
      });
    }
  }

  async function handleBookingAndPayment() {
    if (isSubmitting) return;

    if (!selectedService || !selectedVariation || !selectedProvider || !date || !time || !name || !email) {
      alert('Please complete all booking fields.');
      return;
    }

    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    const bookingResponse = await fetch('/api/create-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: selectedService,
        variation_id: selectedVariation,
        staff_id: selectedProvider,
        client_name: name,
        client_email: email,
        appointment_date: date,
        appointment_time: time,
        amount_due: selectedDepositAmount,
      }),
    });

    const bookingResult = await bookingResponse.json();

    if (!bookingResponse.ok || !bookingResult.booking) {
      alert(bookingResult.error || 'Failed to create booking.');
      setIsSubmitting(false);
      await loadAvailability(date, selectedProvider, selectedVariation);
      return;
    }

    const booking = bookingResult.booking;

    await uploadPhotos(booking.id, email);

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: booking.id,
        serviceName: selectedServiceName,
        variationName: selectedVariationName,
        customerEmail: email,
        depositAmount: selectedDepositAmount,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.url) {
      alert(result.error || 'Failed to start payment.');
      setIsSubmitting(false);
      return;
    }

    window.location.href = result.url;
  }

  return (
    <main className="section shell">
      <h1>Book Appointment</h1>

      <div className="dashboard-grid mobile-one-col" style={{ marginTop: 24 }}>
        <div className="card card-body">
          <div className="form-stack">
            <select
              value={selectedService}
              onChange={(e) => {
                const serviceId = e.target.value;
                const service = services.find((s) => s.id === serviceId);

                setSelectedService(serviceId);
                setSelectedServiceName(service?.name || '');
                setSelectedVariation('');
                setSelectedVariationName('');
                setSelectedDuration(0);
                setSelectedBuffer(0);
                setSelectedDepositAmount(0);
                setSelectedProvider('');
                setSelectedProviderName('');
                setFilteredStaff([]);
                setTime('');
                setAvailableSlots([]);
                loadVariations(serviceId);
                loadStaffForService(serviceId);
              }}
            >
              <option value="">Select Service</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              value={selectedVariation}
              onChange={(e) => {
                const variationId = e.target.value;
                const variation = variations.find((v) => v.id === variationId);

                setSelectedVariation(variationId);
                setSelectedVariationName(variation?.name || '');
                setSelectedDuration(Number(variation?.duration_minutes || 0));
                setSelectedBuffer(Number(variation?.buffer_minutes || 0));
                setSelectedDepositAmount(Number(variation?.deposit_value || 0));
                setTime('');
                setAvailableSlots([]);

                if (selectedProvider && selectedService && variationId) {
                  loadProviderDuration(selectedProvider, selectedService, variationId);
                }

                if (date && selectedProvider && variationId) {
                  loadAvailability(date, selectedProvider, variationId);
                }
              }}
            >
              <option value="">Select Variation</option>
              {variations.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} — ${v.price}
                </option>
              ))}
            </select>

            <select
              value={selectedProvider}
              onChange={(e) => {
                const providerId = e.target.value;
                const provider = filteredStaff.find((s) => s.id === providerId);

                setSelectedProvider(providerId);
                setSelectedProviderName(provider?.name || '');
                setTime('');
                setAvailableSlots([]);

                if (providerId && selectedService && selectedVariation) {
                  loadProviderDuration(providerId, selectedService, selectedVariation);
                }

                if (date && selectedVariation && providerId) {
                  loadAvailability(date, providerId, selectedVariation);
                }
              }}
              disabled={!selectedService}
            >
              <option value="">Select Provider</option>
              {(filteredStaff.length > 0 ? filteredStaff : allStaff).map((member) => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>

            <input
              type="date"
              value={date}
              onChange={(e) => {
                const selectedDate = e.target.value;
                setDate(selectedDate);
                setTime('');
                setAvailableSlots([]);

                if (selectedDate && selectedProvider && selectedVariation) {
                  loadAvailability(selectedDate, selectedProvider, selectedVariation);
                }
              }}
            />

            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={!date || !selectedProvider || !selectedVariation || loadingSlots}
            >
              <option value="">
                {loadingSlots ? 'Loading available times...' : 'Select Available Time'}
              </option>
              {availableSlots.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>

            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your Email" />

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />

            <button onClick={handleBookingAndPayment} className="button" disabled={isSubmitting}>
              {isSubmitting ? 'Preparing checkout...' : 'Book and Pay Deposit'}
            </button>
          </div>
        </div>

        <div className="card card-body">
          <h2>Appointment Summary</h2>
          <div className="list-stack">
            <div className="list-row">
              <strong>Service</strong>
              <span>{selectedServiceName || 'Not selected'}</span>
            </div>
            <div className="list-row">
              <strong>Variation</strong>
              <span>{selectedVariationName || 'Not selected'}</span>
            </div>
            <div className="list-row">
              <strong>Provider</strong>
              <span>{selectedProviderName || 'Not selected'}</span>
            </div>
            <div className="list-row">
              <strong>Date & Time</strong>
              <span>{date || 'No date'} {time ? `at ${time}` : ''}</span>
            </div>
            <div className="list-row">
              <strong>Duration</strong>
              <span>{selectedDuration || 0} min</span>
            </div>
            <div className="list-row">
              <strong>Buffer</strong>
              <span>{selectedBuffer || 0} min</span>
            </div>
            <div className="list-row">
              <strong>Deposit Due Today</strong>
              <span>${selectedDepositAmount || 0}</span>
            </div>
            <div className="list-row">
              <strong>Uploaded Photos</strong>
              <span>{files.length} file(s)</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
