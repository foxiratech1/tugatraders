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
        
        if (status !== "APPROVED") {
          // Allow access only to /trader/profile for updating details
          if (pathname === "/trader/profile") {
            setIsAllowed(true);
          } else {
            // Otherwise redirect to step 3 to see status
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

  // Trap the back button when authorized
  useEffect(() => {
    if (isAllowed) {
      window.history.pushState(null, "", window.location.href);
      const handlePopState = () => {
        window.history.pushState(null, "", window.location.href);
      };
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [isAllowed]);

  if (!isAllowed) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F0EDE8]"><p className="text-[#1C2C1C]">Loading...</p></div>;
  }

  return <>{children}</>;
}
