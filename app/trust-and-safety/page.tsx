import React from "react";
import SafetySection from "@/components/HomePage/SafetySection";
import HiringSafelySection from "@/components/TrustSafety/HiringSafelySection";

export const metadata = {
  title: "Trust & Safety - TugaTrades",
  description: "Learn how TugaTrades helps keep customers and tradespeople safe, verified, and protected.",
};

export default function TrustAndSafetyPage() {
  return (
    <main className="min-h-screen bg-white pt-24 md:pt-32">
      <SafetySection className="pt-4 md:pt-6 pb-8 md:pb-12" />
      <HiringSafelySection />
    </main>
  );
}
