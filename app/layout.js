import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { Bebas_Neue, Oswald, Inter, Space_Grotesk } from 'next/font/google';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

const oswald = Oswald({
  weight: '700',
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
});

const inter = Inter({
  weight: ['300', '400', '500', '600', '700', '900'],
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

export const metadata = {
  title: 'INZZOUT — Luxury Streetwear',
  description: 'INZZOUT — Luxury streetwear born from the streets. Not just a brand. A movement.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.jpg',
  },
};

export const viewport = {
  themeColor: '#0a0a0a',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${oswald.variable} ${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
