import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jasper Hall - Portfolio",
  description: "Interactive portfolio showcasing creative work across various mediums including music, design, and digital art.",
  keywords: ["portfolio", "jasper hall", "creative", "music", "design", "digital art"],
  authors: [{ name: "Jasper Hall" }],
  icons: {
    icon: [
      { url: '/favicons/favicon.ico', sizes: 'any' },
      { url: '/favicons/icon.svg', type: 'image/svg+xml' }
    ],
    apple: '/favicons/apple-touch-icon.png',
  },
  manifest: '/favicons/manifest.webmanifest',
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
                   <head>
               <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
               <link rel="icon" href="/favicons/icon.svg" type="image/svg+xml" />
               <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
               <link rel="manifest" href="/favicons/manifest.webmanifest" />
             </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
