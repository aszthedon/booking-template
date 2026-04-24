import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId } = body;

    if (!tenantId) {
      return NextResponse.json({ error: 'Missing tenantId.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const [
      { data: tenant },
      { data: siteSettings },
      { data: themeSettings },
      { data: siteContent },
      { data: homepageSections },
      { data: navigationLinks },
      { data: brandKits },
    ] = await Promise.all([
      supabase.from('tenants').select('*').eq('id', tenantId).single(),
      supabase.from('site_settings').select('*').eq('tenant_id', tenantId),
      supabase.from('theme_settings').select('*').eq('tenant_id', tenantId),
      supabase.from('site_content').select('*').eq('tenant_id', tenantId),
      supabase.from('homepage_sections').select('*').eq('tenant_id', tenantId),
      supabase.from('navigation_links').select('*').eq('tenant_id', tenantId),
      supabase.from('brand_kits').select('*').eq('tenant_id', tenantId),
    ]);

    return NextResponse.json({
      tenant,
      siteSettings,
      themeSettings,
      siteContent,
      homepageSections,
      navigationLinks,
      brandKits,
    });
  } catch (error) {
    console.error('Template export error:', error);
    return NextResponse.json(
      { error: 'Failed to export template pack.' },
      { status: 500 }
    );
  }
}
