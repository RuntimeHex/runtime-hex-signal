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

export const metadata: Metadata = {
  metadataBase: new URL("https://runtime-hex-nobody-owns-signal.rth-won.chatgpt.site"),
  title: "Nobody Owns the Signal | Runtime Hex",
  description:
    "A retro text adventure about inherited roads, costly help, and the choices nobody can assign you.",
  applicationName: "Runtime Hex: Nobody Owns the Signal",
  keywords: ["Runtime Hex", "text adventure", "interactive fiction", "OpenAI Build Week"],
  openGraph: {
    title: "Runtime Hex // Nobody Owns the Signal",
    description: "A Runtime Hex text adventure about inherited roads, costly help, and choice.",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Runtime Hex // Nobody Owns the Signal",
    description: "A Runtime Hex text adventure about inherited roads, costly help, and choice.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/brand/rth-mark.png",
    shortcut: "/brand/rth-mark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
