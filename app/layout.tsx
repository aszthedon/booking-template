import './globals.css';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTenant } from '@/lib/tenant';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  let businessName = 'Booking Template';
  let description = 'Luxury booking website template with admin-managed content.';

  try {
    const supabase = await createClient();
    const tenant = await getCurrentTenant();

    if (tenant?.id) {
      const [{ data: settings }, { data: homeContent }] = await Promise.all([
        supabase
          .from('site_settings')
          .select('business_name, tagline')
          .eq('tenant_id', tenant.id)
          .limit(1)
          .maybeSingle(),
        supabase
          .from('site_content')
          .select('title, body')
          .eq('tenant_id', tenant.id)
          .eq('content_key', 'homepage_content')
          .maybeSingle(),
      ]);

      businessName = settings?.business_name || tenant.name || businessName;
      description = homeContent?.body || settings?.tagline || description;
    }
  } catch {
    // Keep fallback metadata
  }

  return {
    title: {
      default: businessName,
      template: `%s | ${businessName}`,
    },
    description,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  let theme: any = null;

  try {
    const tenant = await getCurrentTenant();

    if (tenant?.id) {
      const { data } = await supabase
        .from('theme_settings')
        .select('*')
        .eq('tenant_id', tenant.id)
        .limit(1)
        .maybeSingle();

      theme = data;
    }
  } catch {
    theme = null;
  }

  const themeVars = {
    '--bg': theme?.background_color || '#fffaf6',
    '--panel': theme?.panel_color || '#ffffff',
    '--text': theme?.text_color || '#1f1a17',
    '--muted': theme?.muted_color || '#6c625b',
    '--accent': theme?.primary_color || '#7b4b33',
    '--accent-soft': theme?.accent_soft || '#f2e5dc',
    '--border': theme?.border_color || '#e7d9cf',
    '--shadow': theme?.shadow || '0 12px 30px rgba(50, 25, 12, 0.08)',
    '--font-body': theme?.font_body || 'Arial, Helvetica, sans-serif',
    '--font-heading': theme?.font_heading || 'Georgia, serif',
    '--radius-card': theme?.border_radius || '22px',
    '--radius-button': theme?.button_radius || '999px',
  } as React.CSSProperties;

  return (
    <html lang="en">
      <body style={themeVars}>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
