import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentTenant } from '@/lib/tenant';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get('serviceId');

    if (!serviceId) {
      return NextResponse.json({ error: 'Missing serviceId.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const tenant = await getCurrentTenant();

    const { data, error } = await supabase
      .from('service_variations')
      .select(`
        id,
        service_id,
        name,
        price,
        duration_minutes,
        buffer_minutes,
        deposit_type,
        deposit_value
      `)
      .eq('tenant_id', tenant.id)
      .eq('service_id', serviceId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ variations: data || [] });
  } catch (error) {
    console.error('service-variations error:', error);
    return NextResponse.json(
      { error: 'Failed to load service variations.' },
      { status: 500 }
    );
  }
}
