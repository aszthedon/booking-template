import { createClient } from '@/lib/supabase/server';
import { getCurrentTenantUser } from '@/lib/tenant-user';
import { redirect } from 'next/navigation';

export default async function ClientSiteCustomizerPage() {
  const supabase = await createClient();
  const tenantUser = await getCurrentTenantUser();

  if (!tenantUser) {
    redirect('/login');
  }

  const tenant = Array.isArray(tenantUser.tenant)
    ? tenantUser.tenant[0]
    : tenantUser.tenant;

  const [{ data: siteSettings }, { data: themeSettings }, { data: siteContent }] =
    await Promise.all([
      supabase.from('site_settings').select('*').eq('tenant_id', tenant.id),
      supabase.from('theme_settings').select('*').eq('tenant_id', tenant.id),
      supabase.from('site_content').select('*').eq('tenant_id', tenant.id),
    ]);

  return (
    <main className="section shell">
      <p className="eyebrow">Client Editor</p>
      <h1>{tenant?.name || 'Brand'} Site Customizer</h1>

      <div className="card card-body" style={{ marginTop: 24 }}>
        <p className="muted">
          This page confirms the logged-in owner/editor can access their tenant’s site content.
          The next step is wiring the same editable UI you already built in admin to this page.
        </p>

        <div className="list-stack" style={{ marginTop: 16 }}>
          <div className="list-row">
            <strong>Site Settings Rows</strong>
            <span>{siteSettings?.length || 0}</span>
          </div>
          <div className="list-row">
            <strong>Theme Settings Rows</strong>
            <span>{themeSettings?.length || 0}</span>
          </div>
          <div className="list-row">
            <strong>Content Rows</strong>
            <span>{siteContent?.length || 0}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
