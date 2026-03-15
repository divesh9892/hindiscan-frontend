"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useApiClient } from "@/lib/apiClient";
import { useAuth } from "@clerk/nextjs"; // 🚀 Added Clerk Hook

export function CreditBadge() {
  const api = useApiClient();
  const { isLoaded, isSignedIn } = useAuth(); // 🚀 Grab loading states
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    // 🚀 THE FIX: Do absolutely nothing until Clerk has securely loaded the session
    if (!isLoaded || !isSignedIn) return;

    const fetchCredits = async () => {
      try {
        const res = await api.get("/users/me"); 
        setCredits(res.data.credit_balance);
      } catch {
        console.error("Failed to fetch credits");
      }
    };

    // Fetch immediately once ready
    fetchCredits();
    
    // Set up the listener for extractions
    window.addEventListener("refreshCredits", fetchCredits);
    return () => window.removeEventListener("refreshCredits", fetchCredits);
  }, [api, isLoaded, isSignedIn]); // 🚀 Added dependencies

  // Show a loading skeleton while fetching OR while Clerk is loading
  if (credits === null) {
    return <Badge variant="secondary" className="font-mono text-xs md:text-sm animate-pulse w-20 h-6"></Badge>;
  }

  return (
    <Badge variant="secondary" className="font-mono text-xs md:text-sm shadow-sm transition-all">
      Credits: {credits}
    </Badge>
  );
}