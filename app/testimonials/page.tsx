import { createClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant';

type TestimonialItem = {
  name: string;
  text: string;
};

export default async function TestimonialsPage() {
  const supabase = await createClient();
  const tenant = await getCurrentTenant();

  const { data } = await supabase
    .from('site_content')
    .select('title, body, json_content')
    .eq('tenant_id', tenant.id)
    .eq('content_key', 'testimonials_page')
    .single();

  const testimonials = (data?.json_content || []) as TestimonialItem[];

  return (
    <main className="section shell">
      <p className="eyebrow">Testimonials</p>
      <h1>{data?.title || 'What Clients Are Saying'}</h1>
      <p className="muted max-2xl">
        {data?.body || 'Feedback from clients who have used the platform.'}
      </p>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        {testimonials.map((testimonial, index) => (
          <div key={`${testimonial.name}-${index}`} className="card card-body">
            <h2>{testimonial.name}</h2>
            <p className="muted">“{testimonial.text}”</p>
          </div>
        ))}
      </div>
    </main>
  );
}
