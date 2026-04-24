import { createAdminClient } from '@/lib/supabase/admin';
import { headers } from 'next/headers';

export async function getCurrentTenant() {
  const supabase = createAdminClient();
  const headerStore = await headers();
  const host = headerStore.get('host');

  if (host) {
    const cleanHost = host.replace('www.', '').split(':')[0];

    const { data: domainTenant } = await supabase
      .from('tenants')
      .select('*')
      .eq('custom_domain', cleanHost)
      .eq('is_active', true)
      .maybeSingle();

    if (domainTenant) {
      return domainTenant;
    }
  }

  const defaultSlug = process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG || 'default';

  const { data: fallbackTenant, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', defaultSlug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw new Error(`Tenant lookup failed: ${error.message}`);
  }

  if (!fallbackTenant) {
    throw new Error(
      `No active tenant found. Create one in public.tenants with slug "${defaultSlug}".`
    );
  }

  return fallbackTenant;
}
