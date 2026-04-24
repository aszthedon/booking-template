import { createClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant';

export default async function PoliciesPage() {
  const supabase = await createClient();
  const tenant = await getCurrentTenant();

  const { data } = await supabase
    .from('site_content')
    .select('title, body, json_content')
    .eq('tenant_id', tenant.id)
    .eq('content_key', 'policies_page')
    .single();

  const content = data?.json_content || {};

  return (
    <main className="section shell">
      <p className="eyebrow">Policies</p>
      <h1>{data?.title || 'Booking Policies'}</h1>
      <p className="muted max-2xl">
        {data?.body || 'Please review our booking policies before scheduling.'}
      </p>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card card-body">
          <h2>{content.deposit_heading || 'Deposits'}</h2>
          <p className="muted">{content.deposit_text || 'Deposit policy goes here.'}</p>
        </div>

        <div className="card card-body">
          <h2>{content.cancellation_heading || 'Cancellations'}</h2>
          <p className="muted">{content.cancellation_text || 'Cancellation policy goes here.'}</p>
        </div>

        <div className="card card-body">
          <h2>{content.reschedule_heading || 'Rescheduling'}</h2>
          <p className="muted">{content.reschedule_text || 'Rescheduling policy goes here.'}</p>
        </div>

        <div className="card card-body">
          <h2>{content.noshow_heading || 'No-Shows'}</h2>
          <p className="muted">{content.noshow_text || 'No-show policy goes here.'}</p>
        </div>
      </div>
    </main>
  );
}
