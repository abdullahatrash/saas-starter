import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { getUser, getTeamForUser } from "@/lib/db/queries";
import { SWRConfig } from "swr";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: {
    default: "TattoosTry - Try Tattoos Before You Ink | AI Tattoo Preview",
    template: "%s | TattoosTry",
  },
  description:
    "Try tattoos on your skin instantly with AI. Upload a photo and design, get photorealistic previews in seconds. Perfect for tattoo artists and clients. Start with 3 free previews!",
  keywords: [
    "tattoos try",
    "try tattoos online",
    "tattoo preview",
    "AI tattoo generator",
    "tattoo simulator",
    "virtual tattoo try on",
    "tattoo design preview",
    "tattoo placement tool",
  ],
  authors: [{ name: "TattoosTry" }],
  creator: "TattoosTry",
  publisher: "TattoosTry",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tattoostry.com",
    siteName: "TattoosTry",
    title: "TattoosTry - Try Tattoos Before You Ink",
    description:
      "Try tattoos on your skin instantly with AI. Get photorealistic previews in seconds.",
    images: [
      {
        url: "https://tattoostry.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "TattoosTry - AI Powered Tattoo Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TattoosTry - Try Tattoos Before You Ink",
    description:
      "Try tattoos on your skin instantly with AI. Get photorealistic previews in seconds.",
    images: ["https://tattoostry.com/twitter-image.png"],
    creator: "@tattoostry",
  },
  alternates: {
    canonical: "https://tattoostry.com",
  },
  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const manrope = Manrope({ subsets: ["latin"] });

export default function RootLayout({
  children,
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
              "/api/user": getUser(),
              "/api/team": getTeamForUser(),
            },
          }}
        >
          {children}
          <Analytics />
        </SWRConfig>
      </body>
    </html>
  );
}
