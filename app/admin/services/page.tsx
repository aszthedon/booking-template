'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

export default function AdminServicesPage() {
  const supabase = createClient();

  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState('General');
  const [shortDescription, setShortDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [variationName, setVariationName] = useState('');
  const [variationDescription, setVariationDescription] = useState('');
  const [price, setPrice] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [depositType, setDepositType] = useState<'flat' | 'percent'>('flat');
  const [depositValue, setDepositValue] = useState('0');

  const [message, setMessage] = useState('');

  async function handleCreateService() {
    setMessage('');

    const slug = slugify(serviceName);

    const { data: service, error: serviceError } = await supabase
      .from('services')
      .insert({
        name: serviceName,
        slug,
        category,
        short_description: shortDescription,
        image_url: imageUrl || null
      })
      .select()
      .single();

    if (serviceError || !service) {
      setMessage(serviceError?.message || 'Failed to create service.');
      return;
    }

    const { error: variationError } = await supabase
      .from('service_variations')
      .insert({
        service_id: service.id,
        name: variationName,
        description: variationDescription,
        price: Number(price),
        duration_minutes: Number(durationMinutes),
        deposit_type: depositType,
        deposit_value: Number(depositValue)
      });

    if (variationError) {
      setMessage(variationError.message);
      return;
    }

    setMessage('Service and variation created successfully.');

    setServiceName('');
    setCategory('General');
    setShortDescription('');
    setImageUrl('');
    setVariationName('');
    setVariationDescription('');
    setPrice('');
    setDurationMinutes('60');
    setDepositType('flat');
    setDepositValue('0');
  }

  return (
    <main className="section shell">
      <p className="eyebrow">Admin</p>
      <h1>Services Manager</h1>
      <p className="muted">
        This version creates real services and service variations in Supabase.
      </p>

      <div className="card card-body" style={{ marginTop: 24 }}>
        <div className="form-grid">
          <div>
            <label>Service Name</label>
            <input
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="Signature Braids"
            />
          </div>

          <div>
            <label>Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Braids"
            />
          </div>

          <div className="full">
            <label>Short Description</label>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Protective braided styles with premium finish options."
            />
          </div>

          <div className="full">
            <label>Image URL</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <label>Variation Name</label>
            <input
              value={variationName}
              onChange={(e) => setVariationName(e.target.value)}
              placeholder="Mid-Back Length"
            />
          </div>

          <div>
            <label>Variation Price</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="210"
            />
          </div>

          <div>
            <label>Duration Minutes</label>
            <input
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="240"
            />
          </div>

          <div>
            <label>Deposit Type</label>
            <select
              value={depositType}
              onChange={(e) => setDepositType(e.target.value as 'flat' | 'percent')}
            >
              <option value="flat">Flat</option>
              <option value="percent">Percent</option>
            </select>
          </div>

          <div>
            <label>Deposit Value</label>
            <input
              value={depositValue}
              onChange={(e) => setDepositValue(e.target.value)}
              placeholder="50"
            />
          </div>

          <div className="full">
            <label>Variation Description</label>
            <textarea
              value={variationDescription}
              onChange={(e) => setVariationDescription(e.target.value)}
              placeholder="Longer braids for a fuller and more dramatic finish."
            />
          </div>

          <div className="full">
            <button type="button" className="button" onClick={handleCreateService}>
              Save Service + Variation
            </button>
          </div>
        </div>

        {message ? <p style={{ marginTop: 16 }}>{message}</p> : null}
      </div>
    </main>
  );
}