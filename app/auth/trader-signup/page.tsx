"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi, traderRegister, resendOtp } from "@/app/api/authApi";
import { AnimatedEye } from "@/app/ui/AnimatedEye";
import { setTokens } from "@/utils/auth";

// ─── Trade Categories ─────────────────────────────────────────────────────────
// Trade categories will be loaded from the API
const TRADE_CATEGORIES: Array<{ id: string; name: string }> = []; // placeholder, will be replaced by state

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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TraderSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    tradeCategory: "",
    workRadius: "",
    baseLocation: "",
    fullName: "",
    businessEmail: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
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
    const loadCategories = async () => {
      try {
        const data = await authApi.getCategories();

        console.log("Categories API Response:", data);

        if (Array.isArray(data)) {
          console.log("Categories Array:", data);
          setCategories(data);
        } else if (data?.data && Array.isArray(data.data)) {
          console.log("Categories Data Array:", data.data);
          setCategories(data.data);
        } else {
          console.log("Unexpected Response Format:", data);
          setCategories([]);
        }
      } catch (err) {
        console.error("Categories API Error:", err);
        toast.error("Unable to load trade categories");
      }
    };

    loadCategories();
  }, []);
  const [errors, setErrors] = useState<{
    tradeCategory?: string;
    workRadius?: string;
    baseLocation?: string;
    fullName?: string;
    businessEmail?: string;
    contactNumber?: string;
    password?: string;
    confirmPassword?: string;
    // address?: string;
    // city?: string;
    // state?: string;
    // country?: string;
    // postalCode?: string;
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
    if (!formData.tradeCategory) e.tradeCategory = "Please select a trade category";
    if (!formData.fullName.trim()) e.fullName = "Full name is required";
    if (!formData.businessEmail) e.businessEmail = "Business email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail))
      e.businessEmail = "Please enter a valid email address";
    if (!formData.contactNumber.trim()) {
      e.contactNumber = "Contact number is required";
    } else if (!/^\d{8,15}$/.test(formData.contactNumber)) {
      e.contactNumber = "Please enter a valid contact number";
    }
    // Ensure contact number is numeric and limited to 15 digits
    if (formData.contactNumber && !/^\d+$/.test(formData.contactNumber)) e.contactNumber = "Contact number must contain only digits";
    if (formData.contactNumber && formData.contactNumber.length > 15) e.contactNumber = "Contact number must be at most 15 digits";
    if (!formData.password) e.password = "Password is required";
    if (!formData.confirmPassword) e.confirmPassword = "Confirm password is required";
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    // if (!formData.address.trim()) e.address = "Address is required";
    // if (!formData.city.trim()) e.city = "City is required";
    if (!formData.workRadius) e.workRadius = "Work radius is required";
    if (!formData.baseLocation) e.baseLocation = "Location is required";
    // if (!formData.address.trim()) e.address = "Address is required";
    // if (!formData.city.trim()) e.city = "City is required";
    // if (!formData.state.trim()) e.state = "State is required";
    // if (!formData.country.trim()) e.country = "Country is required";
    if (!formData.agreeTerms) e.agreeTerms = "You must agree to the Terms of Service";
    return e;
  };

  const field = (key: keyof typeof formData, value: string | boolean) => {
    setFormData((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.agreeTerms && Object.keys(newErrors).length === 1) {
        toast.error(newErrors.agreeTerms);
      }
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.businessEmail,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        tradeCategories: formData.tradeCategory ? [formData.tradeCategory] : [],
        workRadius: Number(formData.workRadius),
        // addressLine: formData.address,
        // city: formData.city,
        // state: formData.state,
        // country: formData.country,
        // postalCode: formData.postalCode,
        latitude: 23.5600000,
        longitude: 77.6200000,
        isCheckedTermsCondition: formData.agreeTerms,
        contactNumber: formData.contactNumber,
      };
      console.log('Submitting payload:', payload);
      const res = await traderRegister(payload);

      // Save token if returned
      if (res) {
        const token = res.accessToken || res.access_token || res.token || res.data?.accessToken || res.data?.token;
        const refreshToken = res.refreshToken || res.refresh_token || res.data?.refreshToken;
        if (token) {
          setTokens(token, refreshToken);
        }
      }

      toast.success("Trader account created! Please verify your email.");
      router.push(`/auth/trader-signup/verify-otp?email=${encodeURIComponent(formData.businessEmail)}&categoryId=${encodeURIComponent(formData.tradeCategory)}`);
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

      if (msg.toLowerCase().includes("email already exists") || msg.toLowerCase().includes("email is already registered")) {
        try {
          await resendOtp({ email: formData.businessEmail });
          toast.success("Please verify your email to continue.");
          router.push(`/auth/trader-signup/verify-otp?email=${encodeURIComponent(formData.businessEmail)}&categoryId=${encodeURIComponent(formData.tradeCategory)}`);
        } catch (err: any) {
          // If resend fails (e.g. already verified), just show the standard error
          setErrors((prev) => ({ ...prev, businessEmail: "This email is already registered. Please log in." }));
          toast.error("This email is already registered. Please log in.");
        }
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Input class helper ──────────────────────────────────────────────────────
  const inputCls = (err?: string) =>
    `h-[44px] w-full rounded-[12px] border bg-white px-4 text-[14px] text-[#1C2C1C] placeholder-[#1C2C1C]/30 outline-none transition-all font-medium ${err
      ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400"
      : "border-[#243A241F] focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625]"
    }`;

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#F0EDE8] font-sans antialiased">
      <div className="flex w-full min-h-screen overflow-hidden bg-[#F0EDE8] relative flex-col lg:flex-row">

        {/* ══════════════ LEFT — FORM ══════════════ */}
        <div className="flex flex-1 flex-col justify-center items-center px-4 py-10 sm:px-8 xl:px-16 bg-[#F0EDE8] z-10 relative">

          {/* Card */}
          <div className="mx-auto w-full max-w-[480px] bg-white rounded-[28px] p-7 sm:p-9 shadow-[0_12px_48px_rgba(36,58,36,0.07)] border border-[#243A240A] flex flex-col gap-[18px]">

            {/* Logo */}
            <Link href="/">
              <Image src="/logo.png" alt="TugaTrades Logo" width={177} height={40} className="object-contain" />
            </Link>

            {/* Headings */}
            <div>
              <h1
                className="text-[24px] sm:text-[26px] font-bold text-[#1C2C1C] tracking-tight leading-tight mb-1"
                style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
              >
                Trader Registration
              </h1>
              <p className="text-[13px] text-[#1C2C1C]/55 font-medium">
                Join our network of certified premium tradespeople.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">

              {/* Trade Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-extrabold text-[#1C2C1C]/70 uppercase tracking-wider">
                  Trade Category
                </label>
                <div className="relative">
                  <select
                    value={formData.tradeCategory}
                    onChange={(e) => field("tradeCategory", e.target.value)}
                    className={`${inputCls(errors.tradeCategory)} appearance-none pr-9 cursor-pointer bg-white`}
                  >
                    <option value="" disabled>
                      Select Trade Category
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#1C2C1C]/40">
                    <ChevronDown />
                  </span>
                </div>
                {errors.tradeCategory && (
                  <p className="text-red-500 text-[11px] font-medium">{errors.tradeCategory}</p>
                )}
              </div>

              {/* Work Radius + Base Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-extrabold text-[#1C2C1C]/70 uppercase tracking-wider">Work Radius</label>
                  <input
                    type="text"
                    placeholder="e.g. 25 miles"
                    value={formData.workRadius}
                    onChange={(e) => field("workRadius", e.target.value)}
                    className={inputCls(errors.workRadius)}
                  />
                  {errors.workRadius && (
                    <p className="text-red-500 text-[11px] font-medium">{errors.workRadius}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-extrabold text-[#1C2C1C]/70 uppercase tracking-wider">Location</label>
                  <input
                    type="text"
                    placeholder="Enter your location"
                    value={formData.baseLocation}
                    onChange={(e) => field("baseLocation", e.target.value)}
                    className={inputCls(errors.baseLocation)}
                  />
                  {errors.baseLocation && (
                    <p className="text-red-500 text-[11px] font-medium">{errors.baseLocation}</p>
                  )}
                </div>
              </div>
              {/* <div className="flex flex-col gap-1.5">
 <label className="text-[11.5px] font-extrabold text-[#1C2C1C]/70 uppercase tracking-wider">
 Base Location / Postcode
 </label>
 <input
 type="text"
 placeholder="AS2001"
 value={formData.postalCode}
 onChange={(e) => field("postalCode", e.target.value)}
 className={inputCls(errors.postalCode)}
 />
 </div> */}


              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-extrabold text-[#1C2C1C]/70 uppercase tracking-wider">
                  Full Name
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

              {/* Business Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-extrabold text-[#1C2C1C]/70 uppercase tracking-wider">
                  Business Email Address
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

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-2 gap-3 relative">
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-[11.5px] font-extrabold text-[#1C2C1C]/70 uppercase tracking-wider">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => field("password", e.target.value)}
                    className={inputCls(errors.password)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[46px] -translate-y-1/2 z-10">
                    <AnimatedEye show={showPassword} isBlinking={false} mouseOffset={{ x: 0, y: 0 }} />
                  </button>
                  {errors.password && (
                    <p className="text-red-500 text-[11px] font-medium">{errors.password}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-[11.5px] font-extrabold text-[#1C2C1C]/70 uppercase tracking-wider">Confirm Password</label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => field("confirmPassword", e.target.value)}
                    className={inputCls(errors.confirmPassword)}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[46px] -translate-y-1/2 z-10">
                    <AnimatedEye show={showConfirmPassword} isBlinking={false} mouseOffset={{ x: 0, y: 0 }} />
                  </button>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-[11px] font-medium">{errors.confirmPassword}</p>
                  )}
                </div>

              </div>

              {/* <div className="grid grid-cols-2 gap-3 mt-3">
 
 <div className="flex flex-col gap-1.5">
 <label className="text-[11.5px] font-extrabold text-[#1C2C1C]/70 uppercase tracking-wider">Address</label>
 <input
 type="text"
 placeholder="Address"
 value={formData.address}
 onChange={(e) => field("address", e.target.value)}
 className={inputCls(errors.address)}
 />
 {errors.address && (
 <p className="text-red-500 text-[11px] font-medium">{errors.address}</p>
 )}
 </div>
 
 <div className="flex flex-col gap-1.5">
 <label className="text-[11.5px] font-extrabold text-[#1C2C1C]/70 uppercase tracking-wider">City</label>
 <input
 type="text"
 placeholder="City"
 value={formData.city}
 onChange={(e) => field("city", e.target.value)}
 className={inputCls(errors.city)}
 />
 {errors.city && (
 <p className="text-red-500 text-[11px] font-medium">{errors.city}</p>
 )}
 </div>
 </div> */}

              {/* <div className="grid grid-cols-2 gap-3 mt-3">
 
 <div className="flex flex-col gap-1.5">
 <label className="text-[11.5px] font-extrabold text-[#1C2C1C]/70 uppercase tracking-wider">
 State
 </label>
 <input
 type="text"
 placeholder="State"
 value={formData.state}
 onChange={(e) => field("state", e.target.value)}
 className={inputCls(errors.state)}
 />
 {errors.state && (
 <p className="text-red-500 text-[11px] font-medium">{errors.state}</p>
 )}
 </div>
 
 <div className="flex flex-col gap-1.5">
 <label className="text-[11.5px] font-extrabold text-[#1C2C1C]/70 uppercase tracking-wider">
 Country
 </label>
 <input
 type="text"
 placeholder="Country"
 value={formData.country}
 onChange={(e) => field("country", e.target.value)}
 className={inputCls(errors.country)}
 />
 {errors.country && (
 <p className="text-red-500 text-[11px] font-medium">{errors.country}</p>
 )}
 </div>
 </div> */}

              {/* Contact Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] font-extrabold text-[#1C2C1C]/70 uppercase tracking-wider">
                  Contact Number
                </label>

                <input
                  type="tel"
                  placeholder="97112345678"
                  value={formData.contactNumber}
                  maxLength={15}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); // numbers only
                    field("contactNumber", value);
                  }}
                  className={inputCls(errors.contactNumber)}
                />

                {errors.contactNumber && (
                  <p className="text-red-500 text-[11px] font-medium">
                    {errors.contactNumber}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div
                className="flex items-start gap-2.5 cursor-pointer select-none group mt-0.5"
                onClick={() => field("agreeTerms", !formData.agreeTerms)}
              >
                <div
                  className={`mt-0.5 w-[17px] h-[17px] rounded border flex items-center justify-center flex-shrink-0 transition-all ${formData.agreeTerms
                    ? "bg-[#1C2C1C] border-[#1C2C1C]"
                    : errors.agreeTerms
                      ? "border-red-400 bg-red-50"
                      : "border-[#243A2429] bg-white group-hover:border-[#1C2C1C]/60"
                    }`}
                >
                  {formData.agreeTerms && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <p className="text-[11.5px] text-[#1C2C1C]/65 font-medium leading-tight">
                  I agree to the{" "}
                  <span className="text-[#1C2C1C] font-bold hover:underline">Terms of Service</span>{" "}
                  and{" "}
                  <span className="text-[#1C2C1C] font-bold hover:underline">Privacy Policy</span>
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="h-[48px] w-full rounded-[12px] bg-[#1C2C1C] text-[15px] font-bold text-white shadow-sm transition-all hover:bg-[#2C4A2C] hover:shadow-md cursor-pointer mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account…" : "Create Account"}
              </button>
            </form>

            {/* Login link */}
            <div className="text-center -mt-1">
              <p className="text-[12.5px] text-[#1C2C1C]/55 font-medium">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-[#1C2C1C] font-extrabold hover:underline">
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
            src="/trader-img.png"
            alt="Professional tradesperson at work"
            fill
            className="object-cover object-center"
            priority
            unoptimized
          />

          {/* Dark green overlay */}
          <div className="absolute inset-0 bg-[#162716]/60 mix-blend-multiply z-10" />

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
                Receive quality job leads, connect with local customers, and<br /> grow your business with a trusted platform built for tradespeople
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
  );
}
