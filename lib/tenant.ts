import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function getCurrentTenant() {
  const supabase = await createClient();
  const headerStore = await headers();
  const host = headerStore.get('host');

  if (host) {
    const { data: domainTenant } = await supabase
      .from('tenants')
      .select('*')
      .eq('custom_domain', host)
      .eq('is_active', true)
      .maybeSingle();

    if (domainTenant) return domainTenant;
  }

  const defaultSlug = process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG || 'default';

  const { data: fallbackTenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', defaultSlug)
    .eq('is_active', true)
    .single();

  return fallbackTenant;
}
