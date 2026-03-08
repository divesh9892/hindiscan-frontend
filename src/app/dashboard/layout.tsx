import { UserButton } from "@clerk/nextjs";
import { FileText, History, Menu } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      
      {/* 🚀 DESKTOP SIDEBAR (Hidden on mobile) */}
      <aside className="hidden w-64 flex-col border-r bg-white dark:bg-slate-900 md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <span className="font-bold text-lg tracking-tight">HindiScan</span>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
            <FileText className="h-4 w-4" />
            New Scan
          </Link>
          <Link href="/dashboard/billing" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 transition-all hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-800">
            <History className="h-4 w-4" />
            Billing History
          </Link>
        </nav>
      </aside>

      {/* 🚀 MAIN CONTENT WRAPPER */}
      <div className="flex flex-1 flex-col">
        
        {/* TOP HEADER */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6 dark:bg-slate-900">
          
          {/* 📱 MOBILE HAMBURGER MENU (Hidden on Desktop) */}
          <div className="flex items-center md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle mobile menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetHeader>
                  <SheetTitle className="text-left font-bold">HindiScan</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col space-y-2">
                  <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
                    <FileText className="h-4 w-4" />
                    New Scan
                  </Link>
                  <Link href="/dashboard/billing" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 transition-all hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
                    <History className="h-4 w-4" />
                    Billing History
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <span className="font-bold text-lg tracking-tight">HindiScan</span>
          </div>

          {/* Desktop invisible spacer to keep right-side items aligned */}
          <div className="hidden md:block font-bold"></div>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex items-center justify-end gap-3 md:gap-4">
            <Badge variant="secondary" className="font-mono text-xs md:text-sm">
              Credits: 3
            </Badge>
            <ThemeToggle />
            <UserButton />
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>
        
      </div>
    </div>
  );
}