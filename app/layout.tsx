import './globals.css';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Crown Studio',
    template: '%s | Crown Studio',
  },
  description: 'Luxury booking website template with admin-managed content.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: theme } = await supabase
    .from('theme_settings')
    .select('*')
    .limit(1)
    .single();

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
