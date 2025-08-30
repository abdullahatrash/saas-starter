import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';

export const metadata: Metadata = {
  title: {
    default: 'TattooPreview - AI Tattoo Preview Generator for Artists',
    template: '%s | TattooPreview'
  },
  description: 'Generate photorealistic tattoo previews in seconds. Upload a photo and design, get instant AI-powered previews. Perfect for tattoo artists and studios. Try 3 free previews!',
  keywords: ['tattoo preview', 'tattoo generator', 'AI tattoo', 'tattoo design', 'tattoo mockup', 'tattoo visualization', 'tattoo artist tools', 'tattoo studio software'],
  authors: [{ name: 'TattooPreview' }],
  creator: 'TattooPreview',
  publisher: 'TattooPreview',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tattoopreview.com',
    siteName: 'TattooPreview',
    title: 'TattooPreview - AI Tattoo Preview Generator',
    description: 'Generate photorealistic tattoo previews in seconds. Perfect for tattoo artists and studios.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TattooPreview - AI Tattoo Preview Generator',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TattooPreview - AI Tattoo Preview Generator',
    description: 'Generate photorealistic tattoo previews in seconds.',
    images: ['/twitter-image.png'],
    creator: '@tattoopreview',
  },
  alternates: {
    canonical: 'https://tattoopreview.com',
  },
  category: 'technology',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <SWRConfig
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              '/api/user': getUser(),
              '/api/team': getTeamForUser()
            }
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
