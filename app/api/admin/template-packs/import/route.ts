import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, templatePack } = body;

    if (!tenantId || !templatePack) {
      return NextResponse.json(
        { error: 'Missing tenantId or templatePack.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    if (templatePack.siteSettings?.length) {
      await supabase.from('site_settings').delete().eq('tenant_id', tenantId);
      await supabase.from('site_settings').insert(
        templatePack.siteSettings.map((row: any) => ({
          ...row,
          id: undefined,
          tenant_id: tenantId,
        }))
      );
    }

    if (templatePack.themeSettings?.length) {
      await supabase.from('theme_settings').delete().eq('tenant_id', tenantId);
      await supabase.from('theme_settings').insert(
        templatePack.themeSettings.map((row: any) => ({
          ...row,
          id: undefined,
          tenant_id: tenantId,
        }))
      );
    }

    if (templatePack.siteContent?.length) {
      await supabase.from('site_content').delete().eq('tenant_id', tenantId);
      await supabase.from('site_content').insert(
        templatePack.siteContent.map((row: any) => ({
          ...row,
          id: undefined,
          tenant_id: tenantId,
        }))
      );
    }

    if (templatePack.homepageSections?.length) {
      await supabase.from('homepage_sections').delete().eq('tenant_id', tenantId);
      await supabase.from('homepage_sections').insert(
        templatePack.homepageSections.map((row: any) => ({
          ...row,
          id: undefined,
          tenant_id: tenantId,
        }))
      );
    }

    if (templatePack.navigationLinks?.length) {
      await supabase.from('navigation_links').delete().eq('tenant_id', tenantId);
      await supabase.from('navigation_links').insert(
        templatePack.navigationLinks.map((row: any) => ({
          ...row,
          id: undefined,
          tenant_id: tenantId,
        }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Template import error:', error);
    return NextResponse.json(
      { error: 'Failed to import template pack.' },
      { status: 500 }
    );
  }
}
