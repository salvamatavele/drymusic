import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SwRegister from "@/components/SwRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://stream.7spes.com";

const description =
  "DryMusic — ouve músicas e assiste vídeos em streaming, cria as tuas playlists, marca favoritos e descarrega para ouvir offline. App instalável (PWA).";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DryMusic — Música e vídeos em streaming",
    template: "%s · DryMusic",
  },
  description,
  applicationName: "DryMusic",
  keywords: [
    "música",
    "vídeos",
    "streaming",
    "playlists",
    "offline",
    "PWA",
    "DryMusic",
  ],
  authors: [{ name: "DryMusic" }],
  category: "music",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "DryMusic",
    title: "DryMusic — Música e vídeos em streaming",
    description,
    url: siteUrl,
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "DryMusic — Música e vídeos em streaming",
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DryMusic",
  },
};

export const viewport: Viewport = {
  themeColor: "#121212",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={`${geistSans.variable} h-full antialiased`}>
      <body className="h-full">
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
