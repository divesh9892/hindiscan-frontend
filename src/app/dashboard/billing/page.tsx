"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Receipt, ArrowDownRight, ArrowUpRight, 
  Loader2, FileText, Gift, CreditCard, Inbox
} from "lucide-react";
import { toast } from "sonner";

import { useApiClient } from "@/lib/apiClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import { ShieldAlert } from "lucide-react"; 

// --- TYPES ---
interface Transaction {
  id: number;
  amount: number;
  transaction_type: string;
  reference_id: string | null;
  created_at: string;
}

export default function BillingPage() {
  const api = useApiClient();

  // --- STATE ---
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const { user: clerkUser } = useUser();
  const isAdmin = clerkUser?.publicMetadata?.role === "admin";

  const [targetEmail, setTargetEmail] = useState("");
  const [grantAmount, setGrantAmount] = useState(1000);
  const [isGranting, setIsGranting] = useState(false);

  // --- DATA FETCHING ---
  const fetchTransactions = useCallback(async (cursor?: number | null) => {
    try {
      const endpoint = cursor 
        ? `/billing/history?limit=10&cursor=${cursor}` 
        : `/billing/history?limit=10`;
      
      const res = await api.get(endpoint);
      const { data, pagination } = res.data;

      if (cursor) {
        // Append new transactions to the existing list (Cursor Pagination)
        setTransactions((prev) => [...prev, ...data]);
      } else {
        // First load
        setTransactions(data);
      }

      setHasMore(pagination.has_more);
      setNextCursor(pagination.next_cursor);
    } catch (error: any) {
      console.error("Failed to fetch billing history:", error);
      toast.error("Failed to load billing history. Please try again.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [api]);

  // Initial Load
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleLoadMore = () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    fetchTransactions(nextCursor);
  };

  // --- UI FORMATTING HELPERS ---
  const formatDate = (isoString: string) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short", day: "numeric", year: "numeric", 
      hour: "numeric", minute: "2-digit", hour12: true
    }).format(date);
  };

  const getTransactionMeta = (type: string) => {
    switch (type) {
      case "signup_bonus":
        return { icon: <Gift className="h-4 w-4 text-emerald-500" />, label: "Signup Bonus" };
      case "extraction_deduction":
        return { icon: <FileText className="h-4 w-4 text-blue-500" />, label: "Document Extraction" };
      case "top_up":
        return { icon: <CreditCard className="h-4 w-4 text-emerald-500" />, label: "Credit Purchase" };
      default:
        return { icon: <Receipt className="h-4 w-4 text-slate-500" />, label: "System Transaction" };
    }
  };

  const handleGodMode = async () => {
    if (!targetEmail) return toast.error("Enter a target email.");
    setIsGranting(true);
    
    try {
      await api.post("/admin/grant-god-mode", {
        target_email: targetEmail,
        credits_to_add: grantAmount
      });
      toast.success(`Granted ${grantAmount} credits to ${targetEmail}!`);
      setTargetEmail("");
      fetchTransactions(); // Refresh the table
      window.dispatchEvent(new Event("refreshCredits")); // Refresh the header badge
    } catch (error: any) {
      toast.error(error.response?.status === 429 ? "Too many requests! Please wait a minute." : error.response?.data?.detail || "Failed to grant credits.");
    } finally {
      setIsGranting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col min-h-[calc(100vh-8rem)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER SECTION */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Billing & Usage</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Track your extraction history and credit usage in real-time.
        </p>
      </div>

      <Card className="flex-1 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
          <CardTitle>Transaction Ledger</CardTitle>
          <CardDescription>A complete chronological history of your account.</CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            // SKELETON LOADER
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-6 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-900" />
                    </div>
                  </div>
                  <div className="h-5 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            // EMPTY STATE
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
                <Inbox className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">No transactions yet</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-sm">
                Your ledger is empty. Extract your first Hindi document to see your history appear here!
              </p>
            </div>
          ) : (
            // DATA TABLE
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.map((tx) => {
                const meta = getTransactionMeta(tx.transaction_type);
                const isPositive = tx.amount > 0;

                return (
                  <div key={tx.id} className="flex items-center justify-between p-6 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${isPositive ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-900/20' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'}`}>
                        {meta.icon}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-50">
                          {meta.label}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">{formatDate(tx.created_at)}</span>
                          {tx.reference_id && (
                            <>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span className="text-xs text-slate-500 truncate max-w-[120px] sm:max-w-xs" title={tx.reference_id}>
                                Ref: {tx.reference_id}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge 
  variant="secondary" 
  className={`font-mono text-sm px-2.5 py-0.5 ${
    isPositive 
      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' 
      : 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400' // 🚀 Red UI for deductions
  }`}
>
  <span className="flex items-center gap-1">
    {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
    {isPositive ? '+' : ''}{tx.amount}
  </span>
</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>

        {/* CURSOR PAGINATION FOOTER */}
        {hasMore && (
          <div className="border-t border-slate-100 p-4 text-center dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 rounded-b-xl">
            <Button 
              variant="outline" 
              onClick={handleLoadMore} 
              disabled={isLoadingMore}
              className="w-full sm:w-auto min-w-[200px]"
            >
              {isLoadingMore ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching Archive...</>
              ) : (
                "Load Older Transactions"
              )}
            </Button>
          </div>
        )}
      </Card>
      {/* 🚀 SECRET GOD MODE PANEL (ONLY RENDERS FOR ADMINS) */}
      {isAdmin && (
        <Card className="mt-8 border-red-500/50 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20 shadow-lg animate-in slide-in-from-bottom-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-500">
              <ShieldAlert className="h-5 w-5" /> Enterprise Admin Console
            </CardTitle>
            <CardDescription className="text-red-600/80 dark:text-red-400/80">
              You have God Mode privileges. You can mint and distribute unlimited credits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Target User Email..." 
                className="flex-1 rounded-md border border-red-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-red-900 dark:bg-slate-950"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
              />
              <input 
                type="number" 
                className="w-32 rounded-md border border-red-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-red-900 dark:bg-slate-950"
                value={grantAmount}
                onChange={(e) => setGrantAmount(Number(e.target.value))}
              />
              <Button 
                variant="destructive" 
                onClick={handleGodMode} 
                disabled={isGranting}
                className="shadow-md hover:scale-105 transition-transform"
              >
                {isGranting ? "Minting..." : "Mint Credits"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}