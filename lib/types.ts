export type Role = 'visitor' | 'client' | 'staff' | 'admin';

export type DashboardLink = {
  href: string;
  label: string;
};

export type BusinessSettings = {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  hours: string[];
  logoText: string;
  announcement: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    tiktok: string;
    youtube: string;
  };
};

export type ServiceVariation = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  depositType: 'flat' | 'percent';
  depositValue: number;
  description: string;
};

export type ServiceAddon = {
  id: string;
  name: string;
  price: number;
  durationImpactMinutes: number;
};

export type Service = {
  id: string;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  prepInstructions: string[];
  aftercareInstructions: string[];
  variations: ServiceVariation[];
  addons: ServiceAddon[];
  faqs: { question: string; answer: string }[];
};