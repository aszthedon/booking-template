import { BusinessSettings, Service } from '@/lib/types';

export const businessSettings: BusinessSettings = {
  name: 'Crown Studio',
  tagline: 'Luxury booking, polished branding, and a premium client experience.',
  phone: '(555) 123-4567',
  email: 'hello@crownstudio.com',
  address: '123 Main Street, Flint, MI 48502',
  hours: ['Mon 9AM–5PM', 'Tue 9AM–6PM', 'Wed 9AM–6PM', 'Thu 9AM–7PM', 'Fri 9AM–7PM', 'Sat 8AM–3PM'],
  logoText: 'Crown Studio',
  announcement: 'Now booking spring appointments. Deposits required at checkout.',
  socialLinks: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    tiktok: 'https://tiktok.com',
    youtube: 'https://youtube.com'
  }
};

export const services: Service[] = [
  {
    id: '1',
    slug: 'signature-braids',
    name: 'Signature Braids',
    category: 'Braids',
    shortDescription: 'Protective braided styles with premium finish options.',
    fullDescription: 'This service includes sectioning, braiding, finishing, and styling with a polished look suitable for everyday wear or events.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    prepInstructions: [
      'Hair should be fully detangled.',
      'Please come product-light unless otherwise instructed.',
      'Bring inspiration photos through the client dashboard.'
    ],
    aftercareInstructions: [
      'Wrap hair nightly.',
      'Use scalp oil as needed.',
      'Follow your maintenance schedule.'
    ],
    variations: [
      {
        id: '1a',
        name: 'Shoulder Length',
        durationMinutes: 180,
        price: 160,
        depositType: 'flat',
        depositValue: 35,
        description: 'A classic shoulder-length finish.'
      },
      {
        id: '1b',
        name: 'Mid-Back Length',
        durationMinutes: 240,
        price: 210,
        depositType: 'flat',
        depositValue: 50,
        description: 'Longer braids for a fuller finish.'
      }
    ],
    addons: [
      { id: '1x', name: 'Curled Ends', price: 20, durationImpactMinutes: 20 },
      { id: '1y', name: 'Boho Pieces', price: 35, durationImpactMinutes: 30 }
    ],
    faqs: [
      { question: 'Can I upload inspiration photos?', answer: 'Yes. Clients can upload inspiration photos inside the client dashboard.' }
    ]
  }
];