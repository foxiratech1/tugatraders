// app/auth/forgot-password/reset/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { authApi } from "@/app/api/authApi";
import { AnimatedEye } from "@/app/ui/AnimatedEye";
import { useAnimatedEye } from "@/app/hooks/useAnimatedEye";

function ResetPasswordContent() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const resetToken = searchParams.get("resetToken") ?? "";

 const [password, setPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [error, setError] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);

 const [showNewPassword, setShowNewPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);

 // Shared eye logic for each password field
 const { isBlinking: isBlinkingNew, mouseOffset: mouseOffsetNew, eyeRef: eyeNewRef } = useAnimatedEye();
 const { isBlinking: isBlinkingConfirm, mouseOffset: mouseOffsetConfirm, eyeRef: eyeConfirmRef } = useAnimatedEye();

 // (Password strength validation removed – only mismatch validation is applied)

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 // Basic presence validation
 if (!password) {
 setError("Password is required");
 return;
 }
 // (Removed strong password validation – only mismatch check remains)
 // Confirm match validation
 if (password !== confirmPassword) {
 setError("Passwords do not match");
 return;
 }
 setError(null);
 setLoading(true);
 try {
 await authApi.resetPassword({ resetToken, password, confirmPassword });
 toast.success("Password reset successful. You can now log in.");
 router.push("/auth/login");
 } catch (err: any) {
 const msg = err.response?.data?.message?.[0] || err.response?.data?.error || "Failed to reset password";
 toast.error(msg);
 } finally {
 setLoading(false);
 }
 };

 return (
 <main className="flex min-h-screen w-full items-center justify-center bg-[#F8F9F5] font-sans antialiased">
 <div className="flex w-full min-h-screen lg:min-h-screen overflow-hidden bg-[#F8F9F5] relative flex-col lg:flex-row">
 {/* LEFT SECTION */}
 <div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8 xl:px-12 relative overflow-y-auto z-10 bg-[#F8F9F5]">
 <div className="mx-auto w-full max-w-[450px] bg-white rounded-[28px] p-6 sm:p-8 md:p-10 shadow-[0_8px_40px_rgba(36,58,36,0.03)] border border-[#243A240A] flex flex-col gap-[20px]">
 {/* LOGO */}
 <Link href="/">
 <Image src="/logo.png" alt="Logo" width={177} height={40} className="object-contain" />
 </Link>
 <h1 className="text-[28px] font-bold text-[#1C2C1C]">Reset Password</h1>
 <p className="text-[13px] sm:text-[13.5px] text-[#1C2C1C]/60 font-medium">
 Set a new password for your account.
 </p>

 <form onSubmit={handleSubmit} className="flex flex-col gap-[16px] mt-6">
 {/* NEW PASSWORD */}
 <div className="flex flex-col gap-1.5">
 <label className="text-[12px] font-extrabold text-[#1C2C1C] uppercase tracking-wider">New Password</label>
 <div className="relative">
 <input
 type={showNewPassword ? "text" : "password"}
 placeholder="New password"
 value={password}
 onChange={(e) => {
 setPassword(e.target.value);
 if (error) setError(null);
 }}
 className={`h-[44px] w-full rounded-[12px] border bg-white px-4 pr-10 text-[14px] text-[#1C2C1C] placeholder-[#1C2C1C]/30 outline-none transition-all font-medium ${error ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-[#243A241F] focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625]"}`}
 />
 <button
 ref={eyeNewRef}
 type="button"
 onClick={() => setShowNewPassword(!showNewPassword)}
 className="group absolute right-3 top-1/2 -translate-y-1/2 text-[#1C2C1C]/40 hover:text-[#1C2C1C] transition-colors p-0.5"
 aria-label={showNewPassword ? "Hide password" : "Show password"}
 >
 <AnimatedEye show={showNewPassword} isBlinking={isBlinkingNew} mouseOffset={mouseOffsetNew} />
 </button>
 </div>
 </div>
 {/* CONFIRM PASSWORD */}
 <div className="flex flex-col gap-1.5">
 <label className="text-[12px] font-extrabold text-[#1C2C1C] uppercase tracking-wider">Confirm Password</label>
 <div className="relative">
 <input
 type={showConfirmPassword ? "text" : "password"}
 placeholder="Confirm password"
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
 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
 className="group absolute right-3 top-1/2 -translate-y-1/2 text-[#1C2C1C]/40 hover:text-[#1C2C1C] transition-colors p-0.5"
 aria-label={showConfirmPassword ? "Hide password" : "Show password"}
 >
 <AnimatedEye show={showConfirmPassword} isBlinking={isBlinkingConfirm} mouseOffset={mouseOffsetConfirm} />
 </button>
 </div>
 </div>
 {error && <p className="text-[12px] text-red-500 -mt-2">{error}</p>}
 {/* SUBMIT */}
 <button
 type="submit"
 disabled={loading}
 className="h-[48px] w-full rounded-[12px] bg-[#1C2C1C] text-[15px] font-bold text-white shadow-sm transition-all hover:bg-[#121E12] hover:shadow-md cursor-pointer mt-1"
 >
 {loading ? "Resetting..." : "Reset Password"}
 </button>
 </form>
 {/* LOGIN LINK */}
 <div className="text-center mt-4">
 <p className="text-[13px] text-[#1C2C1C]/60 font-medium">
 Remember your password? <Link href="/auth/login" className="text-[#1C2C1C] font-extrabold hover:underline">Log in</Link>
 </p>
 </div>
 </div>
 </div>
 {/* RIGHT SECTION (Hero) */}
 <div className="relative hidden w-full lg:w-[50%] lg:h-auto lg:self-stretch overflow-hidden lg:block flex-shrink-0 z-0">
 <Image src="/signupframe.png" alt="Reset password illustration" fill className="object-cover object-center" priority unoptimized style={{ opacity: 1 }} />
 <div className="absolute inset-0 bg-[#162716]/65 mix-blend-multiply z-10" />
 <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 xl:p-20 text-white z-20" style={{ background: 'linear-gradient(to top, rgba(22, 39, 22, 0.95) 0%, rgba(22, 39, 22, 0.4) 60%, transparent 100%)' }}>
 <div className="w-full max-w-[576px] h-auto lg:h-[439.73px] max-h-[90%] flex flex-col justify-end text-white" style={{ gap: '23.2px', opacity: 1 }}>
 <div className="flex items-center gap-2.5 mb-1 animate-fade-in flex-shrink-0">
 <div className="w-6 h-[2px] bg-[#6E9625] rounded-full" />
 <span className="text-[#6E9625] text-[10px] sm:text-[11px] font-extrabold tracking-[0.2em] uppercase">SECURE ACCOUNT ACCESS</span>
 </div>
 <h2 className="text-[32px] sm:text-[40px] lg:text-[38px] xl:text-[52px] font-bold leading-[1.1] tracking-tight text-white animate-slide-up" style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
 Secure Your Account
 </h2>
 <p className="text-[14px] sm:text-[15px] lg:text-[16px] font-medium leading-relaxed text-white/80 animate-fade-in">
 Choose a strong password to keep your account safe.
 </p>
 </div>
 </div>
 </div>
 </div>
 </main>
 );
}

export default function ResetPasswordPage() {
 return (
 <React.Suspense fallback={
 <main className="flex min-h-screen w-full items-center justify-center bg-[#F8F9F5] font-sans antialiased">
 <div className="text-[14px] text-gray-500">Loading...</div>
 </main>
 }>
 <ResetPasswordContent />
 </React.Suspense>
 );
}
