import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const providerId = searchParams.get('providerId');
  const serviceId = searchParams.get('serviceId');
  const variationId = searchParams.get('variationId');

  if (!providerId || !serviceId || !variationId) {
    return NextResponse.json(
      { error: 'Missing providerId, serviceId, or variationId.' },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: variation, error: variationError } = await supabase
    .from('service_variations')
    .select('duration_minutes, buffer_minutes')
    .eq('id', variationId)
    .single();

  if (variationError || !variation) {
    return NextResponse.json(
      { error: 'Could not load variation.' },
      { status: 404 }
    );
  }

  const { data: override } = await supabase
    .from('staff_services')
    .select('duration_override_minutes, buffer_override_minutes')
    .eq('staff_id', providerId)
    .eq('service_id', serviceId)
    .maybeSingle();

  const effectiveDuration =
    override?.duration_override_minutes ?? variation.duration_minutes ?? 30;

  const effectiveBuffer =
    override?.buffer_override_minutes ?? variation.buffer_minutes ?? 0;

  return NextResponse.json({
    duration_minutes: effectiveDuration,
    buffer_minutes: effectiveBuffer,
  });
}
