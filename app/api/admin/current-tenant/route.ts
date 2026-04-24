import { NextResponse } from 'next/server';
import { getCurrentTenant } from '@/lib/tenant';

export async function GET() {
  try {
    const tenant = await getCurrentTenant();
    return NextResponse.json({ tenant });
  } catch (error) {
    console.error('current-tenant error:', error);
    return NextResponse.json(
      { error: 'Failed to load current tenant.' },
      { status: 500 }
    );
  }
}
