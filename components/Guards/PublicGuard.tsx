"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAccessToken, getUserRole, parseJwt, getUser } from "@/utils/auth";
import { Role } from "@/utils/role";

/**
 * PublicGuard — wraps public authentication pages (login, signup, forgot-password, etc.).
 * If the user is already logged in with a valid token,
 * they are immediately redirected to their role-based dashboard using router.replace().
 * This prevents them from seeing the auth page even if they click the Back button.
 */
export default function PublicGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = getAccessToken();
      if (!token) {
        // No token — user is a guest, show the auth page
        setChecked(true);
        return;
      }

      // Validate token expiry
      const decoded = parseJwt(token);
      if (!decoded || decoded.exp * 1000 <= Date.now()) {
        // Token expired — treat as guest
        setChecked(true);
        return;
      }



      // For other public pages (like auth pages), redirect to dashboard based on role
      const role = getUserRole();
      const roleStr = (role || "").toString().toLowerCase();

      const redirectBasedOnRole = () => {
        if (roleStr === Role.Trader.toLowerCase()) {
          import("@/app/api/authApi").then(({ getRegistrationStatus }) => {
            getRegistrationStatus().then((res) => {
              const data = res?.data || res;
              const vStatus = data?.verificationStatus ?? data?.status;
              const isStep2Done = data?.step2Completed === true || data?.currentStep === 3 || vStatus === "MANUAL_CHECK";

              if (data?.isRegistrationCompleted && vStatus === "APPROVED") {
                router.replace("/trader");
              } else if (!isStep2Done) {
                const catId = data?.selectedCategories?.[0]?.id;
                router.replace(catId ? `/auth/trader-signup/step-2?categoryId=${catId}` : "/auth/trader-signup/step-2");
              } else {
                router.replace("/auth/trader-signup/step-3");
              }
            }).catch(() => {
              router.replace("/auth/trader-signup/step-2");
            });
          });
        }
        else if (roleStr === Role.Customer.toLowerCase()) {
          router.replace("/customer-dashboard/jobs");
        } else {
          setChecked(true);
        }
      };

      // Only check isEmailVerified (email OTP verification)
      // isVerified is a separate field for admin/profile verification — do NOT use it here
      let isEmailVerified = decoded?.isEmailVerified ?? decoded?.user?.isEmailVerified;

      if (isEmailVerified === undefined) {
        const localUser = getUser();
        if (localUser && localUser.isEmailVerified !== undefined) {
          isEmailVerified = localUser.isEmailVerified;
        }
      }

      if (isEmailVerified === false) {
        router.replace("/auth/verify-otp");
        return;
      } else if (isEmailVerified === true) {
        redirectBasedOnRole();
        return;
      }

      // If undefined in token, fetch from API
      import("@/app/api/authApi").then(({ authApi }) => {
        authApi.getMyProfile().then((res: any) => {
          const user = res?.data || res;
          if (user?.isEmailVerified === false) {
            router.replace("/auth/verify-otp");
          } else {
            redirectBasedOnRole();
          }
        }).catch(() => {
          router.replace("/auth/verify-otp");
        });
      });
    };

    checkAuth();

    // Handle bfcache (back/forward cache)
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        checkAuth();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);

    // Don't set checked=true here — we're redirecting away so we don't render children
  }, [router, pathname]);

  if (!checked) {
    // Show nothing or a minimal loading state while determining auth status to prevent flicker
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9F5]">
        <div className="w-8 h-8 border-3 border-[#243A24]/20 border-t-[#243A24] rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
