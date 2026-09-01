import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { markOrderPaid } from '@/lib/orders';

export const runtime = 'nodejs';
export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();
    if (![razorpay_order_id, razorpay_payment_id, razorpay_signature].every((value) => typeof value === 'string')) return NextResponse.json({ error: 'Invalid payment response.' }, { status: 400 });
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    const received = Buffer.from(razorpay_signature);
    if (received.length !== Buffer.byteLength(expected) || !crypto.timingSafeEqual(Buffer.from(expected), received)) return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
    const order = await markOrderPaid({ razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id });
    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) { console.error('Razorpay verify error:', error); return NextResponse.json({ error: error.message || 'Unable to verify payment.' }, { status: 400 }); }
}
