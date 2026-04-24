import { createClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant';

type FAQItem = {
  question: string;
  answer: string;
};

export default async function FAQPage() {
  const supabase = await createClient();
  const tenant = await getCurrentTenant();

  const { data } = await supabase
    .from('site_content')
    .select('title, body, json_content')
    .eq('tenant_id', tenant.id)
    .eq('content_key', 'faq_page')
    .single();

  const faqs = (data?.json_content || []) as FAQItem[];

  return (
    <main className="section shell">
      <p className="eyebrow">FAQ</p>
      <h1>{data?.title || 'Frequently Asked Questions'}</h1>
      <p className="muted max-2xl">
        {data?.body || 'Find answers to common questions.'}
      </p>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        {faqs.map((faq, index) => (
          <div key={`${faq.question}-${index}`} className="card card-body">
            <h2>{faq.question}</h2>
            <p className="muted">{faq.answer}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
