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

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function BookingPage() {
  const supabase = createClient();

  const [services, setServices] = useState<Service[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);

  const [selectedService, setSelectedService] = useState('');
  const [selectedServiceName, setSelectedServiceName] = useState('');
  const [selectedVariation, setSelectedVariation] = useState('');
  const [selectedVariationName, setSelectedVariationName] = useState('');
  const [selectedDepositAmount, setSelectedDepositAmount] = useState(0);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    const { data, error } = await supabase
      .from('services')
      .select('id, name')
      .eq('is_active', true);

    if (error) {
      console.error('Failed to load services:', error);
      return;
    }

    setServices(data || []);
  }

  async function loadVariations(serviceId: string) {
    const { data, error } = await supabase
      .from('service_variations')
      .select('id, service_id, name, price, deposit_type, deposit_value')
      .eq('service_id', serviceId)
      .eq('is_active', true);

    if (error) {
      console.error('Failed to load variations:', error);
      return;
    }

    setVariations(data || []);
  }

  async function handleBookingAndPayment() {
    if (isSubmitting) return;

    if (!selectedService || !selectedVariation || !date || !time || !name || !email) {
      alert('Please complete all booking fields.');
      return;
    }

    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          service_id: selectedService,
          variation_id: selectedVariation,
          client_name: name,
          client_email: email,
          appointment_date: date,
          appointment_time: time,
          status: 'pending',
          payment_status: 'unpaid',
          amount_due: selectedDepositAmount
        })
        .select()
        .single();

      if (bookingError || !booking) {
        console.error('Booking insert error:', bookingError);
        alert(bookingError?.message || 'Failed to create booking.');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          serviceName: selectedServiceName,
          variationName: selectedVariationName,
          customerEmail: email,
          depositAmount: selectedDepositAmount
        })
      });

      const result = await response.json();

      if (!response.ok || !result.url) {
        console.error('Checkout session error:', result);
        alert(result.error || 'Failed to start payment.');
        setIsSubmitting(false);
        return;
      }

      window.location.href = result.url;
    } catch (error) {
      console.error('Unexpected booking/payment error:', error);
      alert('Something went wrong.');
      setIsSubmitting(false);
    }
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
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
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
          <option key={v.id} value={v.id}>
            {v.name} — ${v.price}
          </option>
        ))}
      </select>

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="Time (ex: 2:00 PM)" />
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your Email" />

      <p style={{ marginTop: 12 }}>
        Deposit due today: <strong>${selectedDepositAmount || 0}</strong>
      </p>

      <button onClick={handleBookingAndPayment} className="button" disabled={isSubmitting}>
        {isSubmitting ? 'Redirecting to payment...' : 'Book and Pay Deposit'}
      </button>
    </main>
  );
}