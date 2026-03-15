import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs' // 🚀 Clerk Authentication Provider
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HindiScan | Enterprise Data Extraction",
  description: "Secure, AI-powered Hindi document extraction.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 🚀 WRAP THE ENTIRE APP IN THE PROVIDER WITH CUSTOM FONT APPEARANCE
    <ClerkProvider 
      appearance={{
        variables: { 
          colorPrimary: '#0f172a', // Tailwind slate-900 for a professional SaaS look
          fontFamily: 'var(--font-geist-sans), sans-serif' // Forces Clerk to use Geist
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.className} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}