import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/db';

export const runtime = 'nodejs';
export async function GET() {
  try { return NextResponse.json({ products: await getProducts() }); }
  catch (error) { console.error('GET /api/products error:', error); return NextResponse.json({ error: 'Products are temporarily unavailable.' }, { status: 503 }); }
}
