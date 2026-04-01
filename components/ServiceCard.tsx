import Link from 'next/link';
import { Service } from '@/lib/types';

export function ServiceCard({ service }: { service: Service }) {
  const minPrice = Math.min(...service.variations.map((item) => item.price));
  const maxPrice = Math.max(...service.variations.map((item) => item.price));

  return (
    <article className="card service-card">
      <img src={service.image} alt={service.name} className="card-image" />
      <div className="card-body">
        <p className="eyebrow">{service.category}</p>
        <h3>{service.name}</h3>
        <p className="muted">{service.shortDescription}</p>
        <p><strong>${minPrice}</strong>{minPrice !== maxPrice ? ` – $${maxPrice}` : ''}</p>
        <p className="muted small">{service.variations.length} service variations</p>
        <div className="row gap-sm wrap">
          <Link href={`/services/${service.slug}`} className="button secondary">View Details</Link>
          <Link href={`/book?service=${service.slug}`} className="button">Book</Link>
        </div>
      </div>
    </article>
  );
}