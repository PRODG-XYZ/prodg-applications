import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DebugNavbarWrapper from "../components/DebugNavbarWrapper";

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
  title: "Join PeopleOS",
  description: "Apply to join PeopleOS",
  keywords: ["PeopleOS", "developer jobs", "coding community", "software development", "tech careers", "collaborative programming"],
  authors: [{ name: "PeopleOS" }],
  creator: "PeopleOS",
  publisher: "PeopleOS",
  applicationName: "PeopleOS Application Portal",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Join PeopleOS | Apply to PeopleOS",
    description: "Apply to join PeopleOS - A collaborative platform for innovative developers to code, collaborate, and grow together.",
    images: ['/og-image.png'],
    locale: 'en_US',
    siteName: "PeopleOS",
    url: "https://apply.peopleos.com",
  },
  twitter: {
    card: 'summary_large_image',
    title: "Join PeopleOS",
    description: "Apply to join PeopleOS",
    creator: "@peopleos",
    images: ['/og-image.png'],
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
        <meta name="apple-mobile-web-app-title" content="PeopleOS" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <DebugNavbarWrapper />
      </body>
    </html>
  );
}
