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

  const [services, setServices] = useState<Service[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const [selectedService, setSelectedService] = useState('');
  const [selectedServiceName, setSelectedServiceName] = useState('');
  const [selectedVariation, setSelectedVariation] = useState('');
  const [selectedVariationName, setSelectedVariationName] = useState('');
  const [selectedDepositAmount, setSelectedDepositAmount] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState('');

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    loadServices();
    loadStaff();
  }, []);

  async function loadServices() {
    const { data } = await supabase
      .from('services')
      .select('id, name')
      .eq('is_active', true);

    setServices(data || []);
  }

  async function loadVariations(serviceId: string) {
    const { data } = await supabase
      .from('service_variations')
      .select('id, service_id, name, price, deposit_type, deposit_value')
      .eq('service_id', serviceId)
      .eq('is_active', true);

    setVariations(data || []);
  }

  async function loadStaff() {
    const { data } = await supabase
      .from('staff')
      .select('id, name')
      .eq('is_active', true);

    setStaff(data || []);
  }

  async function loadAvailability(selectedDate: string, providerId: string) {
    setLoadingSlots(true);
    setTime('');

    const response = await fetch(
      `/api/availability?date=${selectedDate}&providerId=${providerId}`
    );
    const result = await response.json();

    if (!response.ok) {
      setAvailableSlots([]);
      setLoadingSlots(false);
      return;
    }

    setAvailableSlots(result.availableSlots || []);
    setLoadingSlots(false);
  }

  async function uploadPhotos(bookingId: string, clientEmail: string) {
    if (files.length === 0) return;

    for (const file of files) {
      const cleanName = file.name.replace(/\s+/g, '-').toLowerCase();
      const filePath = `${bookingId}/${Date.now()}-${cleanName}`;

      await supabase.storage
        .from('inspiration-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      const { data: publicUrlData } = supabase.storage
        .from('inspiration-photos')
        .getPublicUrl(filePath);

      await supabase.from('booking_photos').insert({
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

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        service_id: selectedService,
        variation_id: selectedVariation,
        staff_id: selectedProvider,
        client_name: name,
        client_email: email,
        appointment_date: date,
        appointment_time: time,
        status: 'pending',
        payment_status: 'unpaid',
        amount_due: selectedDepositAmount,
      })
      .select()
      .single();

    if (bookingError || !booking) {
      alert(bookingError?.message || 'Failed to create booking.');
      setIsSubmitting(false);
      return;
    }

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

      <select
        value={selectedService}
        onChange={(e) => {
          const serviceId = e.target.value;
          const service = services.find((s) => s.id === serviceId);

          setSelectedService(serviceId);
          setSelectedServiceName(service?.name || '');
          setSelectedVariation('');
          setSelectedVariationName('');
          setSelectedDepositAmount(0);
          loadVariations(serviceId);
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
          setSelectedDepositAmount(Number(variation?.deposit_value || 0));
        }}
      >
        <option value="">Select Variation</option>
        {variations.map((v) => (
          <option key={v.id} value={v.id}>{v.name} — ${v.price}</option>
        ))}
      </select>

      <select
        value={selectedProvider}
        onChange={(e) => {
          const providerId = e.target.value;
          setSelectedProvider(providerId);

          if (date && providerId) {
            loadAvailability(date, providerId);
          }
        }}
      >
        <option value="">Select Provider</option>
        {staff.map((member) => (
          <option key={member.id} value={member.id}>{member.name}</option>
        ))}
      </select>

      <input
        type="date"
        value={date}
        onChange={(e) => {
          const selectedDate = e.target.value;
          setDate(selectedDate);
          if (selectedDate && selectedProvider) {
            loadAvailability(selectedDate, selectedProvider);
          }
        }}
      />

      <select
        value={time}
        onChange={(e) => setTime(e.target.value)}
        disabled={!date || !selectedProvider || loadingSlots}
      >
        <option value="">
          {loadingSlots ? 'Loading times...' : 'Select Available Time'}
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

      <p style={{ marginTop: 12 }}>
        Deposit due today: <strong>${selectedDepositAmount || 0}</strong>
      </p>

      <button onClick={handleBookingAndPayment} className="button" disabled={isSubmitting}>
        {isSubmitting ? 'Redirecting to payment...' : 'Book and Pay Deposit'}
      </button>
    </main>
  );
}
