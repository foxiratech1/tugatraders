"use client";

import React, { Suspense } from "react";
import CustomerReviews from "@/components/Customer/CustomerReviews";

export default function CustomerReviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F9F5] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#6E9625] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CustomerReviews />
    </Suspense>
  );
}
