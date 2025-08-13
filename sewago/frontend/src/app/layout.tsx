import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/providers/react-query";
import { LanguageProvider } from "@/providers/language";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { LiteModeProvider } from "@/providers/lite";
import { AuthProvider } from "@/providers/auth";
import "@/lib/auth";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SewaGo",
  description: "Local services marketplace",
  openGraph: {
    title: "SewaGo",
    description: "Discover and book local services",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(`${inter.variable} antialiased`, "min-h-screen bg-white text-gray-900")}
      >
        <AuthProvider>
          <ReactQueryProvider>
            <LanguageProvider>
              <LiteModeProvider>
                <Navbar />
                {children}
              </LiteModeProvider>
            </LanguageProvider>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
