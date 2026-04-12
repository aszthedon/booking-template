import './globals.css';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Crown Studio',
    template: '%s | Crown Studio',
  },
  description:
    'Luxury booking platform for appointments, provider scheduling, deposits, and client dashboards.',
  keywords: [
    'booking',
    'appointments',
    'beauty booking',
    'service booking',
    'provider scheduling',
    'client dashboard',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Crown Studio',
    description:
      'Luxury booking platform for appointments, provider scheduling, deposits, and client dashboards.',
    url: '/',
    siteName: 'Crown Studio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crown Studio',
    description:
      'Luxury booking platform for appointments, provider scheduling, deposits, and client dashboards.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
