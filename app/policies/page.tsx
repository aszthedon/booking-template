import { createClient } from '@/lib/supabase/server';

export default async function PoliciesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('site_content')
    .select('title, body, json_content')
    .eq('content_key', 'policies_page')
    .single();

  const content = data?.json_content || {};

  return (
    <main className="section shell">
      <p className="eyebrow">Policies</p>
      <h1>{data?.title || 'Booking Policies'}</h1>
      <p className="muted max-2xl">
        {data?.body ||
          'Please review our booking, deposit, cancellation, and refund policies before scheduling.'}
      </p>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card card-body">
          <h2>{content.deposit_heading || 'Deposits'}</h2>
          <p className="muted">
            {content.deposit_text ||
              'Deposits are required at checkout to secure your appointment. Deposit amounts vary by service and variation.'}
          </p>
        </div>

        <div className="card card-body">
          <h2>{content.cancellation_heading || 'Cancellations'}</h2>
          <p className="muted">
            {content.cancellation_text ||
              'Cancellations made at least 48 hours before the appointment may be eligible for refund consideration. Cancellations made less than 48 hours before the appointment may not be refundable.'}
          </p>
        </div>

        <div className="card card-body">
          <h2>{content.reschedule_heading || 'Rescheduling'}</h2>
          <p className="muted">
            {content.reschedule_text ||
              'Clients may reschedule based on provider availability. Rescheduled appointments must fit available provider hours and service duration requirements.'}
          </p>
        </div>

        <div className="card card-body">
          <h2>{content.noshow_heading || 'No-Shows'}</h2>
          <p className="muted">
            {content.noshow_text ||
              'Failure to attend an appointment without notice may result in forfeited deposits and future booking restrictions.'}
          </p>
        </div>
      </div>
    </main>
  );
}
