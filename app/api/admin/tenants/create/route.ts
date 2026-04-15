import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, ownerUserId } = body;

    if (!name || !slug || !ownerUserId) {
      return NextResponse.json(
        { error: 'Missing name, slug, or ownerUserId.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name,
        slug,
        is_active: true,
      })
      .select()
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: tenantError?.message || 'Failed to create tenant.' },
        { status: 500 }
      );
    }

    await supabase.from('tenant_users').insert({
      tenant_id: tenant.id,
      user_id: ownerUserId,
      role: 'owner',
    });

    await supabase.from('site_settings').insert({
      tenant_id: tenant.id,
      business_name: name,
      tagline: 'New brand setup',
    });

    await supabase.from('theme_settings').insert({
      tenant_id: tenant.id,
      primary_color: '#7b4b33',
      background_color: '#fffaf6',
      panel_color: '#ffffff',
      text_color: '#1f1a17',
      muted_color: '#6c625b',
      accent_soft: '#f2e5dc',
      border_color: '#e7d9cf',
      shadow: '0 12px 30px rgba(50, 25, 12, 0.08)',
      font_body: 'Arial, Helvetica, sans-serif',
      font_heading: 'Georgia, serif',
      border_radius: '22px',
      button_radius: '999px',
    });

    await supabase.from('site_content').insert([
      {
        tenant_id: tenant.id,
        content_key: 'homepage_content',
        title: name,
        body: 'New brand homepage content',
        json_content: {
          hero_eyebrow: 'Premium booking template',
          hero_title: name,
          hero_text: 'Luxury booking, polished branding, and a premium client experience.',
        },
      },
      {
        tenant_id: tenant.id,
        content_key: 'about_page',
        title: `About ${name}`,
        body: 'Tell your brand story here.',
        json_content: {},
      },
      {
        tenant_id: tenant.id,
        content_key: 'contact_page',
        title: 'Contact Us',
        body: 'Add your support details here.',
        json_content: {},
      },
    ]);

    await supabase.from('homepage_sections').insert([
      {
        tenant_id: tenant.id,
        section_key: `${slug}_hero`,
        title: name,
        body: 'Luxury booking, polished branding, and a premium client experience.',
        sort_order: 1,
        is_active: true,
      },
    ]);

    return NextResponse.json({ success: true, tenant });
  } catch (error) {
    console.error('Tenant create error:', error);
    return NextResponse.json(
      { error: 'Failed to create tenant.' },
      { status: 500 }
    );
  }
}
