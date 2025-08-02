import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jasper Hall - Portfolio",
  description: "Interactive portfolio showcasing creative work across various mediums including music, design, and digital art.",
  keywords: ["portfolio", "jasper hall", "creative", "music", "design", "digital art"],
  authors: [{ name: "Jasper Hall" }],
  icons: {
    icon: '/logos/ogJaceLogo.svg?v=1',
    shortcut: '/logos/ogJaceLogo.svg?v=1',
    apple: '/logos/ogJaceLogo.svg?v=1',
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
        <link rel="icon" href="/logos/ogJaceLogo.svg?v=1" />
        <link rel="shortcut icon" href="/logos/ogJaceLogo.svg?v=1" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
