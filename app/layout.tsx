import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { generateMetadata } from '@/components/common/SEO';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = generateMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
