// app/auth/forgot-password/verify/page.tsx
"use client";

import React, { useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { authApi } from "@/app/api/authApi";

export default function VerifyForgotOtpPage() {
    return (
        <Suspense fallback={null}>
            <VerifyForgotOtpContent />
        </Suspense>
    );
}

function VerifyForgotOtpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") ?? "";
    const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
    const otpRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otp = otpDigits.join("");
        if (!otp || otp.length < 6) {
            setError("OTP is required");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const response = await authApi.verifyForgotOtp({ email, otp });
            const resetToken = response?.resetToken || response?.token || "";
            toast.success("OTP verified successfully. You can now set a new password.");
            router.push(`/auth/forgot-password/reset?email=${encodeURIComponent(email)}&resetToken=${encodeURIComponent(resetToken)}`);
        } catch (err: any) {
            const msg = err.response?.data?.message?.[0] || err.response?.data?.error || "Failed to verify OTP";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await authApi.resendForgotOtp({ email });
            toast.success("OTP resent to your email.");
        } catch (err: any) {
            toast.error("Failed to resend OTP.");
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
                        <h1 className="text-[28px] font-bold text-[#1C2C1C]">Verify OTP</h1>
                        <p className="text-[13px] sm:text-[13.5px] text-[#1C2C1C]/60 font-medium">
                            Enter the OTP sent to your email to verify your identity.
                        </p>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-[16px] mt-6">
                            {/* OTP Boxes */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-extrabold text-[#1C2C1C] uppercase tracking-wider">OTP</label>
                                <div className="flex gap-2">
                                    {otpDigits.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={otpRefs[idx]}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, "");
                                                const newDigits = [...otpDigits];
                                                newDigits[idx] = val;
                                                setOtpDigits(newDigits);
                                                if (val && idx < 5) {
                                                    otpRefs[idx + 1].current?.focus();
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) {
                                                    otpRefs[idx - 1].current?.focus();
                                                }
                                            }}
                                            className={`h-12 w-12 text-center text-[18px] border rounded ${error ? "border-red-500" : "border-[#243A241F] focus:border-[#6E9625]"}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            {/* SUBMIT */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="h-[48px] w-full rounded-[12px] bg-[#1C2C1C] text-[15px] font-bold text-white shadow-sm transition-all hover:bg-[#121E12] hover:shadow-md cursor-pointer mt-1"
                            >
                                {loading ? "Verifying..." : "Verify OTP"}
                            </button>
                        </form>
                        {/* RESEND LINK */}
                        <div className="text-center mt-3">
                            <button type="button" onClick={handleResend} className="text-[#6E9625] font-extrabold hover:underline">
                                Resend OTP
                            </button>
                        </div>
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
                    <Image src="/signupframe.png" alt="Verify OTP illustration" fill className="object-cover object-center" priority unoptimized style={{ opacity: 1 }} />
                    <div className="absolute inset-0 bg-[#162716]/65 mix-blend-multiply z-10" />
                    <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 xl:p-20 text-white z-20" style={{ background: 'linear-gradient(to top, rgba(22, 39, 22, 0.95) 0%, rgba(22, 39, 22, 0.4) 60%, transparent 100%)' }}>
                        <div className="w-full max-w-[576px] h-auto lg:h-[439.73px] max-h-[90%] flex flex-col justify-end text-white" style={{ gap: '23.2px', opacity: 1 }}>
                            <div className="flex items-center gap-2.5 mb-1 animate-fade-in flex-shrink-0">
                                <div className="w-6 h-[2px] bg-[#6E9625] rounded-full" />
                                <span className="text-[#6E9625] text-[10px] sm:text-[11px] font-extrabold tracking-[0.2em] uppercase">SECURE ACCOUNT ACCESS</span>
                            </div>
                            <h2 className="text-[32px] sm:text-[40px] lg:text-[38px] xl:text-[52px] font-bold leading-[1.1] tracking-tight text-white animate-slide-up" style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
                                Verify Your Identity
                            </h2>
                            <p className="text-[14px] sm:text-[15px] lg:text-[16px] font-medium leading-relaxed text-white/80 animate-fade-in">
                                Enter the OTP you received to securely reset your password.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
