import { getProducts } from '@/lib/db';
import ClientPage from './ClientPage';

export const dynamic = 'force-dynamic';

export default async function Home() {
  return <ClientPage products={await getProducts()} />;
}
