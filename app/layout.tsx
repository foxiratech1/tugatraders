import type { Metadata } from "next";
import { Bricolage_Grotesque, Wix_Madefor_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import React from "react";
import NavbarWrapper from "@/components/Layout/NavbarWrapper";
import Footer from "@/layout/Footer";
import { StoreProvider } from "@/store/provider";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const wix = Wix_Madefor_Display({
  variable: "--font-wix",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TugaTrades",
  description: "Find trusted professionals for every job",
  icons: {
    icon: "/Tugatraderslogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${wix.variable} h-full antialiased `}
      suppressHydrationWarning
    >
      <body className={`${wix.className} min-h-full flex flex-col`} suppressHydrationWarning>
        <StoreProvider>
          <Toaster position="top-right" />
          <NavbarWrapper />
          <div className="flex-1 ">
            {children}
          </div>
          {/* Wrap Footer with Suspense to avoid useSearchParams SSR issue */}
          <React.Suspense fallback={<div className="text-center py-4">Loading footer...</div>}>
            <Footer />
          </React.Suspense>
        </StoreProvider>
      </body>
    </html>
  );
}
