"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi, resendOtp } from "@/app/api/authApi";
import { setTokens, setUser } from "@/utils/auth";
import PublicGuard from "@/components/Guards/PublicGuard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Animated Eye ────────────────────────────────────────────────────────────
const AnimatedEye = ({
    show,
    isBlinking,
    mouseOffset,
}: {
    show: boolean;
    isBlinking: boolean;
    mouseOffset: { x: number; y: number };
}) => {
    const isClosed = !show || isBlinking;

    const upperLidOpen = "M1 12C1 12 5 4 12 4C19 4 23 12 23 12";
    const lowerLidOpen = "M1 12C1 12 5 20 12 20C19 20 23 12 23 12";
    const closedLid = "M4 10C4 10 8 16 12 16C16 16 20 10 20 10";

    return (
        <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            className="transition-all duration-300 overflow-visible"
        >
            <defs>
                <clipPath id="eye-ball-clip">
                    <path d={upperLidOpen + " " + lowerLidOpen} />
                </clipPath>
            </defs>

            <path
                d={isClosed ? closedLid : upperLidOpen}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300 ease-in-out"
            />

            <path
                d={isClosed ? closedLid : lowerLidOpen}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-all duration-300 ease-in-out ${isClosed ? "opacity-0" : "opacity-100"
                    }`}
            />

            <g
                clipPath="url(#eye-ball-clip)"
                className={`transition-all duration-300 ${isClosed ? "opacity-0" : "opacity-100"
                    }`}
            >
                <circle
                    cx={12 + mouseOffset.x}
                    cy={12 + mouseOffset.y}
                    r="3.5"
                    fill="currentColor"
                    className="transition-transform duration-150 ease-out"
                />
            </g>
        </svg>
    );
};
// ─────────────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        // phoneNumber: "",
        password: "",
        confirmPassword: "",
        agreeTerms: false,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ fullName?: string; email?: string; phoneNumber?: string; password?: string; confirmPassword?: string; agreeTerms?: string }>({});

    // Animated Eye state — one per password field
    const [isBlinking, setIsBlinking] = useState(false);
    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

    const [isBlinkingC, setIsBlinkingC] = useState(false);
    const [mouseOffsetC, setMouseOffsetC] = useState({ x: 0, y: 0 });

    const eyeBtnRef = useRef<HTMLButtonElement>(null);
    const eyeBtnRefC = useRef<HTMLButtonElement>(null);
    const isSubmitting = useRef(false);

    // Periodic random blink — password field
    useEffect(() => {
        const schedule = () => {
            const delay = 2000 + Math.random() * 4000;
            return setTimeout(() => {
                setIsBlinking(true);
                setTimeout(() => setIsBlinking(false), 150);
                t = schedule();
            }, delay);
        };
        let t = schedule();
        return () => clearTimeout(t);
    }, []);

    // Periodic random blink — confirm field (offset so they don't sync)
    useEffect(() => {
        const schedule = () => {
            const delay = 3000 + Math.random() * 4000;
            return setTimeout(() => {
                setIsBlinkingC(true);
                setTimeout(() => setIsBlinkingC(false), 150);
                t = schedule();
            }, delay);
        };
        let t = schedule();
        return () => clearTimeout(t);
    }, []);

    // Mouse-tracking pupil for both eyes
    useEffect(() => {
        const move = (e: MouseEvent) => {
            const track = (ref: React.RefObject<HTMLButtonElement | null>, setter: (v: { x: number; y: number }) => void) => {
                if (!ref.current) return;
                const rect = ref.current.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = e.clientX - cx;
                const dy = e.clientY - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const max = 2.5;
                setter({
                    x: dist === 0 ? 0 : (dx / dist) * Math.min(dist / 40, max),
                    y: dist === 0 ? 0 : (dy / dist) * Math.min(dist / 40, max),
                });
            };
            track(eyeBtnRef, setMouseOffset);
            track(eyeBtnRefC, setMouseOffsetC);
        };
        window.addEventListener("mousemove", move);
        return () => window.removeEventListener("mousemove", move);
    }, []);

    const isFormFilled =
        Boolean(formData.fullName.trim()) &&
        Boolean(formData.email.trim()) &&
        Boolean(formData.password) &&
        Boolean(formData.confirmPassword) &&
        Boolean(formData.agreeTerms);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting.current) return;

        const newErrors: { fullName?: string; email?: string; phoneNumber?: string; password?: string; confirmPassword?: string; agreeTerms?: string } = {};

        if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
        if (!formData.email) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Please enter a valid email address";

        let passwordComplexityError = "";
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (
            formData.password.length < 8 ||
            formData.password.length > 64 ||
            !/[A-Z]/.test(formData.password) ||
            !/[a-z]/.test(formData.password) ||
            !/[0-9]/.test(formData.password) ||
            !/[^A-Za-z0-9]/.test(formData.password)
        ) {
            passwordComplexityError = "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be between 8 and 64 characters long.";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Confirm password is required";
        } else if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        } else if (formData.confirmPassword.length < 6) {
            newErrors.confirmPassword = "Confirm password must be at least 6 characters";
        }
        if (!formData.agreeTerms) newErrors.agreeTerms = "You must agree to the Terms of Service";

        if (Object.keys(newErrors).length > 0 || passwordComplexityError) {
            setErrors(newErrors);

            if (newErrors.confirmPassword) {
                toast.error(newErrors.confirmPassword, { id: 'validation-error' });
            } else if (passwordComplexityError) {
                toast.error(passwordComplexityError, { id: 'validation-error' });
            } else {
                const firstErrorKey = Object.keys(newErrors)[0] as keyof typeof newErrors;
                toast.error(newErrors[firstErrorKey] || "Validation error", { id: 'validation-error' });
            }
            isSubmitting.current = false;
            return;
        }

        setErrors({});
        setLoading(true);
        isSubmitting.current = true;
        try {
            const result = await authApi.register({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                // phoneNumber: formData.phoneNumber,
                confirmPassword: formData.confirmPassword,
                isCheckedTermsCondition: formData.agreeTerms,
                latitude: 22.5530,
                longitude: 75.7569,
            });

            const resultData = result?.data || result;
            const accessToken = resultData?.accessToken || resultData?.access_token || resultData?.token || result?.accessToken;
            const refreshToken = resultData?.refreshToken || resultData?.refresh_token || result?.refreshToken;

            if (accessToken) {
                setTokens(accessToken, refreshToken);
                setUser(resultData?.user || resultData);
            }

            console.log(result);
            toast.success("Account created successfully! Please verify your email.");
            setTimeout(() => {
                router.replace(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}&redirectTo=${encodeURIComponent("/customer-dashboard/jobs")}`);
            }, 2000);
        } catch (error: any) {
            console.error(error);
            let msg = "An unexpected error occurred";

            if (error.response?.data?.message) {
                msg = Array.isArray(error.response.data.message)
                    ? error.response.data.message[0]
                    : error.response.data.message;
            } else if (error.response?.data?.error) {
                msg = error.response.data.error;
            } else if (error.message) {
                msg = error.message;
            }

            // Deduplicate repeating error messages joined by comma
            if (typeof msg === 'string') {
                msg = Array.from(new Set(msg.split(/,\s*(?=[A-Z])/))).join(', ');
            }

            setErrors({});
            if (msg.toLowerCase().includes("email already exists") || msg.toLowerCase().includes("email is already registered") || msg.toLowerCase().includes("already in use")) {
                toast.error("This email is already registered. Please log in.", { id: 'auth-error' });
            } else {
                toast.error(msg, { id: 'auth-error' });
            }
        } finally {
            setLoading(false);
            isSubmitting.current = false;
        }
    };

    const [location, setLocation] = useState({
        latitude: null as number | null,
        longitude: null as number | null,
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            console.log("Geolocation is not supported");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                console.warn("Location permission denied:", error);

                // Optional fallback values
                setLocation({
                    latitude: null,
                    longitude: null,
                });
            }
        );
    }, []);

    return (
        <PublicGuard>
            <main className="flex min-h-screen w-full items-center justify-center bg-[#F8F9F5] font-sans antialiased">
                {/* 1440px desktop frame container - dynamically scales and scrolls if height is constrained */}
                <div className="flex w-full min-h-screen lg:min-h-screen overflow-hidden bg-[#F8F9F5] relative flex-col lg:flex-row">

                    {/* ================= LEFT SECTION (FORM) ================= */}
                    <div className="flex flex-1 flex-col justify-between px-4 py-8 sm:px-6 sm:py-12 lg:px-8 xl:px-12 relative overflow-y-auto z-10 bg-[#F8F9F5]">

                        {/* Top spacer to assist vertical centering */}
                        <div className="hidden sm:block h-2" />

                        {/* SIGNUP CARD CONTAINER (width 450px for elegant mockup proportions, responsive padding) */}
                        <div className="mx-auto w-full max-w-[450px] bg-white rounded-[28px] p-6 sm:p-8 md:p-10 shadow-[0_8px_40px_rgba(36,58,36,0.03)] border border-[#243A240A] flex flex-col gap-[20px]">

                            {/* LOGO */}
                            <Link href="/">
                                <Image src="/TugaLogo.png" alt="Logo" width={177} height={40} className="object-contain" />
                            </Link>

                            {/* HEADINGS */}
                            <div>
                                <h1
                                    className="text-[24px] sm:text-[28px] font-bold text-[#1C2C1C] tracking-tight leading-tight mb-1.5"
                                    style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
                                >
                                    Create your account
                                </h1>
                                <p className="text-[13px] sm:text-[13.5px] text-[#1C2C1C]/60 font-medium">
                                    Access your account and manage your jobs easily
                                </p>
                            </div>

                            {/* FORM */}
                            <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">

                                {/* FULL NAME */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-extrabold text-[#1C2C1C] uppercase tracking-wider">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={(e) => {
                                            setFormData({ ...formData, fullName: e.target.value });
                                            if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                                        }}
                                        className={`h-[44px] w-full rounded-[12px] border bg-white px-4 text-[14px] text-[#1C2C1C] placeholder-[#1C2C1C]/30 outline-none transition-all font-medium ${errors.fullName
                                            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                            : "border-[#243A241F] focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625]"
                                            }`}
                                    />
                                    {errors.fullName && (
                                        <p className="text-red-500 text-[11.5px] font-medium mt-0.5">{errors.fullName}</p>
                                    )}
                                </div>

                                {/* EMAIL */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-extrabold text-[#1C2C1C] uppercase tracking-wider">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => {
                                            setFormData({ ...formData, email: e.target.value });
                                            if (errors.email) setErrors({ ...errors, email: undefined });
                                        }}
                                        className={`h-[44px] w-full rounded-[12px] border bg-white px-4 text-[14px] text-[#1C2C1C] placeholder-[#1C2C1C]/30 outline-none transition-all font-medium ${errors.email
                                            ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                            : "border-[#243A241F] focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625]"
                                            }`}
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-[11.5px] font-medium mt-0.5">{errors.email}</p>
                                    )}
                                </div>

                                {/* PHONE NUMBER */}
                                {/* <div className="flex flex-col gap-1.5">
 <label className="text-[12px] font-extrabold text-[#1C2C1C] uppercase tracking-wider">
 Phone Number
 </label>
 <input
 type="tel"
 inputMode="numeric"
 pattern="[0-9]*"
 maxLength={15}
 placeholder="555 123 4567"
 value={formData.phoneNumber}
 onChange={(e) => {
 const cleaned = e.target.value.replace(/\D/g, "").slice(0, 15);
 setFormData({ ...formData, phoneNumber: cleaned });
 if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: undefined });
 }}
 className={`h-[44px] w-full rounded-[12px] border bg-white px-4 text-[14px] text-[#1C2C1C] placeholder-[#1C2C1C]/30 outline-none transition-all font-medium ${
 errors.phoneNumber
 ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
 : "border-[#243A241F] focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625]"
 }`}
 />
 {errors.phoneNumber && (
 <p className="text-red-500 text-[11.5px] font-medium mt-0.5">
 {errors.phoneNumber}
 </p>
 )}
 </div> */}

                                {/* PASSWORDS GRID (Stacks vertically on small viewports) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-extrabold text-[#1C2C1C] uppercase tracking-wider">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={(e) => {
                                                    const pwd = e.target.value;
                                                    setFormData({ ...formData, password: pwd });
                                                    setErrors((prev) => {
                                                        const next = { ...prev, password: undefined };
                                                        if (pwd && formData.confirmPassword && pwd !== formData.confirmPassword) {
                                                            next.confirmPassword = "Passwords do not match";
                                                        } else if (pwd && formData.confirmPassword && pwd === formData.confirmPassword) {
                                                            next.confirmPassword = undefined;
                                                        }
                                                        return next;
                                                    });
                                                }}
                                                className={`h-[44px] w-full rounded-[12px] border bg-white px-4 pr-10 text-[14px] text-[#1C2C1C] placeholder-[#1C2C1C]/30 outline-none transition-all font-medium ${errors.password
                                                    ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                                    : "border-[#243A241F] focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625]"
                                                    }`}
                                            />
                                            <button
                                                ref={eyeBtnRef}
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="group absolute right-3 top-1/2 -translate-y-1/2 text-[#1C2C1C]/40 hover:text-[#1C2C1C] transition-colors p-0.5"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                            >
                                                <AnimatedEye show={showPassword} isBlinking={isBlinking} mouseOffset={mouseOffset} />
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-red-500 text-[11.5px] font-medium mt-0.5">{errors.password}</p>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[12px] font-extrabold text-[#1C2C1C] uppercase tracking-wider">
                                            Confirm
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={formData.confirmPassword}
                                                onChange={(e) => {
                                                    const confirmPwd = e.target.value;
                                                    setFormData({ ...formData, confirmPassword: confirmPwd });
                                                    setErrors((prev) => {
                                                        const next = { ...prev };
                                                        if (formData.password && confirmPwd && formData.password !== confirmPwd) {
                                                            next.confirmPassword = "Passwords do not match";
                                                        } else {
                                                            next.confirmPassword = undefined;
                                                        }
                                                        return next;
                                                    });
                                                }}
                                                className={`h-[44px] w-full rounded-[12px] border bg-white px-4 pr-10 text-[14px] text-[#1C2C1C] placeholder-[#1C2C1C]/30 outline-none transition-all font-medium ${errors.confirmPassword
                                                    ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                                    : "border-[#243A241F] focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625]"
                                                    }`}
                                            />
                                            <button
                                                ref={eyeBtnRefC}
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="group absolute right-3 top-1/2 -translate-y-1/2 text-[#1C2C1C]/40 hover:text-[#1C2C1C] transition-colors p-0.5"
                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            >
                                                <AnimatedEye show={showConfirmPassword} isBlinking={isBlinkingC} mouseOffset={mouseOffsetC} />
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="text-red-500 text-[11.5px] font-medium mt-0.5">{errors.confirmPassword}</p>
                                        )}
                                    </div>
                                </div>

                                {/* TERMS CHECKBOX */}
                                <div
                                    className="flex items-start gap-2.5 cursor-pointer select-none group mt-1"
                                    onClick={() => {
                                        setFormData({ ...formData, agreeTerms: !formData.agreeTerms });
                                        if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: undefined });
                                    }}
                                >
                                    <div
                                        className={`mt-0.5 w-[18px] h-[18px] rounded border flex items-center justify-center flex-shrink-0 transition-all ${formData.agreeTerms
                                            ? "bg-[#1C2C1C] border-[#1C2C1C]"
                                            : errors.agreeTerms
                                                ? "border-red-500 bg-red-50 group-hover:border-red-600"
                                                : "border-[#243A2429] bg-white group-hover:border-[#1C2C1C]/60"
                                            }`}
                                    >
                                        {formData.agreeTerms && (
                                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <p className="text-[11.5px] sm:text-[12px] text-[#1C2C1C]/70 font-medium leading-tight">
                                        I agree to the <span className="text-[#1C2C1C] font-extrabold hover:underline"><a href="/terms">Terms of Service</a></span> and <span className="text-[#1C2C1C] font-extrabold hover:underline"><a href="/terms">Privacy Policy</a></span>.
                                    </p>
                                </div>

                                {/* SUBMIT BUTTON */}
                                <button
                                    type="submit"
                                    disabled={loading || !isFormFilled}
                                    className={`h-[48px] w-full rounded-[12px] bg-[#1C2C1C] text-[15px] font-bold text-white shadow-sm transition-all mt-1 ${loading || !isFormFilled
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:bg-[#121E12] hover:shadow-md cursor-pointer"
                                        }`}
                                >
                                    {loading ? "Creating Account..." : "Create Account"}
                                </button>
                            </form>

                            {/* DIVIDER */}
                            <div className="flex items-center gap-4 my-0.5">
                                <div className="h-[1px] flex-1 bg-[#243A240D]" />
                                <span className="text-[10px] uppercase tracking-widest text-[#243A244D] font-extrabold">OR</span>
                                <div className="h-[1px] flex-1 bg-[#243A240D]" />
                            </div>

                            {/* SOCIAL BUTTONS */}
                            {/* <div className="grid grid-cols-2 gap-4">
                                <button className="flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#243A241A] bg-white text-[13px] font-bold text-[#1C2C1C] hover:bg-gray-50 transition-all cursor-pointer px-2">
                                    <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="google" width={16} height={16} />
                                    <span className="truncate">Google</span>
                                </button>
                                <button className="flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#243A241A] bg-white text-[13px] font-bold text-[#1C2C1C] hover:bg-gray-50 transition-all cursor-pointer px-2">
                                    <svg className="w-4 h-4 text-[#1C2C1C] fill-current flex-shrink-0" viewBox="0 0 384 512">
                                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 21.8-88.5 21.8-11.4 0-51.1-20.8-83.6-20.1-42.9.6-82.7 25-104.4 63.3-44.6 77-11.5 191.1 31.6 253.3 21 30.4 46.6 64.6 79.2 63.4 31.3-1.2 43.1-20.2 80.7-20.2 37.6 0 48.6 20.2 81.3 19.6 33.3-1 56.4-30.8 77.2-61.1 23.9-35.1 33.7-69.1 34-70.8-.8-.4-65.3-25.1-65.8-99.8zM288.9 71c15.6-18.9 26.2-45.2 23.3-71-23.5 1-52 15.6-68.9 35.3-15.1 17.5-28.2 44.5-24.7 69.8 26 2.1 53.7-14.9 70.3-34.1z" />
                                    </svg>
                                    <span className="truncate">Apple</span>
                                </button>
                            </div> */}

                            {/* LOGIN LINK */}
                            <div className="text-center mt-1">
                                <p className="text-[13px] text-[#1C2C1C]/60 font-medium">
                                    Already have an account? <Link href="/auth/login" className="text-[#1C2C1C] font-extrabold hover:underline">Log in</Link>
                                </p>
                            </div>

                        </div>

                        {/* BOTTOM SUPPORT/SECURITY BADGES (Stacks vertically on small viewports) */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[#6E962514] text-[#6E9625] flex-shrink-0">
                                    <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-bold text-[#1C2C1C]/50 uppercase tracking-wider">Secure data encryption</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[#6E962514] text-[#6E9625] flex-shrink-0">
                                    <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-bold text-[#1C2C1C]/50 uppercase tracking-wider">24/7 Priority support</span>
                            </div>
                        </div>

                    </div>

                    {/* ================= RIGHT SECTION — HERO (restricted to exactly 728px x 1004px on large screen, scales fluidly) ================= */}
                    <div className="relative hidden w-full lg:w-[50%] lg:h-auto lg:self-stretch min-h-screen overflow-hidden lg:block flex-shrink-0 z-0">
                        <Image
                            src="/CustomerSignUp.png"
                            alt="Find trusted professionals for every job"
                            fill
                            className="object-cover object-center"
                            priority
                            unoptimized
                            style={{ opacity: 1 }}
                        />

                        {/* Overlay Dark Green Tint Overlay */}
                        <div className="absolute inset-0 bg-[#162716]/65 mix-blend-multiply z-10" />

                        <div
                            className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 xl:p-20 text-white z-20"
                            style={{
                                background: 'linear-gradient(to top, rgba(22, 39, 22, 0.95) 0%, rgba(22, 39, 22, 0.4) 60%, transparent 100%)'
                            }}
                        >
                            {/* The Text Block Container (exact design box 576px wide, 439.73px high, dynamically shrinks to avoid parent clipping) */}
                            <div
                                className="w-full max-w-[576px] h-auto lg:h-[439.73px] max-h-[90%] flex flex-col justify-end text-white"
                                style={{
                                    gap: '23.2px',
                                    opacity: 1
                                }}
                            >
                                {/* Header Tag / Badge */}
                                <div className="flex items-center gap-2.5 mb-1 animate-fade-in flex-shrink-0">
                                    <div className="w-6 h-[2px] bg-[#6E9625] rounded-full" />
                                    <span className="text-[#6E9625] text-[10px] sm:text-[11px] font-extrabold tracking-[0.2em] uppercase">
                                        TRUSTED BY THOUSANDS
                                    </span>
                                </div>

                                {/* Headline */}
                                <h2
                                    className="text-[32px] sm:text-[40px] lg:text-[44px] xl:text-[44px] font-bold leading-[1.1] tracking-tight text-white animate-slide-up"
                                    style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
                                >
                                    Find trusted professionals, compare quotes, and hire with confidence.
                                </h2>

                                {/* Description */}
                                <p className="text-[14px] sm:text-[15px] lg:text-[16px] font-medium leading-relaxed text-white/80 animate-fade-in">
                                    Compare quotes, hire with confidence, and get your home projects done right by verified experts.
                                </p>

                                {/* Ratings & Active Experts Row */}
                                <div className="flex items-center justify-between border-t border-white/10 pt-6 sm:pt-8 w-full mt-2 flex-shrink-0">
                                    {/* Rating Column */}
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        {/* Overlapping Avatars */}
                                        <div className="flex -space-x-3 sm:-space-x-3.5">
                                            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#162716] overflow-hidden bg-[#162716] flex-shrink-0">
                                                <Image src="/avt1.png" alt="Expert Avatar 1" fill className="object-cover" />
                                            </div>
                                            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#162716] overflow-hidden bg-[#162716] flex-shrink-0">
                                                <Image src="/avt2.png" alt="Expert Avatar 2" fill className="object-cover" />
                                            </div>
                                        </div>

                                        <div className="flex flex-col">
                                            {/* 5 Green Stars */}
                                            <div className="flex items-center gap-0.5 text-[#6E9625] mb-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span className="text-white/80 text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase">
                                                4.9/5 Rating
                                            </span>
                                        </div>
                                    </div>

                                    {/* Vertical Separator */}
                                    <div className="h-8 sm:h-10 w-[1px] bg-white/15" />

                                    {/* Active Experts Column */}
                                    <div className="flex flex-col pr-4 sm:pr-8">
                                        <span className="text-white/40 text-[8px] sm:text-[9px] font-extrabold tracking-wider uppercase mb-1">
                                            ACTIVE EXPERTS
                                        </span>
                                        <span className="text-white text-[16px] sm:text-[20px] font-black leading-none tracking-tight">
                                            12,400+
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </main>
        </PublicGuard>
    );
}
