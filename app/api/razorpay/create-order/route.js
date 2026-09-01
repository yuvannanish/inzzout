import { NextResponse } from 'next/server';
import { createCheckoutOrder } from '@/lib/orders';

export const runtime = 'nodejs';
export async function POST(request) {
  try { return NextResponse.json(await createCheckoutOrder(await request.json())); }
  catch (error) { console.error('Razorpay create-order error:', error); return NextResponse.json({ error: error.message || 'Unable to start checkout.' }, { status: 400 }); }
}
