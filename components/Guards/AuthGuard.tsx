"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, parseJwt } from "@/utils/auth";

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

    // Token is valid
    setAuthorized(true);
  }, [router]);

  // Trap the back button when authorized
  useEffect(() => {
    if (authorized) {
      window.history.pushState(null, "", window.location.href);
      const handlePopState = () => {
        window.history.pushState(null, "", window.location.href);
      };
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [authorized]);

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
