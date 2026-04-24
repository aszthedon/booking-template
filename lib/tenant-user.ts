import { createClient } from '@/lib/supabase/server';

export async function getCurrentTenantUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('tenant_users')
    .select(`
      id,
      role,
      tenant:tenant_id (
        id,
        name,
        slug
      )
    `)
    .eq('user_id', user.id)
    .limit(1)
    .single();

  return data || null;
}
