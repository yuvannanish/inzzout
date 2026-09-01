import { neon } from '@neondatabase/serverless';

let sqlClient;

function getSql() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured. Add your Neon connection string to .env.local.');
  sqlClient ??= neon(process.env.DATABASE_URL);
  return sqlClient;
}

function toProduct(row) {
  return { id: row.id, name: row.name, price: Number(row.price_paise) / 100, originalPrice: row.original_price_paise ? Number(row.original_price_paise) / 100 : null, collection: row.collection, description: row.description, stock: row.stock, sizes: row.sizes, colors: row.colors, imageUrl: row.image_url, badge: row.badge };
}

export async function getProducts() {
  const rows = await getSql()`SELECT id, name, price_paise, original_price_paise, collection, description, stock, sizes, colors, image_url, badge FROM products WHERE active = true ORDER BY id ASC`;
  return rows.map(toProduct);
}

export async function getProductsForCheckout(cartItems) {
  const ids = [...new Set(cartItems.map((item) => Number(item.id)))].filter(Number.isInteger);
  if (!ids.length) return [];
  return getSql()`SELECT id, name, price_paise, stock, sizes, colors, image_url FROM products WHERE active = true AND id = ANY(${ids})`;
}

export async function addSubscriber(email) {
  await getSql()`INSERT INTO subscribers (email) VALUES (${email.toLowerCase()}) ON CONFLICT (email) DO NOTHING`;
}

export function getDatabase() { return getSql(); }
