"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Preserve all query params when redirecting to the new path
    const params = searchParams?.toString();
    router.replace(`/auth/verify-otp${params ? `?${params}` : ""}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9F5]">
      <div className="w-8 h-8 border-3 border-[#243A24]/20 border-t-[#243A24] rounded-full animate-spin" />
    </div>
  );
}

export default function VerifyOtpRedirect() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8F9F5]"><div className="w-8 h-8 border-3 border-[#243A24]/20 border-t-[#243A24] rounded-full animate-spin" /></div>}>
      <RedirectContent />
    </Suspense>
  );
}
