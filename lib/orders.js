import crypto from 'crypto';
import { getDatabase, getProductsForCheckout } from './db';
import { sendOrderNotification } from './email';
import { getRazorpay } from './razorpay';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const requiredFields = ['name', 'email', 'phone', 'addressLine1', 'city', 'state', 'postalCode'];

function validate(customer, cart) {
  if (!Array.isArray(cart) || !cart.length || cart.length > 20) throw new Error('Your cart is invalid.');
  if (!customer || requiredFields.some((field) => typeof customer[field] !== 'string' || !customer[field].trim())) throw new Error('Complete all required delivery details.');
  if (!emailPattern.test(customer.email.trim())) throw new Error('Enter a valid email address.');
  if (!/^[0-9+()\-\s]{8,20}$/.test(customer.phone.trim())) throw new Error('Enter a valid phone number.');
  for (const item of cart) if (!Number.isInteger(Number(item.id)) || !Number.isInteger(Number(item.qty)) || item.qty < 1 || item.qty > 10 || typeof item.size !== 'string' || typeof item.color !== 'string') throw new Error('One or more cart items are invalid.');
}

export async function createCheckoutOrder({ cart, customer }) {
  validate(customer, cart);
  const products = await getProductsForCheckout(cart);
  const byId = new Map(products.map((product) => [product.id, product]));
  const items = [];
  let totalPaise = 0;
  for (const cartItem of cart) {
    const product = byId.get(Number(cartItem.id));
    if (!product || product.stock < Number(cartItem.qty) || !product.sizes.includes(cartItem.size) || !product.colors.includes(cartItem.color)) throw new Error('An item in your cart is unavailable. Refresh and try again.');
    const quantity = Number(cartItem.qty);
    totalPaise += Number(product.price_paise) * quantity;
    items.push({ id: product.id, name: product.name, size: cartItem.size, color: cartItem.color, quantity, unitPricePaise: Number(product.price_paise), imageUrl: product.image_url });
  }
  const id = crypto.randomUUID();
  const razorpayOrder = await getRazorpay().orders.create({ amount: totalPaise, currency: 'INR', receipt: `inzzout_${id.replaceAll('-', '').slice(0, 28)}`, notes: { inzzout_order_id: id } });
  await getDatabase()`INSERT INTO orders (id, razorpay_order_id, status, total_paise, currency, items, customer_name, email, phone, address_line1, address_line2, city, state, postal_code) VALUES (${id}, ${razorpayOrder.id}, 'pending', ${totalPaise}, 'INR', ${JSON.stringify(items)}::jsonb, ${customer.name.trim()}, ${customer.email.trim().toLowerCase()}, ${customer.phone.trim()}, ${customer.addressLine1.trim()}, ${customer.addressLine2?.trim() || null}, ${customer.city.trim()}, ${customer.state.trim()}, ${customer.postalCode.trim()})`;
  return { orderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency, key: process.env.RAZORPAY_KEY_ID };
}

export async function markOrderPaid({ razorpayOrderId, razorpayPaymentId }) {
  const sql = getDatabase();
  const [order] = await sql`SELECT * FROM orders WHERE razorpay_order_id = ${razorpayOrderId} LIMIT 1`;
  if (!order) throw new Error('Order was not found.');
  if (order.status === 'paid') return order;
  if (order.status !== 'pending') throw new Error('This order is already being processed.');
  const [claimedOrder] = await sql`UPDATE orders SET status = 'processing', updated_at = NOW() WHERE id = ${order.id} AND status = 'pending' RETURNING *`;
  if (!claimedOrder) throw new Error('This order is already being processed.');
  for (const item of order.items) {
    const result = await sql`UPDATE products SET stock = stock - ${item.quantity}, updated_at = NOW() WHERE id = ${item.id} AND stock >= ${item.quantity} RETURNING id`;
    if (!result.length) throw new Error(`${item.name} is no longer in stock. Contact support for a refund.`);
  }
  const [paidOrder] = await sql`UPDATE orders SET status = 'paid', razorpay_payment_id = ${razorpayPaymentId}, paid_at = NOW(), updated_at = NOW() WHERE id = ${order.id} AND status = 'processing' RETURNING *`;
  try { await sendOrderNotification(paidOrder || order); } catch (error) { console.error('Order email failed:', error); }
  return paidOrder || order;
}
