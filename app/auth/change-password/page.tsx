"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi } from "@/app/api/authApi";
import { AnimatedEye } from "@/app/ui/AnimatedEye";
import { useAnimatedEye } from "@/app/hooks/useAnimatedEye";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Animated eye state per field
  const { isBlinking: isBlinkingOld, mouseOffset: mouseOffsetOld, eyeRef: eyeOldRef } = useAnimatedEye();
  const { isBlinking: isBlinkingNew, mouseOffset: mouseOffsetNew, eyeRef: eyeNewRef } = useAnimatedEye();
  const { isBlinking: isBlinkingConfirm, mouseOffset: mouseOffsetConfirm, eyeRef: eyeConfirmRef } = useAnimatedEye();

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await authApi.changePassword({ oldPassword, newPassword, confirmPassword });
      toast.success("Password changed successfully!");
      router.push("/auth/login");
    } catch (err: any) {
      const msg =
        err.response?.data?.message?.[0] ||
        err.response?.data?.error ||
        "Failed to change password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#F8F9F5] font-sans antialiased">
      <div className="flex w-full max-w-[1440px] min-h-screen lg:min-h-screen xl:min-h-[1004px] overflow-hidden bg-[#F8F9F5] relative flex-col lg:flex-row">
        {/* LEFT SECTION */}
        <div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8 xl:px-12 relative overflow-y-auto z-10 bg-[#F8F9F5]">
          <div className="mx-auto w-full max-w-[450px] bg-white rounded-[28px] p-6 sm:p-8 md:p-10 shadow-[0_8px_40px_rgba(36,58,36,0.03)] border border-[#243A240A] flex flex-col gap-[20px]">
            {/* LOGO */}
            <Link href="/">
              <Image src="/logo.png" alt="Logo" width={177} height={40} className="object-contain" />
            </Link>
            <h1 className="text-[28px] font-bold text-[#1C2C1C]">Change Password</h1>
            <p className="text-[13px] sm:text-[13.5px] text-[#1C2C1C]/60 font-medium">
              Update your account password. Please provide your current password and choose a new one.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-[16px] mt-6">
              {/* CURRENT PASSWORD */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-[#1C2C1C] uppercase tracking-wider">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOld ? "text" : "password"}
                    placeholder="Current password"
                    value={oldPassword}
                    onChange={(e) => {
                      setOldPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className={`h-[44px] w-full rounded-[12px] border bg-white px-4 pr-10 text-[14px] text-[#1C2C1C] placeholder-[#1C2C1C]/30 outline-none transition-all font-medium ${error ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-[#243A241F] focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625]"}`}
                  />
                  <button
                    ref={eyeOldRef}
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="group absolute right-3 top-1/2 -translate-y-1/2 text-[#1C2C1C]/40 hover:text-[#1C2C1C] transition-colors p-0.5"
                    aria-label={showOld ? "Hide password" : "Show password"}
                  >
                    <AnimatedEye show={showOld} isBlinking={isBlinkingOld} mouseOffset={mouseOffsetOld} />
                  </button>
                </div>
              </div>
              {/* NEW PASSWORD */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-[#1C2C1C] uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className={`h-[44px] w-full rounded-[12px] border bg-white px-4 pr-10 text-[14px] text-[#1C2C1C] placeholder-[#1C2C1C]/30 outline-none transition-all font-medium ${error ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-[#243A241F] focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625]"}`}
                  />
                  <button
                    ref={eyeNewRef}
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="group absolute right-3 top-1/2 -translate-y-1/2 text-[#1C2C1C]/40 hover:text-[#1C2C1C] transition-colors p-0.5"
                    aria-label={showNew ? "Hide password" : "Show password"}
                  >
                    <AnimatedEye show={showNew} isBlinking={isBlinkingNew} mouseOffset={mouseOffsetNew} />
                  </button>
                </div>
              </div>
              {/* CONFIRM PASSWORD */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-[#1C2C1C] uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className={`h-[44px] w-full rounded-[12px] border bg-white px-4 pr-10 text-[14px] text-[#1C2C1C] placeholder-[#1C2C1C]/30 outline-none transition-all font-medium ${error ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-[#243A241F] focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625]"}`}
                  />
                  <button
                    ref={eyeConfirmRef}
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="group absolute right-3 top-1/2 -translate-y-1/2 text-[#1C2C1C]/40 hover:text-[#1C2C1C] transition-colors p-0.5"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    <AnimatedEye show={showConfirm} isBlinking={isBlinkingConfirm} mouseOffset={mouseOffsetConfirm} />
                  </button>
                </div>
              </div>
              {error && (
                <p className="text-red-500 text-[12px] mt-0.5 font-medium">{error}</p>
              )}
              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="h-[48px] w-full rounded-[12px] bg-[#1C2C1C] text-[15px] font-bold text-white shadow-sm transition-all hover:bg-[#121E12] hover:shadow-md cursor-pointer mt-1"
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </form>
            {/* BACK TO PROFILE LINK */}
            <div className="text-center mt-4">
              <p className="text-[13px] text-[#1C2C1C]/60 font-medium">
                Back to <Link href="/" className="text-[#1C2C1C] font-extrabold hover:underline">Home</Link>
              </p>
            </div>
          </div>
        </div>
        {/* RIGHT SECTION – HERO */}
        <div className="relative hidden w-full lg:w-[45%] xl:w-[739px] lg:h-auto lg:self-stretch xl:h-[1004px] overflow-hidden lg:block flex-shrink-0 z-0">
          <Image src="/signupframe.png" alt="Change password illustration" fill className="object-cover object-center" priority unoptimized style={{ opacity: 1 }} />
          <div className="absolute inset-0 bg-[#162716]/65 mix-blend-multiply z-10" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 xl:p-20 text-white z-20" style={{ background: 'linear-gradient(to top, rgba(22, 39, 22, 0.95) 0%, rgba(22, 39, 22, 0.4) 60%, transparent 100%)' }}>
            <div className="w-full max-w-[576px] h-auto lg:h-[439.73px] max-h-[90%] flex flex-col justify-end text-white" style={{ gap: '23.2px', opacity: 1 }}>
              <div className="flex items-center gap-2.5 mb-1 animate-fade-in flex-shrink-0">
                <div className="w-6 h-[2px] bg-[#6E9625] rounded-full" />
                <span className="text-[#6E9625] text-[10px] sm:text-[11px] font-extrabold tracking-[0.2em] uppercase">SECURE ACCOUNT ACCESS</span>
              </div>
              <h2 className="text-[32px] sm:text-[40px] lg:text-[38px] xl:text-[52px] font-bold leading-[1.1] tracking-tight text-white animate-slide-up" style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
                Keep Your Account Safe
              </h2>
              <p className="text-[14px] sm:text-[15px] lg:text-[16px] font-medium leading-relaxed text-white/80 animate-fade-in">
                Change your password regularly to protect your personal information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
