"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, parseJwt, getUserRole } from "@/utils/auth";
import { Role } from "@/utils/role";
/**
 * AuthGuard — wraps protected pages (customer-dashboard, profile, etc.).
 * If the user does NOT have a valid token,
 * they are immediately redirected to the login page.
 * If logged in, the children render normally.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    // Validate token expiry
    const decoded = parseJwt(token);
    if (!decoded || decoded.exp * 1000 <= Date.now()) {
      // Token expired — redirect to login
      router.replace("/auth/login");
      return;
    }

    // Token is valid - check role

    const role = getUserRole();
    const roleStr = (role || "").toString().toLowerCase();

    if (roleStr === Role.Trader.toLowerCase()) {
      router.replace("/trader");
      return;
    }

    if (roleStr !== Role.Customer.toLowerCase()) {
      router.replace("/");
      return;
    }

    setAuthorized(true);
  }, [router]);

  // Back button trap removed to allow normal navigation

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9F5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#243A24]/20 border-t-[#243A24] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
