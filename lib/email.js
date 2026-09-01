import { Resend } from 'resend';

export async function sendOrderNotification(order) {
  if (!process.env.RESEND_API_KEY || !process.env.ORDER_NOTIFICATION_EMAIL || !process.env.ORDER_FROM_EMAIL) return;
  const items = order.items.map((item) => `<li>${item.name} — ${item.size}, ${item.color} × ${item.quantity}</li>`).join('');
  await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: process.env.ORDER_FROM_EMAIL, to: process.env.ORDER_NOTIFICATION_EMAIL, subject: `New INZZOUT order ${order.id}`,
    html: `<h2>New paid order</h2><p><strong>Order:</strong> ${order.id}<br/><strong>Total:</strong> ₹${(order.total_paise / 100).toFixed(2)}</p><h3>Customer</h3><p>${order.customer_name}<br/>${order.email}<br/>${order.phone}</p><h3>Delivery address</h3><p>${order.address_line1}<br/>${order.address_line2 ? `${order.address_line2}<br/>` : ''}${order.city}, ${order.state} ${order.postal_code}</p><h3>Items</h3><ul>${items}</ul>`,
  });
}
