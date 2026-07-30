"use client"

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { setTokens, getUserRole, setUser } from "@/utils/auth";
import { Role } from "@/utils/role";
import { authApi, getRegistrationStatus } from "@/app/api/authApi";
import PublicGuard from "@/components/Guards/PublicGuard";

// ─── Animated Eye ──────────────────────────────────────────────────────────────
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

      {/* Upper lid */}
      <path
        d={isClosed ? closedLid : upperLidOpen}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300 ease-in-out"
      />

      {/* Lower lid */}
      <path
        d={isClosed ? closedLid : lowerLidOpen}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-all duration-300 ease-in-out ${isClosed ? "opacity-0" : "opacity-100"}`}
      />

      {/* Pupil */}
      <g
        clipPath="url(#eye-ball-clip)"
        className={`transition-all duration-300 ${isClosed ? "opacity-0" : "opacity-100"}`}
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

function LoginContent({ role }: { role?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRole = role || searchParams.get("role") || "CUSTOMER";
  const redirectParam = searchParams.get("redirect");
  const traderIdParam = searchParams.get("traderId");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const [isBlinking, setIsBlinking] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const eyeBtnRef = useRef<HTMLButtonElement>(null);

  // Random blink effect
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 4000;
      return setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
        timer = scheduleBlink();
      }, delay);
    };
    let timer = scheduleBlink();
    return () => clearTimeout(timer);
  }, []);

  // Mouse-tracking for pupil
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!eyeBtnRef.current) return;
      const rect = eyeBtnRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const max = 2.5;
      setMouseOffset({
        x: dist === 0 ? 0 : (dx / dist) * Math.min(dist / 40, max),
        y: dist === 0 ? 0 : (dy / dist) * Math.min(dist / 40, max),
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Please enter a valid email address";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isLoading) return;

    setErrors({});
    setIsLoading(true);
    try {
      const data = await authApi.login({
        email, password
      });
      console.log("LOGIN RESPONSE:", data);

      const accessToken = data?.accessToken || data?.access_token || data?.token;
      const refreshToken = data?.refreshToken || data?.refresh_token;

      if (accessToken) {
        setTokens(accessToken, refreshToken);
        // Save the user data to localStorage so we know isEmailVerified instantly on other pages
        const userObj = data?.user || data?.data?.user || data?.data || data;
        setUser(userObj);
        console.log("ACCESS TOKEN:", accessToken);
        console.log(
          "LOCAL STORAGE TOKEN:",
          localStorage.getItem("accessToken")
        );
        const tokenRole = getUserRole();

        // Fallback to checking the data object directly if the token doesn't have it, and make it case-insensitive
        const roleStr = (tokenRole || data?.user?.role || data?.role || "").toString().toLowerCase();
        console.log("Detected user role:", roleStr);

        // Check EMAIL verification status (isEmailVerified)
        // Note: isVerified is a separate field for admin/profile verification — do NOT use it here
        let isEmailVerified = userObj?.isEmailVerified;

        if (isEmailVerified === undefined) {
          try {
            const profileRes = await authApi.getMyProfile();
            const pData = profileRes?.data || profileRes;
            isEmailVerified = pData?.isEmailVerified ?? true;
          } catch (e) {
            isEmailVerified = false; // If API fails, assume unverified
          }
        }

        if (isEmailVerified === false) {
          toast.error("Please verify your email to continue.");
          const targetRedirect = roleStr === Role.Customer.toLowerCase() ? "/customer-dashboard/jobs" : "";
          router.replace(`/auth/verify-otp?email=${encodeURIComponent(email)}${targetRedirect ? `&redirectTo=${encodeURIComponent(targetRedirect)}` : ""}`);
          return;
        }

        if (roleStr === Role.Trader.toLowerCase()) {
          toast.success("Trader login successfully");
        } else if (roleStr === Role.Customer.toLowerCase()) {
          toast.success("Customer Login successfully");
        } else if (roleStr === Role.Admin.toLowerCase()) {
          toast.success("Admin login successfully");
        } else {
          toast.success("Login successfully");
        }

        let targetPath = "/";

        if (redirectParam) {
          if (redirectParam === "leave-review" && traderIdParam) {
            if (roleStr === Role.Customer.toLowerCase()) {
              targetPath = `/customer-dashboard/leave-review?traderId=${traderIdParam}&reviewType=DIRECTORY`;
            } else {
              targetPath = `/common/leave-review?traderId=${traderIdParam}&reviewType=DIRECTORY`;
            }
          } else {
            targetPath = redirectParam;
          }
        } else if (roleStr === Role.Admin.toLowerCase()) {
          targetPath = "/admin";
        } else if (roleStr === Role.Trader.toLowerCase()) {
          try {
            // Check their registration status before letting them in
            const statusResponse = await getRegistrationStatus();

            // Extract data assuming it could be in statusResponse.data or just statusResponse
            const traderData = statusResponse?.data || statusResponse;
            const isCompleted = traderData?.isRegistrationCompleted;
            const step2Done = traderData?.step2Completed === true || traderData?.currentStep === 3;

            if (isCompleted) {
              targetPath = "/trader"; // Dashboard
            } else if (!step2Done && traderData?.verificationStatus !== "MANUAL_CHECK") {
              // Pass the categoryId to step 2 so it can load the skills
              const catId = traderData?.selectedCategories?.[0]?.id;
              targetPath = catId ? `/auth/trader-signup/step-2?categoryId=${catId}` : "/auth/trader-signup/step-2";
            } else {
              targetPath = "/auth/trader-signup/step-3";
            }
          } catch (statusErr) {
            console.error("Failed to fetch registration status", statusErr);
            targetPath = "/auth/trader-signup/step-2"; // Safe fallback if they haven't finished
          }
        } else if (roleStr === Role.Customer.toLowerCase()) {
          // Direct customers to their dashboard
          targetPath = "/customer-dashboard/jobs";
        }

        router.replace(targetPath);
      } else {
        router.replace("/");
      }
    } catch (err: any) {
      const dataMsg = err.response?.data?.message;
      let msg = Array.isArray(dataMsg) ? dataMsg[0] : dataMsg;
      if (!msg) {
        msg = err.response?.data?.error || "Login failed";
      }
      if (typeof msg !== "string") {
        msg = "Login failed";
      }

      toast.error(msg, { id: 'login-error' });

      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes("email") || lowerMsg.includes("user") || lowerMsg.includes("found") || lowerMsg.includes("exist")) {
        setErrors({ email: msg });
      } else if (lowerMsg.includes("password") && !lowerMsg.includes("email")) {
        setErrors({ password: "Password is incorrect" });
      } else if (lowerMsg.includes("credential")) {
        setErrors({ email: "Invalid email or password" });
      } else {
        setErrors({});
      }
    } finally {
      setIsLoading(false);
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
            {/* HEADINGS */}
            <div>
              <h1 className="text-[24px] sm:text-[28px] font-bold text-[#1C2C1C] tracking-tight leading-tight mb-1.5" style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
                Welcome back
              </h1>
              <p className="text-[13px] sm:text-[13.5px] text-[#1C2C1C]/60 font-medium">
                Access your account and manage your jobs easily
              </p>
            </div>
            {/* FORM */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
              {/* EMAIL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-[#1C2C1C] uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`h-[44px] w-full rounded-[12px] border bg-white px-4 text-[14px] text-[#1C2C1C] placeholder-[#1C2C1C]/30 outline-none transition-all font-medium ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-[#243A241F] focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625]"}`}
                />
                {errors.email && <p className="text-red-500 text-[11.5px] font-medium mt-0.5">{errors.email}</p>}
              </div>
              {/* PASSWORD */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-[#1C2C1C] uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder="••••••••"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    className={`h-[44px] w-full rounded-[12px] border bg-white px-4 pr-10 text-[14px] text-[#1C2C1C] placeholder-[#1C2C1C]/30 outline-none transition-all font-medium ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-[#243A241F] focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625]"}`}
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
                <div className="flex items-center justify-between mt-1">
                  <div className="flex-1">
                    {errors.password && (
                      <p className="text-red-500 text-[11.5px] font-medium">
                        {errors.password}
                      </p>
                    )}
                  </div>
                  <Link href="/auth/forgot-password" className="font-bold text-[11.5px] text-[#1C2C1C]/40 hover:text-[#6E9625] transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>
              {/* REMEMBER */}
              {/* <div className="flex items-center gap-2.5 cursor-pointer select-none group mt-1" onClick={() => setRememberMe(!rememberMe)}>
                <div className={`w-[18px] h-[18px] rounded border flex items-center justify-center flex-shrink-0 transition-all ${rememberMe ? "bg-[#1C2C1C] border-[#1C2C1C]" : "border-[#243A2429] bg-white group-hover:border-[#1C2C1C]/60"}`}>
                  {rememberMe && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-[12px] text-[#1C2C1C]/70 font-extrabold">Remember me</span>
              </div> */}
              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isLoading}
                className="h-[48px] w-full rounded-[12px] bg-[#1C2C1C] text-[15px] font-bold text-white shadow-sm transition-all hover:bg-[#121E12] hover:shadow-md cursor-pointer mt-1 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>
            {/* DIVIDER */}
            <div className="flex items-center gap-4 my-0.5">
              <div className="h-[1px] flex-1 bg-[#243A240D]" />
              <span className="text-[10px] uppercase tracking-widest text-[#243A244D] font-extrabold">OR</span>
              <div className="h-[1px] flex-1 bg-[#243A240D]" />
            </div>
            {/* SOCIAL BUTTONS */}
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            {/* REGISTER LINK */}
            <div className="text-center mt-1">
              <p className="text-[13px] text-[#1C2C1C]/60 font-medium">
                Don&#39;t have an account? <Link href="/auth/signup" className="text-[#1C2C1C] font-extrabold hover:underline">Sign up</Link>
              </p>
            </div>
          </div>
        </div>
        {/* RIGHT SECTION (Hero) */}
        <div className="relative hidden w-full lg:w-[50%] lg:h-auto lg:self-stretch overflow-hidden lg:block flex-shrink-0 z-0">
          <Image src={currentRole.toUpperCase() === "TRADER" ? "/TraderLogin.jfif" : "/log%20in.png"} alt="Find trusted professionals for every job" fill className="object-cover object-center" priority unoptimized style={{ opacity: 1 }} />
          <div className="absolute inset-0 bg-[#162716]/30 mix-blend-multiply z-10" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 xl:p-20 text-white z-20" style={{ background: 'linear-gradient(to top, rgba(22, 39, 22, 0.9) 0%, rgba(22, 39, 22, 0.2) 60%, transparent 100%)' }}>
            <div className="w-full max-w-[576px] h-auto lg:h-[439.73px] max-h-[90%] flex flex-col justify-end text-white" style={{ gap: '23.2px', opacity: 1 }}>
              <div className="flex items-center gap-2.5 mb-1 animate-fade-in flex-shrink-0">
                <div className="w-6 h-[2px] bg-[#6E9625] rounded-full" />
                <span className="text-[#6E9625] text-[10px] sm:text-[11px] font-extrabold tracking-[0.2em] uppercase">TRUSTED BY THOUSANDS</span>
              </div>
              <h2 className="text-[32px] sm:text-[40px] lg:text-[38px] xl:text-[52px] font-bold leading-[1.1] tracking-tight text-white animate-slide-up" style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
                {currentRole.toUpperCase() === "TRADER" ? (
                  <>The smarter way to<br />win new business.</>
                ) : (
                  <>Find trusted<br />professionals<br /> for every job</>
                )}
              </h2>
              <p className="text-[14px] sm:text-[15px] lg:text-[16px] font-medium leading-relaxed text-white/80 animate-fade-in">
                {currentRole.toUpperCase() === "TRADER" ? (
                  <>Receive quality job leads, connect with local customers, and<br />grow your business with a trusted platform built for tradespeople</>
                ) : (
                  <>Compare quotes, hire with confidence, and get<br /> your home projects done right.</>
                )}
              </p>
              {/* Social proof */}
              <div className="flex-shrink-0">
                <Image
                  src="/Container.png"
                  alt="10k+ verified pros"
                  width={180}
                  height={44}
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

export default function LoginPage() {
  return (
    <PublicGuard>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8F9F5]">Loading...</div>}>
        <LoginContent />
      </Suspense>
    </PublicGuard>
  );
}
