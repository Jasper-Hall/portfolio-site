import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jasper Hall - Portfolio",
  description: "Interactive portfolio showcasing creative work across various mediums including music, design, and digital art.",
  keywords: ["portfolio", "jasper hall", "creative", "music", "design", "digital art"],
  authors: [{ name: "Jasper Hall" }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
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
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.svg" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
