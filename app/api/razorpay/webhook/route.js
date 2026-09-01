import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { markOrderPaid } from '@/lib/orders';

export const runtime = 'nodejs';

export async function POST(request) {
  const rawBody = Buffer.from(await request.arrayBuffer());
  const signature = request.headers.get('x-razorpay-signature') || '';
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const received = Buffer.from(signature);
  if (!secret || !signature || received.length !== Buffer.byteLength(expected) || !crypto.timingSafeEqual(Buffer.from(expected), received)) return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });

  try {
    const payload = JSON.parse(rawBody.toString('utf8'));
    if (payload.event === 'order.paid') {
      const orderId = payload.payload?.order?.entity?.id;
      const paymentId = payload.payload?.payment?.entity?.id;
      if (orderId && paymentId) await markOrderPaid({ razorpayOrderId: orderId, razorpayPaymentId: paymentId });
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}
