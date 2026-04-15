import { createClient } from '@/lib/supabase/server';

export default async function AboutPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('site_content')
    .select('title, body, json_content')
    .eq('content_key', 'about_page')
    .single();

  const content = data?.json_content || {};

  return (
    <main className="section shell">
      <p className="eyebrow">About</p>
      <h1>{data?.title || 'About Crown Studio'}</h1>
      <p className="muted max-2xl">
        {data?.body ||
          'Crown Studio is a premium booking experience designed to make scheduling, communication, deposits, and client management simple and polished.'}
      </p>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card card-body">
          <h2>{content.mission_heading || 'Our Mission'}</h2>
          <p className="muted">
            {content.mission_text ||
              'We aim to provide a smooth and professional booking experience for both clients and providers, with clear scheduling, transparent policies, and a more elevated service process.'}
          </p>
        </div>

        <div className="card card-body">
          <h2>{content.offer_heading || 'What We Offer'}</h2>
          <p className="muted">
            {content.offer_text ||
              'Clients can book appointments, upload inspiration photos, manage bookings, and receive updates, while staff and admin can manage scheduling, refunds, services, and reporting.'}
          </p>
        </div>
      </div>
    </main>
  );
}
