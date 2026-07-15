"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { verifyOtp, resendOtp, getRegistrationStatus } from "@/app/api/authApi";
import { setTokens, clearTokens, getUser, setUser } from "@/utils/auth";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams?.get("email") || "";
  const categoryId = searchParams?.get("categoryId") || "";
  const redirectTo = searchParams?.get("redirectTo") || "";

  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    const user = getUser();
    if (user?.isEmailVerified) {
      // User is already verified, redirect them away from OTP page
      if (redirectTo) {
        window.location.replace(redirectTo);
      } else {
        const role = user?.role?.toLowerCase();
        if (role === "trader") {
          window.location.replace("/trader");
        } else if (role === "customer") {
          window.location.replace("/customer-dashboard/jobs");
        } else {
          window.location.replace("/");
        }
      }
    }
  }, [router, redirectTo]);

  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Email is missing.");
      return;
    }
    setResendLoading(true);
    try {
      await resendOtp({ email });
      toast.success("Verification code resent successfully!");
      setTimer(60);
    } catch (err: any) {
      const msg = err.response?.data?.message?.[0] || err.response?.data?.error || err.message || "Failed to resend code";
      toast.error(msg);
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email is missing. Please sign up again.");
      return;
    }
    if (otpValue.length < 4) {
      toast.error("Please enter a valid OTP");
      return;
    }

    setOtpLoading(true);
    try {
      const response = await verifyOtp({ otp: otpValue });

      const responseData = response?.data || response;
      const accessToken = responseData?.accessToken || responseData?.access_token || responseData?.token || response?.accessToken;
      const refreshToken = responseData?.refreshToken || responseData?.refresh_token || response?.refreshToken;

      if (accessToken) {
        setTokens(accessToken, refreshToken);
      }

      // OTP verification succeeded, update local user state immediately
      const currentUser = getUser();
      if (currentUser) {
        setUser({ ...currentUser, isEmailVerified: true });
      } else if (responseData?.user) {
        setUser(responseData.user);
      }
      // Redirect based on trader registration status or provided target URL
      const userObj = currentUser || responseData?.user;
      const userRole = (userObj?.role || "").toLowerCase();

      try {
        const statusResponse = await getRegistrationStatus();
        const data = statusResponse?.data || statusResponse;
        const isCompleted = data?.isRegistrationCompleted;

        if (userRole === "trader" || data?.selectedCategories || data?.currentStep) {
          if (isCompleted) {
            window.location.replace("/trader");
          } else if (data?.step2Completed === false || data?.currentStep === 2) {
            const catId = data?.selectedCategories?.[0]?.id || categoryId;
            window.location.replace(catId ? `/auth/trader-signup/step-2?categoryId=${catId}` : "/auth/trader-signup/step-2");
          } else if (data?.step3Completed === false || data?.currentStep === 3) {
            window.location.replace("/auth/trader-signup/step-3");
          } else {
            const catId = data?.selectedCategories?.[0]?.id || categoryId;
            window.location.replace(catId ? `/auth/trader-signup/step-2?categoryId=${catId}` : "/auth/trader-signup/step-2");
          }
        } else if (redirectTo) {
          window.location.replace(redirectTo);
        } else {
          window.location.replace("/customer-dashboard/jobs");
        }
      } catch (statusErr) {
        console.error("Failed to fetch registration status", statusErr);
        if (userRole === "trader") {
          window.location.replace(`/auth/trader-signup/step-2${categoryId ? `?categoryId=${categoryId}` : ""}`);
        } else if (redirectTo) {
          window.location.replace(redirectTo);
        } else {
          window.location.replace("/");
        }
      }
    } catch (err: any) {
      let msg = "OTP verification failed";
      if (err.response?.data?.message) {
        msg = Array.isArray(err.response.data.message)
          ? err.response.data.message[0]
          : err.response.data.message;
      } else if (err.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err.message) {
        msg = err.message;
      }
      toast.error(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[450px] bg-white rounded-[28px] p-6 sm:p-8 md:p-10 shadow-[0_8px_40px_rgba(36,58,36,0.03)] border border-[#243A240A] flex flex-col gap-[20px]">
      <Link href="/">
        <Image
          src="/logo.png"
          alt="Logo"
          width={177}
          height={40}
          className="object-contain"
        />
      </Link>

      <div>
        <h1
          className="text-[24px] sm:text-[26px] font-bold text-[#1C2C1C] tracking-tight leading-tight mb-1"
          style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
        >
          Verify Email
        </h1>
        <p className="text-[13px] text-[#1C2C1C]/55 font-medium">
          We've sent a verification code to <span className="font-bold text-[#1C2C1C]">{email || "your email"}</span>
        </p>
      </div>

      <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6 mt-4 mb-2">
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-extrabold text-[#1C2C1C] uppercase tracking-wider text-center">
            Enter Verification Code
          </label>
          <input
            type="text"
            placeholder="0 0 0 0 0 0"
            value={otpValue}
            maxLength={6}
            onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
            className="h-[56px] w-full max-w-[280px] mx-auto rounded-[14px] border border-[#243A241F] bg-[#F8F9F5] px-4 text-center text-[24px] tracking-[0.3em] font-bold text-[#1C2C1C] outline-none transition-all focus:border-[#6E9625] focus:bg-white focus:ring-2 focus:ring-[#6E9625]/20 shadow-inner"
          />
        </div>

        <button
          type="submit"
          disabled={otpLoading}
          className="h-[48px] w-full rounded-[12px] bg-[#1C2C1C] text-[15px] font-bold text-white shadow-sm transition-all hover:bg-[#2C4A2C] hover:shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {otpLoading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="text-center mt-2 flex flex-col gap-3">
          <p className="text-[13px] text-[#1C2C1C]/60 font-medium">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendLoading || timer > 0}
              className="text-[#6E9625] font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading
                ? "Resending..."
                : timer > 0
                ? `Resend OTP in ${timer}s`
                : "Resend OTP"}
            </button>
          </p>
          <button
            type="button"
            onClick={() => {
              clearTokens();
              router.replace("/auth/login");
            }}
            className="text-[13px] font-bold text-[#1C2C1C]/60 hover:text-[#1C2C1C] transition-colors"
          >
            Entered wrong email? Go back
          </button>
        </div>
      </form>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#F8F9F5] font-sans antialiased relative">
      <div className="flex w-full min-h-screen lg:min-h-screen overflow-hidden bg-[#F8F9F5] relative flex-col lg:flex-row z-10">

        <div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8 xl:px-12 relative overflow-y-auto z-10 bg-[#F8F9F5]">
          <Suspense fallback={<div className="text-center">Loading...</div>}>
            <VerifyOtpContent />
          </Suspense>
        </div>

        {/* Right side image */}
        <div className="hidden lg:flex w-full lg:w-[50%] lg:h-auto lg:self-stretch min-h-screen relative bg-[#1C2C1C] overflow-hidden lg:block flex-shrink-0 z-0">
          <div className="absolute inset-0 z-0">
            <Image
              src="/image2.png"
              alt="Background"
              fill
              className="object-cover opacity-60"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C2C1C] via-[#1C2C1C]/80 to-transparent z-10" />
          <div className="relative z-20 mt-auto p-12 text-white">
            <h2 className="text-[42px] font-bold leading-tight mb-4 tracking-tight" style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
              Confirm your identity
            </h2>
            <p className="text-[16px] text-white/80 leading-relaxed font-medium max-w-[480px]">
              We need to verify your email address to ensure the security of your TugaTraders account.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
