"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, parseJwt, getUserRole, getUser } from "@/utils/auth";
import { Role } from "@/utils/role";
import { authApi } from "@/app/api/authApi";

/**
 * AuthGuard — wraps protected pages (customer-dashboard, profile, etc.).
 * If the user does NOT have a valid token,
 * they are immediately redirected to the login page.
 * If the user's email is not verified, they are redirected to OTP verification.
 * If logged in and verified, the children render normally.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useLayoutEffect(() => {
    const checkAuth = async () => {
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

      // Check EMAIL verification status (isEmailVerified)
      // Note: isVerified is a separate field for admin/profile verification — do NOT use it here
      let isEmailVerified = decoded?.isEmailVerified ?? decoded?.user?.isEmailVerified;

      if (isEmailVerified === undefined) {
        const localUser = getUser();
        if (localUser && localUser.isEmailVerified !== undefined) {
          isEmailVerified = localUser.isEmailVerified;
        }
      }

      // If token and local storage don't contain email verification info, fetch from API
      if (isEmailVerified === undefined) {
        try {
          const profileRes = await authApi.getMyProfile();
          const pData = profileRes?.data || profileRes;
          isEmailVerified = pData?.isEmailVerified;
        } catch {
          // If profile fetch fails, assume unverified for safety
          isEmailVerified = false;
        }
      }

      if (isEmailVerified === false) {
        router.replace("/auth/verify-otp");
        return;
      }

      setAuthorized(true);
    };

    checkAuth();
  }, []);

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
