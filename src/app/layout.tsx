import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  title: "Join ProDG",
  description: "Apply to join ProDG Studios",
  keywords: ["ProDG", "developer jobs", "coding community", "software development", "tech careers", "collaborative programming"],
  authors: [{ name: "ProDG Studios" }],
  creator: "ProDG Studios",
  publisher: "ProDG Studios",
  applicationName: "ProDG Application Portal",
  robots: "index, follow",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },
    { media: "(prefers-color-scheme: dark)", color: "#6366f1" },
  ],
  openGraph: {
    title: "Join ProDG | Apply to ProDG Studios",
    description: "Apply to join ProDG Studios - A collaborative platform for innovative developers to code, collaborate, and grow together.",
    type: "website",
    locale: "en_US",
    siteName: "ProDG Studios",
    url: "https://apply.prodg.studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join ProDG",
    description: "Apply to join ProDG Studios",
    creator: "@prodgstudios",
  },
  icons: {
    icon: '/logo.jpeg',
    shortcut: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
  manifest: "/site.webmanifest",
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ProDG" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
