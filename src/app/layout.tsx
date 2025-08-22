import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { Toaster } from "sonner";
import Link from "next/link";
import { ClientAuthProvider } from "@/components/auth/ClientAuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Snack Management System",
  description: "Manage snacks, sales, and debts efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen`}
      >
        <ClientAuthProvider>
          {children}
        </ClientAuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
