"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Receipt, ArrowDownRight, ArrowUpRight, 
  Loader2, FileText, Gift, CreditCard, Inbox,
  CheckCircle2, Zap, ShieldCheck, XCircle, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

import { useApiClient } from "@/lib/apiClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const { user: clerkUser } = useUser();
  const isAdmin = clerkUser?.publicMetadata?.role === "admin";

  // ==========================================
  // 💰 STATE: MOCK CHECKOUT (TAB 1)
  // ==========================================
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutState, setCheckoutState] = useState<{
    isOpen: boolean;
    planId: string;
    orderId: string;
    amount: number;
  }>({ isOpen: false, planId: "", orderId: "", amount: 0 });

  // ==========================================
  // 📜 STATE: TRANSACTION LEDGER (TAB 2)
  // ==========================================
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // ==========================================
  // 🛡️ STATE: ADMIN GOD MODE
  // ==========================================
  const [targetEmail, setTargetEmail] = useState("");
  const [grantAmount, setGrantAmount] = useState(1000);
  const [isGranting, setIsGranting] = useState(false);

  // ==========================================
  // 📜 LOGIC: LEDGER & HISTORY
  // ==========================================
  const fetchTransactions = useCallback(async (cursor?: number | null) => {
    try {
      const endpoint = cursor 
        ? `/billing/history?limit=10&cursor=${cursor}` 
        : `/billing/history?limit=10`;
      
      const res = await api.get(endpoint);
      const { data, pagination } = res.data;

      if (cursor) {
        setTransactions((prev) => [...prev, ...data]);
      } else {
        setTransactions(data);
      }

      setHasMore(pagination.has_more);
      setNextCursor(pagination.next_cursor);
    } catch (error: any) {
      console.error("Failed to fetch billing history:", error);
      toast.error("Failed to load billing history.");
    } finally {
      setIsLoadingLedger(false);
      setIsLoadingMore(false);
    }
  }, [api]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleLoadMore = () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    fetchTransactions(nextCursor);
  };

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
      case "purchase":
      case "top_up":
        return { icon: <CreditCard className="h-4 w-4 text-emerald-500" />, label: "Credit Purchase" };
      case "god_mode_grant":
        return { icon: <ShieldAlert className="h-4 w-4 text-amber-500" />, label: "Admin Grant" };
      default:
        return { icon: <Receipt className="h-4 w-4 text-slate-500" />, label: "System Transaction" };
    }
  };

  // ==========================================
  // 💰 LOGIC: CHECKOUT & PAYMENTS
  // ==========================================
  const handleBuyClick = async (planId: string) => {
    setIsProcessingCheckout(true);
    toast.loading("Generating secure order...", { id: "checkout" });

    try {
      const res = await api.post("/billing/create-order", { plan_id: planId });
      const { order_id, amount } = res.data;

      toast.dismiss("checkout");
      setCheckoutState({
        isOpen: true,
        planId: planId,
        orderId: order_id,
        amount: amount / 100, 
      });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to initialize checkout.", { id: "checkout" });
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const handleMockPayment = async (isSuccess: boolean) => {
    if (!isSuccess) {
      setCheckoutState({ isOpen: false, planId: "", orderId: "", amount: 0 });
      return toast.error("Payment was cancelled or failed.");
    }

    setIsProcessingCheckout(true);
    toast.loading("Verifying payment with bank...", { id: "verify" });

    try {
      const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 10)}`;
      const mockSignature = `mock_sig_for_${mockPaymentId}`; 

      const res = await api.post("/billing/verify-payment", {
        razorpay_order_id: checkoutState.orderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature
      });

      toast.success(res.data.message || "Payment successful! Credits added.", { id: "verify" });
      
      // 🚀 The Magic Sync: Update navbar AND refresh the ledger table instantly!
      window.dispatchEvent(new Event("refreshCredits"));
      fetchTransactions(); 

    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Payment verification failed.", { id: "verify" });
    } finally {
      setIsProcessingCheckout(false);
      setCheckoutState({ isOpen: false, planId: "", orderId: "", amount: 0 });
    }
  };

  // ==========================================
  // 🛡️ LOGIC: ADMIN GOD MODE
  // ==========================================
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
      fetchTransactions(); 
      window.dispatchEvent(new Event("refreshCredits")); 
    } catch (error: any) {
      toast.error(error.response?.status === 429 ? "Too many requests! Please wait a minute." : error.response?.data?.detail || "Failed to grant credits.");
    } finally {
      setIsGranting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col min-h-[calc(100vh-8rem)] animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* HEADER SECTION */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Billing & Usage</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Top up your account or view your complete extraction history.
        </p>
      </div>

      {/* 🚀 THE MASTER TABS */}
      <Tabs defaultValue="topup" className="w-full flex-1">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-14 p-1 mb-8">
          <TabsTrigger value="topup" className="flex items-center justify-center gap-2 h-full font-semibold">
            <CreditCard className="h-4 w-4" /> Top Up Credits
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center justify-center gap-2 h-full font-semibold">
            <Receipt className="h-4 w-4" /> Transaction History
          </TabsTrigger>
        </TabsList>

        {/* ======================================= */}
        {/* TAB 1: PRICING & CHECKOUT               */}
        {/* ======================================= */}
        <TabsContent value="topup" className="space-y-6 animate-in fade-in">
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Essential Plan */}
            <Card className="flex flex-col border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Essential</CardTitle>
                <div className="mt-4 flex items-baseline text-4xl font-extrabold text-slate-900 dark:text-white">
                  ₹49
                  <span className="ml-1 text-lg font-medium text-slate-500">/ 50 Credits</span>
                </div>
                <CardDescription className="mt-2">For individuals with occasional needs.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between">
                <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400 mb-8">
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-500" /> Never expire credits</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-500" /> Excel & JSON Export</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-500" /> Standard Support</li>
                </ul>
                <Button 
                  className="w-full h-12 text-md" 
                  variant="outline"
                  disabled={isProcessingCheckout}
                  onClick={() => handleBuyClick("essential")}
                >
                  {isProcessingCheckout ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="mr-2 h-4 w-4" />}
                  Buy Essential
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="flex flex-col border-2 border-blue-600 dark:border-blue-500 shadow-xl relative overflow-hidden bg-blue-50/30 dark:bg-blue-900/10">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                BEST VALUE
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-blue-700 dark:text-blue-400">Pro</CardTitle>
                <div className="mt-4 flex items-baseline text-4xl font-extrabold text-slate-900 dark:text-white">
                  ₹99
                  <span className="ml-1 text-lg font-medium text-slate-500">/ 120 Credits</span>
                </div>
                <CardDescription className="mt-2">For data entry teams and heavy users.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between">
                <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400 mb-8">
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-500" /> Lowest cost per page</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-500" /> Priority Processing</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-500" /> Priority Support</li>
                </ul>
                <Button 
                  className="w-full h-12 text-md bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isProcessingCheckout}
                  onClick={() => handleBuyClick("pro")}
                >
                  {isProcessingCheckout ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="mr-2 h-4 w-4" />}
                  Buy Pro Now
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center items-center gap-2 text-sm text-slate-500 dark:text-slate-400 pt-4">
            <ShieldCheck className="h-5 w-5 text-green-500" />
            Payments are secured and encrypted. We do not store your credit card details.
          </div>
        </TabsContent>

        {/* ======================================= */}
        {/* TAB 2: TRANSACTION LEDGER               */}
        {/* ======================================= */}
        <TabsContent value="history" className="space-y-6 animate-in fade-in">
          <Card className="flex-1 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
              <CardTitle>Transaction Ledger</CardTitle>
              <CardDescription>A complete chronological history of your account.</CardDescription>
            </CardHeader>
            
            <CardContent className="p-0">
              {isLoadingLedger ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[1, 2, 3, 4].map((i) => (
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
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
                    <Inbox className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">No transactions yet</h3>
                  <p className="mt-2 text-sm text-slate-500 max-w-sm">
                    Your ledger is empty. Extract your first Hindi document or buy credits to see history!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transactions.map((tx) => {
                    const meta = getTransactionMeta(tx.transaction_type);
                    const isPositive = tx.amount > 0;

                    return (
                      <div key={tx.id} className="flex items-center justify-between p-6 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${isPositive ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-900/20' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'}`}>
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

                        <div className="text-right pl-4">
                          <Badge 
                            variant="secondary" 
                            className={`font-mono text-sm px-2.5 py-0.5 whitespace-nowrap ${
                              isPositive 
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                : 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400'
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

          {/* SECRET GOD MODE PANEL */}
          {isAdmin && (
            <Card className="border-red-500/50 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20 shadow-lg">
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
                    className="shadow-md hover:scale-105 transition-transform shrink-0"
                  >
                    {isGranting ? "Minting..." : "Mint Credits"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ======================================= */}
      {/* 🚀 THE MOCK PAYMENT OVERLAY MODAL       */}
      {/* ======================================= */}
      {checkoutState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-200 border-slate-200 dark:border-slate-800">
            <CardHeader className="text-center pb-2 border-b dark:border-slate-800">
              <div className="mx-auto bg-blue-100 dark:bg-blue-900/40 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl">Razorpay Test Gateway</CardTitle>
              <CardDescription>Order ID: {checkoutState.orderId}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6 text-center">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">Amount to Pay</p>
                <p className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1">₹{checkoutState.amount}</p>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 p-3 rounded-md text-xs text-left border border-amber-200 dark:border-amber-800/50">
                <strong>Developer Mode Active:</strong> You are using the Mock Payment Adapter. No real money will be charged. Choose an outcome below to test your webhook and database logic.
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/20"
                  onClick={() => handleMockPayment(false)}
                  disabled={isProcessingCheckout}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Simulate Failure
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleMockPayment(true)}
                  disabled={isProcessingCheckout}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Simulate Success
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}