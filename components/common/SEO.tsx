import { Metadata } from 'next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
}

export function generateMetadata({
  title = 'PerfectIt - Share Your Perfect Moments',
  description = 'Discover and share perfectly executed ideas, designs, and solutions. Join a community that celebrates excellence in every detail.',
  keywords = 'perfect, showcase, portfolio, creative, design, excellence, community, share',
  ogImage = '/og-image.png',
  ogUrl = 'https://perfectit.app',
  twitterCard = 'summary_large_image',
}: SEOProps = {}): Metadata {
  return {
    title,
    description,
    keywords,
    authors: [{ name: 'PerfectIt Team' }],
    creator: 'PerfectIt',
    publisher: 'PerfectIt',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(ogUrl),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title,
      description,
      url: ogUrl,
      siteName: 'PerfectIt',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'PerfectIt - Share Your Perfect Moments',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      images: [ogImage],
      creator: '@perfectit',
      site: '@perfectit',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png' },
      ],
      other: [
        {
          rel: 'mask-icon',
          url: '/safari-pinned-tab.svg',
        },
      ],
    },
    manifest: '/site.webmanifest',
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
    },
    verification: {
      google: 'google-site-verification-code',
      yandex: 'yandex-verification-code',
      yahoo: 'yahoo-site-verification-code',
    },
    category: 'technology',
  };
}

export const defaultMetadata = generateMetadata();