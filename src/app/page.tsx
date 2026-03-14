import Link from "next/link";
import { ArrowRight, CheckCircle2, FileJson, FileSpreadsheet, Zap, Shield, UploadCloud, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auth } from "@clerk/nextjs/server";
import { ThemeToggle } from "@/components/theme-toggle"; // 🚀 FIX 1: Added Theme Toggle

export const metadata = {
  title: "HindiScan | AI-Powered Hindi Document Extraction",
  description: "Extract tables, text, and data from complex Hindi PDFs. Convert Kruti Dev to Unicode and export to beautifully formatted Excel instantly.",
};

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-blue-200 dark:selection:bg-blue-900">
      
      {/* 🧭 NAVIGATION */}
      <nav className="container mx-auto flex h-20 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-blue-600 dark:text-blue-500" />
          <span className="text-xl font-bold tracking-tight">HindiScan</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle /> {/* 🚀 Added Theme Toggle here */}
          
          {userId ? (
            <Link href="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              {/* 🚀 FIX 2: Pointed to /sign-in for Passwordless flow */}
              <Link href="/sign-in" className="hidden sm:block text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Log in
              </Link>
              <Link href="/sign-in">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* 🚀 HERO SECTION */}
      <header className="container mx-auto px-6 pt-24 pb-20 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 border-none">
          ✨ Get 3 Free Credits on Signup
        </Badge>
        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          Unlock Data Trapped in <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            Complex Hindi Documents.
          </span>
        </h1>
        {/* 🚀 FIX 3: Rephrased to focus on Hindi fonts and clean Excel */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          The ultimate AI-powered extraction tool. Instantly convert messy images, PDFs, and legacy Hindi fonts into perfectly formatted Excel and JSON data.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/sign-in">
            <Button size="lg" className="h-14 px-8 text-lg shadow-lg hover:scale-105 transition-transform bg-blue-600 hover:bg-blue-700 text-white">
              Start Scanning for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-500 sm:ml-4">
            No credit card required.
          </p>
        </div>
      </header>

      {/* 🚀 FIX 7: NEW "HOW IT WORKS" SECTION */}
      <section className="py-20 bg-slate-100 dark:bg-slate-900/30">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">From messy image to clean data in 3 steps.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <UploadCloud className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Upload</h3>
              <p className="text-slate-600 dark:text-slate-400">Upload your Hindi PDF or image containing complex tables and text.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. AI Extraction</h3>
              <p className="text-slate-600 dark:text-slate-400">Our engine automatically fixes legacy fonts and maps out table grids.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
                <Download className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Download</h3>
              <p className="text-slate-600 dark:text-slate-400">Get your perfectly formatted `.xlsx` or `.json` file instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 💡 VALUE PROP / FEATURES */}
      <section className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why HindiScan?</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Engineered for accuracy where standard OCR fails.</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-8 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FileSpreadsheet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Perfect Table Extraction</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Stop typing data manually. We intelligently reconstruct complex, merged-cell tables directly into clean `.xlsx` files.
              </p>
            </div>
            
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-8 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <FileJson className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Legacy Font Healing</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Automatically detects and converts broken Kruti Dev and DevLys fonts into standard, searchable Unicode Hindi.
              </p>
            </div>
            
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-8 shadow-sm transition-all hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              {/* 🚀 FIX 4: Rephrased Security section to focus on Ephemeral Storage */}
              <h3 className="mb-2 text-xl font-semibold">Ephemeral Storage</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Your privacy matters. Documents are processed securely in temporary memory and are permanently auto-shredded from our servers exactly 15 minutes after extraction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 💰 PRICING (The Close) */}
      <section className="py-24 container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 font-medium">
            1 Page Scanned = 1 Credit. No hidden fees. No recurring subscriptions.
          </p>
        </div>

        {/* 🚀 FIX 5: Updated to a 3-column grid for the 3 pricing tiers */}
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3 items-center">
          
          {/* Tier 1: Free */}
          <div className="flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm h-full">
            <h3 className="text-2xl font-bold">Starter</h3>
            <div className="mt-4 flex items-baseline text-4xl font-extrabold">
              ₹0
              <span className="ml-1 text-lg font-medium text-slate-500">/ 3 Credits</span>
            </div>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm">Perfect for testing the AI capabilities.</p>
            <ul className="mt-8 flex-1 space-y-4 text-sm">
              <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-500" /> 3 Free Credits on Signup</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-500" /> Excel & JSON Export</li>
            </ul>
            <Link href="/sign-in" className="mt-8">
              <Button className="w-full h-12 text-md" variant="outline">Create Free Account</Button>
            </Link>
          </div>

          {/* Tier 2: Essential (Rs 49) */}
          <div className="flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm h-full">
            <h3 className="text-2xl font-bold">Essential</h3>
            <div className="mt-4 flex items-baseline text-4xl font-extrabold">
              ₹49
              <span className="ml-1 text-lg font-medium text-slate-500">/ 50 Credits</span>
            </div>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm">For individuals with occasional needs.</p>
            <ul className="mt-8 flex-1 space-y-4 text-sm">
              <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-500" /> Everything in Starter</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-500" /> Never expire credits</li>
            </ul>
            <Link href="/sign-in" className="mt-8">
              <Button className="w-full h-12 text-md bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200">Buy Essential</Button>
            </Link>
          </div>

          {/* Tier 3: Pro (Rs 99) */}
          <div className="relative flex flex-col rounded-3xl border-2 border-blue-600 bg-blue-50 dark:bg-blue-950/20 p-8 shadow-xl md:scale-105 z-10 h-full">
            <div className="absolute -top-4 right-8 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white shadow-sm">
              Best Value
            </div>
            <h3 className="text-2xl font-bold">Pro</h3>
            <div className="mt-4 flex items-baseline text-4xl font-extrabold text-blue-700 dark:text-blue-400">
              ₹99
              <span className="ml-1 text-lg font-medium text-slate-500">/ 120 Credits</span>
            </div>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm">For data entry teams and heavy users.</p>
            <ul className="mt-8 flex-1 space-y-4 text-sm">
              <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-500" /> Lowest cost per page</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-500" /> Priority Support</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-500" /> Priority Processing</li>
            </ul>
            <Link href="/sign-in" className="mt-8">
              <Button className="w-full h-12 text-md bg-blue-600 hover:bg-blue-700 text-white">Buy Pro Now</Button>
            </Link>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 text-center text-slate-500 dark:text-slate-400">
        <div className="container mx-auto px-6 flex flex-col items-center justify-between sm:flex-row">
          <div className="flex flex-col items-center sm:items-start">
            <p className="font-medium text-slate-900 dark:text-slate-100">© {new Date().getFullYear()} HindiScan. All rights reserved.</p>
            {/* 🚀 FIX 6: Built by Divesh text */}
            <p className="mt-1 text-sm text-slate-500">Built with ❤️ by Divesh.</p>
          </div>
          <div className="mt-6 flex gap-6 sm:mt-0 text-sm font-medium">
            <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</Link>
            <Link href="mailto:support@hindiscan.com" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}