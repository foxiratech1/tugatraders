"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi, traderRegister, resendOtp } from "@/app/api/authApi";
import { AnimatedEye } from "@/app/ui/AnimatedEye";
import { setTokens, setUser } from "@/utils/auth";
import PublicGuard from "@/components/Guards/PublicGuard";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { getFcmToken, prefetchFcmToken } from "@/utils/firebase";
import PlacesAutocompleteInput from "@/components/common/PlacesAutocompleteInput";

// ─── Trade Categories (COMMENTED OUT) ────────────────────────────────────────
// // Trade categories will be loaded from the API
// const TRADE_CATEGORIES: Array<{ id: string; name: string }> = []; // placeholder, will be replaced by state

// ─── ChevronDown Icon ─────────────────────────────────────────────────────────
const ChevronDown = () => (
  <svg
    className="w-4 h-4 pointer-events-none"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ─── Password Validation Helper ───────────────────────────────────────────────
const getPasswordError = (pass: string) => {
  const missing = [];
  if (pass.length < 8 || pass.length > 64) missing.push("Minimum 8 characters");
  if (!/[A-Z]/.test(pass)) missing.push("1 uppercase letter");
  if (!/[a-z]/.test(pass)) missing.push("1 lowercase letter");
  if (!/[0-9]/.test(pass)) missing.push("1 number");
  if (!/[^A-Za-z0-9]/.test(pass)) missing.push("1 special character");

  if (missing.length === 0) return undefined;

  if (missing.length === 5) {
    return "Minimum 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.";
  }

  const hasMin = missing[0] === "Minimum 8 characters";
  const reqs = hasMin ? missing.slice(1) : missing;

  let msg = hasMin ? "Minimum 8 characters" : "Requires";

  if (reqs.length > 0) {
    msg += hasMin ? ", including " : " ";
    if (reqs.length === 1) {
      msg += reqs[0];
    } else if (reqs.length === 2) {
      msg += `${reqs[0]} and ${reqs[1]}`;
    } else {
      msg += `${reqs.slice(0, -1).join(", ")}, and ${reqs[reqs.length - 1]}`;
    }
  }
  return msg + ".";
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TraderSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    businessEmail: "",
    contactNumber: "",
    location: "",
    workRadius: "25",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch trade categories on mount
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
        setLocation({
          latitude: null,
          longitude: null,
        });
      }
    );
  }, []);

  useEffect(() => {
    prefetchFcmToken();
  }, []);

  const [errors, setErrors] = useState<{
    fullName?: string;
    businessEmail?: string;
    contactNumber?: string;
    location?: string;
    password?: string;
    confirmPassword?: string;
    agreeTerms?: string;
  }>({});

  // ── Animated particles (subtle floating dots on right panel) ────────────────
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 1 + Math.random() * 2,
      dx: (Math.random() - 0.5) * 0.35,
      dy: -0.2 - Math.random() * 0.3,
      alpha: 0.2 + Math.random() * 0.35,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(110, 150, 37, ${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // ── Validation & Submit ─────────────────────────────────────────────────────
  const validate = () => {
    const e: typeof errors = {};
    if (!formData.fullName.trim()) e.fullName = "Full name is required";
    if (!formData.businessEmail) e.businessEmail = "Business email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail))
      e.businessEmail = "Please enter a valid email address";
    const phoneDigits = formData.contactNumber.replace(/\D/g, "");
    if (!formData.contactNumber.trim()) {
      e.contactNumber = "Contact number is required";
    } else if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      e.contactNumber = "Please enter a valid contact number";
    }
    if (!formData.location.trim()) e.location = "Location is required";
    if (!formData.password) {
      e.password = "Password is required";
    } else {
      const passErr = getPasswordError(formData.password);
      if (passErr) e.password = passErr;
    }

    if (!formData.confirmPassword) {
      e.confirmPassword = "Confirm password is required";
    } else if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      e.confirmPassword = "Passwords do not match";
    }
    if (!formData.agreeTerms) e.agreeTerms = "You must agree to the Terms of Service";
    return e;
  };

  const field = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
    setFormData((p) => {
      const next = { ...p, [key]: value };
      setErrors((errs) => {
        const nextErrs = { ...errs, [key]: undefined };

        if (key === "password") {
          const pass = value as string;
          const passErr = getPasswordError(pass);

          if (passErr && errs.password) {
            nextErrs.password = passErr;
          } else if (!passErr) {
            nextErrs.password = undefined;
          }
        }

        if (key === "password" || key === "confirmPassword") {
          if (next.password && next.confirmPassword && next.password !== next.confirmPassword) {
            nextErrs.confirmPassword = "Passwords do not match";
          } else if (next.password && next.confirmPassword && next.password === next.confirmPassword) {
            nextErrs.confirmPassword = undefined;
          }
        }
        return nextErrs;
      });
      return next;
    });
  };

  const isFormFilled =
    Boolean(formData.fullName.trim()) &&
    Boolean(formData.businessEmail.trim()) &&
    Boolean(formData.contactNumber.trim()) &&
    Boolean(formData.location.trim()) &&
    Boolean(formData.password) &&
    Boolean(formData.confirmPassword) &&
    Boolean(formData.agreeTerms);

  const isSubmitting = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting.current) return;

    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isSubmitting.current = false;
      return;
    }

    setErrors({});
    setLoading(true);
    isSubmitting.current = true;
    try {
      const fcmToken = await getFcmToken();
      const payload = {
        fullName: formData.fullName,
        email: formData.businessEmail,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        workRadius: Number(formData.workRadius) || 25,
        latitude: location.latitude || 38.7223,
        longitude: location.longitude || -9.1393,
        isCheckedTermsCondition: formData.agreeTerms,
        contactNumber: formData.contactNumber,
        location: formData.location,
        ...(fcmToken ? { fcmToken } : {}),
      };
      console.log('Submitting payload:', payload);
      const res = await traderRegister(payload);

      // Save token if returned
      if (res) {
        const token = res.accessToken || res.access_token || res.token || res.data?.accessToken || res.data?.token;
        const refreshToken = res.refreshToken || res.refresh_token || res.data?.refreshToken;
        if (token) {
          setTokens(token, refreshToken);
          setUser(res.user || res.data?.user || res);
        }
      }

      toast.success("Trader account created! Please verify your email.");
      router.replace(`/auth/verify-otp?email=${encodeURIComponent(formData.businessEmail)}`);
    } catch (err: any) {
      let msg = "An unexpected error occurred";

      if (err.response?.data?.message) {
        msg = Array.isArray(err.response.data.message)
          ? err.response.data.message[0]
          : err.response.data.message;
      } else if (err.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err.message) {
        msg = err.message;
      }

      // Deduplicate repeating error messages joined by comma
      const parts = msg.split(", ");
      const unique = Array.from(new Set(parts)).join(", ");
      toast.error(unique || msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Input class helper ──────────────────────────────────────────────────────
  const inputCls = (err?: string) =>
    `h-[44px] w-full rounded-[10px] border bg-[#FAFAFA] sm:bg-white px-3.5 text-[14px] text-[#1C2C1C] placeholder-[#9CA3AF] outline-none transition-all font-normal ${err
      ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400"
      : "border-[#E5E7EB] focus:border-[#6E9625] focus:bg-white focus:ring-1 focus:ring-[#6E9625]"
    }`;

  return (
    <PublicGuard>
      <main className="flex min-h-screen w-full items-center justify-center bg-[#F0EDE8] font-sans antialiased">
        <div className="flex w-full min-h-screen overflow-hidden bg-[#F0EDE8] relative flex-col lg:flex-row">

          {/* ══════════════ LEFT — FORM ══════════════ */}
          <div className="flex flex-1 flex-col justify-center items-center px-4 py-10 sm:px-8 xl:px-16 bg-[#F0EDE8] z-10 relative">

            {/* Card */}
            <div className="mx-auto w-full max-w-[460px] bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_12px_48px_rgba(36,58,36,0.06)] border border-[#E5E7EB] flex flex-col gap-4">

              {/* Logo */}
              <div className="mb-1">
                <Link href="/" className="inline-block">
                  <Image src="/TugaLogo.png" alt="TugaTrades Logo" width={170} height={38} className="object-contain" />
                </Link>
              </div>

              {/* Headings */}
              <div>
                <h1
                  className="text-[23px] sm:text-[25px] font-bold text-[#1C2C1C] tracking-tight leading-tight mb-1"
                  style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                >
                  Trader Registration
                </h1>
                <p className="text-[13px] sm:text-[13.5px] text-[#6B7280] font-normal">
                  Join our network of vetted tradespeople
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

                {/* 1. Full Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    placeholder="Andrew Stalne"
                    value={formData.fullName}
                    onChange={(e) => field("fullName", e.target.value)}
                    className={inputCls(errors.fullName)}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-[11px] font-medium">{errors.fullName}</p>
                  )}
                </div>

                {/* 2. Business Email */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                    BUSINESS EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    placeholder="andrew@gmail.com"
                    value={formData.businessEmail}
                    onChange={(e) => field("businessEmail", e.target.value)}
                    className={inputCls(errors.businessEmail)}
                  />
                  {errors.businessEmail && (
                    <p className="text-red-500 text-[11px] font-medium">{errors.businessEmail}</p>
                  )}
                </div>

                {/* 3. Contact Number */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                    CONTACT NUMBER
                  </label>

                  <PhoneInput
                    defaultCountry="pt"
                    value={formData.contactNumber}
                    onChange={(phone) => field("contactNumber", phone)}
                    inputClassName="!h-[44px] !w-full !rounded-r-[10px] !border-l-0 !text-[14px] !text-[#1C2C1C] !font-normal !placeholder-[#9CA3AF] !outline-none !bg-white"
                    countrySelectorStyleProps={{
                      buttonClassName: "!h-[44px] !rounded-l-[10px] !border-[#E5E7EB] !bg-white !px-3 hover:!bg-[#F9FAFB]",
                    }}
                    className={`w-full rounded-[10px] border transition-all ${
                      errors.contactNumber
                        ? "border-red-400 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-400"
                        : "border-[#E5E7EB] focus-within:border-[#6E9625] focus-within:ring-1 focus-within:ring-[#6E9625]"
                    }`}
                  />

                  {errors.contactNumber && (
                    <p className="text-red-500 text-[11px] font-medium">
                      {errors.contactNumber}
                    </p>
                  )}
                </div>

                {/* 4. Location */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                    LOCATION
                  </label>
                  <PlacesAutocompleteInput
                    placeholder="Town / Postcode"
                    value={formData.location}
                    onChange={(val) => field("location", val)}
                    onPlaceSelect={(place) => {
                      if (place?.latitude && place?.longitude) {
                        setLocation({
                          latitude: place.latitude,
                          longitude: place.longitude,
                        });
                      }
                    }}
                    className="w-full sm:w-[50%] max-w-[220px]"
                    inputClassName={`h-[44px] w-full rounded-[10px] border bg-[#FAFAFA] sm:bg-white px-3.5 text-[14px] text-[#1C2C1C] placeholder-[#9CA3AF] outline-none transition-all font-normal ${
                      errors.location
                        ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400"
                        : "border-[#E5E7EB] focus:border-[#6E9625] focus:bg-white focus:ring-1 focus:ring-[#6E9625]"
                    }`}
                  />
                  {errors.location && (
                    <p className="text-red-500 text-[11px] font-medium">{errors.location}</p>
                  )}
                </div>

                {/* 5. Password & Confirm Password */}
                <div className="grid grid-cols-2 gap-3 relative">
                  <div className="flex flex-col gap-1 relative">
                    <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                      PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => field("password", e.target.value)}
                        className={`h-[44px] w-full rounded-[10px] border bg-[#FAFAFA] sm:bg-white pl-3.5 pr-10 text-[14px] text-[#1C2C1C] placeholder-[#9CA3AF] outline-none transition-all font-normal ${
                          errors.password
                            ? "border-red-400 focus:border-red-500"
                            : "border-[#E5E7EB] focus:border-[#6E9625] focus:bg-white"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-[#9CA3AF] hover:text-[#1C2C1C]"
                      >
                        <AnimatedEye show={showPassword} isBlinking={false} mouseOffset={{ x: 0, y: 0 }} />
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-[11px] font-medium">{errors.password}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 relative">
                    <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
                      CONFIRM PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => field("confirmPassword", e.target.value)}
                        className={`h-[44px] w-full rounded-[10px] border bg-[#FAFAFA] sm:bg-white pl-3.5 pr-10 text-[14px] text-[#1C2C1C] placeholder-[#9CA3AF] outline-none transition-all font-normal ${
                          errors.confirmPassword
                            ? "border-red-400 focus:border-red-500"
                            : "border-[#E5E7EB] focus:border-[#6E9625] focus:bg-white"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-[#9CA3AF] hover:text-[#1C2C1C]"
                      >
                        <AnimatedEye show={showConfirmPassword} isBlinking={false} mouseOffset={{ x: 0, y: 0 }} />
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-[11px] font-medium">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* 6. Terms */}
                <div
                  className="flex items-center gap-2.5 cursor-pointer select-none group mt-1"
                  onClick={() => field("agreeTerms", !formData.agreeTerms)}
                >
                  <div
                    className={`w-[17px] h-[17px] rounded-[4px] border flex items-center justify-center flex-shrink-0 transition-all ${
                      formData.agreeTerms
                        ? "bg-[#1C2C1C] border-[#1C2C1C]"
                        : errors.agreeTerms
                          ? "border-red-400 bg-red-50"
                          : "border-[#D1D5DB] bg-white group-hover:border-[#1C2C1C]"
                    }`}
                  >
                    {formData.agreeTerms && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <p className="text-[12px] text-[#4B5563] font-normal leading-tight">
                    I agree to the{" "}
                    <Link href="/terms" className="font-bold text-[#1C2C1C] hover:underline" onClick={(e) => e.stopPropagation()}>
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/terms?tab=cookies" className="font-bold text-[#1C2C1C] hover:underline" onClick={(e) => e.stopPropagation()}>
                      Privacy Policy
                    </Link>
                  </p>
                </div>

                {/* 7. Submit */}
                <button
                  type="submit"
                  disabled={loading || !isFormFilled}
                  className={`h-[46px] w-full rounded-[10px] text-[15px] font-bold transition-all mt-2 cursor-pointer ${
                    isFormFilled
                      ? "bg-[#1C2C1C] hover:bg-[#2C4A2C] text-white shadow-sm"
                      : "bg-[#B4BCB2] text-white cursor-not-allowed"
                  }`}
                >
                  {loading ? "Creating Account…" : "Create Account"}
                </button>
              </form>

              {/* 8. Login link */}
              <div className="text-center mt-1">
                <p className="text-[12.5px] text-[#4B5563] font-normal">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-[#1C2C1C] font-bold hover:underline">
                    Log in
                  </Link>
                </p>
              </div>
            </div>

            {/* Bottom badges */}
            <div className="mt-7 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[#6E962514] text-[#6E9625]">
                  <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-[10.5px] font-bold text-[#1C2C1C]/45 uppercase tracking-wider">Secure data encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[#6E962514] text-[#6E9625]">
                  <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="text-[10.5px] font-bold text-[#1C2C1C]/45 uppercase tracking-wider">24/7 Priority support</span>
              </div>
            </div>
          </div>

          {/* ══════════════ RIGHT — HERO ══════════════ */}
          <div className="relative hidden w-full lg:w-[50%] lg:h-auto lg:self-stretch min-h-screen overflow-hidden lg:flex flex-col flex-shrink-0 z-0">

            {/* Background photo */}
            <Image
              src="/traderimage.jfif"
              alt="Professional tradesperson at work"
              fill
              className="object-cover object-center"
              priority
              unoptimized
            />

            {/* Slight green overlay */}
            <div className="absolute inset-0 bg-[#6E9625]/20 z-10" />

            {/* Animated canvas particles */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-20 pointer-events-none" />

            {/* Gradient fade from bottom */}
            <div
              className="absolute inset-0 z-30 flex flex-col justify-end p-10 xl:p-16 text-white"
              style={{
                background:
                  "linear-gradient(to top, rgba(22,39,22,0.97) 0%, rgba(22,39,22,0.45) 55%, transparent 100%)",
              }}
            >
              <div className="w-full max-w-[520px] flex flex-col gap-5">

                {/* Badge */}
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-[2px] bg-[#6E9625] rounded-full" />
                  <span className="text-[#6E9625] text-[10.5px] font-extrabold tracking-[0.22em] uppercase">
                    Trusted by Thousands

                  </span>
                </div>

                {/* Headline */}
                <h2
                  className="text-[36px] lg:text-[42px] xl:text-[50px] font-bold leading-[1.1] tracking-tight text-white"
                  style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                >
                  The smarter way to win new business.
                </h2>

                {/* Sub copy */}
                <p className="text-[14px] lg:text-[15px] font-medium leading-relaxed text-white/75">
                  Receive quality job leads, connect with local customers, and grow your business. One trusted platform. Built for homeowners, businesses and Tradespeople.

                </p>

                {/* Container.png social proof widget */}
                <div className="mt-2">
                  <Image
                    src="/Container.png"
                    alt="4.9/5 Rating · 12,400+ Active Experts"
                    width={220}
                    height={56}
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </PublicGuard>
  );
}
