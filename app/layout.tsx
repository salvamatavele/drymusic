import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SwRegister from "@/components/SwRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DryMusic",
  description: "A tua biblioteca privada de música e vídeos",
  applicationName: "DryMusic",
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
