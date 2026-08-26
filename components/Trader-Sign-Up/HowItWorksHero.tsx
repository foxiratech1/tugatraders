"use client";

import React, { useState, useRef } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { traderRegister } from "@/app/api/authApi";
import { setTokens, setUser } from "@/utils/auth";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { AnimatedEye } from "@/app/ui/AnimatedEye";
import Link from "next/link";

const getPasswordError = (pass: string) => {
  const missing = [];
  if (pass.length < 8 || pass.length > 64) missing.push("Minimum 8 characters");
  if (!/[A-Z]/.test(pass)) missing.push("1 uppercase letter");
  if (!/[a-z]/.test(pass)) missing.push("1 lowercase letter");
  if (!/[0-9]/.test(pass)) missing.push("1 number");
  if (!/[^A-Za-z0-9]/.test(pass)) missing.push("1 special character");

  if (missing.length === 0) return undefined;
  if (missing.length === 5) return "Minimum 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.";

  const hasMin = missing[0] === "Minimum 8 characters";
  const reqs = hasMin ? missing.slice(1) : missing;
  let msg = hasMin ? "Minimum 8 characters" : "Requires";

  if (reqs.length > 0) {
    msg += hasMin ? ", including " : " ";
    if (reqs.length === 1) msg += reqs[0];
    else if (reqs.length === 2) msg += `${reqs[0]} and ${reqs[1]}`;
    else msg += `${reqs.slice(0, -1).join(", ")}, and ${reqs[reqs.length - 1]}`;
  }
  return msg + ".";
};

const HowItWorksHero = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
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

  const [errors, setErrors] = useState<{
    workRadius?: string;
    baseLocation?: string;
    fullName?: string;
    businessEmail?: string;
    contactNumber?: string;
    password?: string;
    confirmPassword?: string;
    agreeTerms?: string;
  }>({});

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
    const radiusVal = Number(formData.workRadius);
    if (!formData.workRadius) {
      e.workRadius = "Work radius is required";
    } else if (isNaN(radiusVal) || radiusVal <= 0 || radiusVal > 500) {
      e.workRadius = "Radius must be between 1 and 500";
    }
    if (!formData.baseLocation) e.baseLocation = "Location is required";
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
    Boolean(formData.workRadius.trim()) &&
    Boolean(formData.baseLocation.trim()) &&
    Boolean(formData.fullName.trim()) &&
    Boolean(formData.businessEmail.trim()) &&
    Boolean(formData.contactNumber.trim()) &&
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
      const payload = {
        fullName: formData.fullName,
        email: formData.businessEmail,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        workRadius: Number(formData.workRadius),
        latitude: 22.5530,
        longitude: 75.7569,
        isCheckedTermsCondition: formData.agreeTerms,
        contactNumber: formData.contactNumber,
        location: formData.baseLocation,
      };

      const res = await traderRegister(payload);

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

  const inputCls = (err?: string) =>
    `h-[46px] w-full rounded-[12px] border bg-[#F9FAFB] px-4 text-[14px] text-[#1C2C1C] placeholder-[#1C2C1C]/30 outline-none transition-all font-semibold ${err
      ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400"
      : "border-[#E5E7EB] focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625] hover:border-[#D1D5DB]"
    }`;

  const steps = [
    {
      id: 1,
      title: "Sign-Up",
      description: "Basic business information & contact details",
      status: "active"
    },
    {
      id: 2,
      title: "Upload Docs",
      description: "Verify identity and trade certifications",
      status: "upcoming"
    },
    {
      id: 3,
      title: "Get Approved",
      description: "Manual verification by our local team",
      status: "upcoming"
    },
    {
      id: 4,
      title: "Activate Profile",
      description: "Go live and start receiving enquiries",
      status: "upcoming"
    }
  ];

  return (
    <section className="bg-[#F7F9F6] pt-40 pb-20 px-6 lg:px-20 overflow-hidden min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-16 items-start xl:items-center">

          {/* Left Column - Content & Form */}
          <div className="xl:col-span-7 flex flex-col gap-8">
            <div className="flex items-center gap-2 bg-[#6FAE7C1A] border border-[#6FAE7C33] rounded-full px-4 py-1.5 w-fit">
              <span className="w-2 h-2 rounded-full bg-[#6E9625]" />
              <span className="text-[12px] font-bold text-[#6E9625] uppercase tracking-wider">Now in Portugal</span>
            </div>

            <h1 className="text-[40px] sm:text-[48px] lg:text-[60px] font-bold text-[#243A24] leading-[1.05] tracking-tight">
              Built Specifically for <br className="hidden sm:block" />
              Tradespeople in <span className="text-[#6E9625]">Portugal</span>
            </h1>

            <p className="text-[16px] sm:text-[18px] lg:text-[20px] text-[#1F3D2B99]/60 font-medium leading-relaxed max-w-[650px]">
              Join the fastest-growing network of professional trades in Portugal.
              Connect with local homeowners and grow your business today.
            </p>

            {/* Form Card */}
            <div className="w-full max-w-[448px] bg-white rounded-[28px] p-7 sm:p-9 shadow-[0_12px_48px_rgba(36,58,36,0.07)] border border-[#243A240A] flex flex-col gap-[18px]">

              <div>
                <h2
                  className="text-[24px] sm:text-[26px] font-bold text-[#1C2C1C] tracking-tight leading-tight mb-1"
                  style={{ fontFamily: "var(--font-bricolage), sans-serif" }}
                >
                  Trader Registration
                </h2>
                <p className="text-[13px] text-[#1C2C1C]/55 font-medium">
                  Join our network of certified premium tradespeople.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">

                {/* Work Radius & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11.5px] font-extrabold text-[#1C2C1C]/70 uppercase tracking-wider">
                      Work Radius (KM)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 25"
                      value={formData.workRadius}
                      onChange={(e) => field("workRadius", e.target.value)}
                      className={inputCls(errors.workRadius)}
                    />
                    {errors.workRadius && (
                      <p className="text-red-500 text-[11px] font-medium">{errors.workRadius}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11.5px] font-extrabold text-[#1C2C1C]/70 uppercase tracking-wider">
                      Location
                    </label>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
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

                {/* Contact Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11.5px] font-extrabold text-[#1C2C1C]/70 uppercase tracking-wider">
                    Contact Number
                  </label>
                  <PhoneInput
                    defaultCountry="pt"
                    value={formData.contactNumber}
                    onChange={(phone) => field("contactNumber", phone)}
                    inputClassName="!h-[46px] !w-full !rounded-r-[12px] !border-l-0 !text-[14px] !text-[#1C2C1C] !font-medium !placeholder-[#1C2C1C]/30 !outline-none !bg-[#F9FAFB]"
                    countrySelectorStyleProps={{
                      buttonClassName: "!h-[46px] !rounded-l-[12px] !border-[#243A241F] !bg-[#F9FAFB] !px-3 hover:!bg-[#F5F5F5]",
                    }}
                    className={`w-full rounded-[12px] border transition-all ${errors.contactNumber
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
                    <span className="text-[#1C2C1C] font-bold hover:underline"><Link href="/terms">Terms of Service</Link></span>{" "}
                    and{" "}
                    <span className="text-[#1C2C1C] font-bold hover:underline"><Link href="/terms?tab=cookies">Privacy Policy</Link></span>
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !isFormFilled}
                  className="h-[48px] w-full rounded-[12px] bg-[#1C2C1C] text-[15px] font-bold text-white shadow-sm transition-all hover:bg-[#2C4A2C] hover:shadow-md cursor-pointer mt-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#1C2C1C]"
                >
                  {loading ? "Creating Account…" : "Create Account"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Timeline */}
          <div className="xl:col-span-5 relative mt-16 xl:mt-0 max-w-[448px] mx-auto xl:mx-0 xl:ml-12">
            {/* Connecting Line */}
            <div className="absolute left-[27px] top-4 bottom-4 w-[2px] bg-[#E5E5E5]" />

            <div className="space-y-12 xl:space-y-20 relative">
              {steps.map((step) => (
                <div key={step.id} className="flex items-start gap-6 xl:gap-10 group">
                  {/* Step Circle */}
                  <div className={`
                    relative z-10 w-14 h-14 rounded-full flex items-center justify-center font-bold text-[20px] transition-all duration-300
                    ${step.status === 'active'
                      ? 'bg-[#243A24] text-white border-[4px] border-[#FFFFFF] shadow-xl scale-110'
                      : 'bg-white border-[4px] border-[#FFFFFF] text-[#D1D5DB]'}
                  `}>
                    {step.id}
                  </div>

                  {/* Step Content */}
                  <div className="flex flex-col gap-1 pt-1">
                    <h3 className={`
                      text-[24px] lg:text-[24px] font-bold transition-all duration-300
                      ${step.status === 'active' ? 'text-[#243A24]' : 'text-[#243A2466]/40'}
                    `}>
                      {step.title}
                    </h3>
                    <p className={`
                      text-[16px] lg:text-[16px] font-medium max-w-[320px]
                      ${step.status === 'active' ? 'text-[#1F3D2B80]' : 'text-[#1F3D2B4D]/30'}
                    `}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorksHero;
