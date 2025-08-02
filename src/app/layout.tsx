import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jasper Hall - Portfolio",
  description: "Interactive portfolio showcasing creative work across various mediums including music, design, and digital art.",
  keywords: ["portfolio", "jasper hall", "creative", "music", "design", "digital art"],
  authors: [{ name: "Jasper Hall" }],
  icons: {
    icon: '/logos/ogJaceLogo.svg',
    shortcut: '/logos/ogJaceLogo.svg',
    apple: '/logos/ogJaceLogo.svg',
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
