"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getRegistrationStatus } from "@/app/api/authApi";

export default function TraderAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await getRegistrationStatus();
        const unwrapped = res?.data || res;
        const status = unwrapped?.verificationStatus ?? unwrapped?.status ?? "PENDING";
        const isCompleted = unwrapped?.isRegistrationCompleted ?? false;

        if (status !== "APPROVED" || !isCompleted) {
          // Allow access only to /trader/profile for updating details or /trader/update-documents for manual checks
          if (pathname === "/trader/profile" || pathname === "/trader/update-documents") {
            setIsAllowed(true);
          } else {
            // Otherwise redirect to step 3
            router.replace("/auth/trader-signup/step-3");
          }
        } else {
          setIsAllowed(true);
        }
      } catch (e) {
        router.replace("/auth/login");
      }
    };
    checkAuth();
  }, [pathname, router]);

  // Back button trap removed to allow normal navigation

  if (!isAllowed) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F0EDE8]"><p className="text-[#1C2C1C]">Loading...</p></div>;
  }

  return <>{children}</>;
}
