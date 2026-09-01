import { NextResponse } from 'next/server';
import { addSubscriber } from '@/lib/db';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const runtime = 'nodejs';
export async function POST(request) {
  try {
    const { email } = await request.json();
    if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    await addSubscriber(email.trim());
    return NextResponse.json({ success: true, message: "You're in. Welcome to the movement." });
  } catch (error) { console.error('Newsletter subscription error:', error); return NextResponse.json({ error: 'Unable to subscribe right now.' }, { status: 503 }); }
}
