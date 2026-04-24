import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentTenant } from '@/lib/tenant';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const tenant = await getCurrentTenant();

    const [{ data: services }, { data: staff }] = await Promise.all([
      supabase
        .from('services')
        .select('id, name')
        .eq('tenant_id', tenant.id)
        .eq('is_active', true)
        .order('name', { ascending: true }),
      supabase
        .from('staff')
        .select('id, name')
        .eq('tenant_id', tenant.id)
        .eq('is_active', true)
        .order('name', { ascending: true }),
    ]);

    return NextResponse.json({
      tenantId: tenant.id,
      services: services || [],
      staff: staff || [],
    });
  } catch (error) {
    console.error('booking-bootstrap error:', error);
    return NextResponse.json(
      { error: 'Failed to load booking data.' },
      { status: 500 }
    );
  }
}
