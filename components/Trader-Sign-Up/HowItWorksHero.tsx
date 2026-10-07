"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { traderRegister } from "@/app/api/authApi";
import { setTokens, setUser } from "@/utils/auth";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { AnimatedEye } from "@/app/ui/AnimatedEye";
import Link from "next/link";
import { getFcmToken } from "@/utils/firebase";

const getPasswordError = (pass: string) => {
  const missing = [];
  if (pass.length < 8 || pass.length > 64) missing.push("Minimum 8 characters");
  if (!/[A-Z]/.test(pass)) missing.push("1 uppercase letter");
  if (!/[a-z]/.test(pass)) missing.push("1 lowercase letter");
  if (!/[0-9]/.test(pass)) missing.push("1 number");
  if (!/[^A-Za-z0-9]/.test(pass)) missing.push("1 special character");

  if (missing.length === 0) return undefined;
  if (missing.length === 5)
    return "Minimum 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.";

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
    workRadius: "25",
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
    } else if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      e.confirmPassword = "Passwords do not match";
    }

    if (!formData.baseLocation.trim()) e.baseLocation = "Location is required";
    if (!formData.agreeTerms)
      e.agreeTerms = "You must agree to the Terms of Service";

    return e;
  };

  const field = <K extends keyof typeof formData>(
    key: K,
    value: typeof formData[K]
  ) => {
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
          if (
            next.password &&
            next.confirmPassword &&
            next.password !== next.confirmPassword
          ) {
            nextErrs.confirmPassword = "Passwords do not match";
          } else if (
            next.password &&
            next.confirmPassword &&
            next.password === next.confirmPassword
          ) {
            nextErrs.confirmPassword = undefined;
          }
        }
        return nextErrs;
      });
      return next;
    });
  };

  const isFormFilled =
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
      const fcmToken = await getFcmToken();
      const payload = {
        fullName: formData.fullName,
        email: formData.businessEmail,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        workRadius: Number(formData.workRadius) || 25,
        latitude: 22.553,
        longitude: 75.7569,
        isCheckedTermsCondition: formData.agreeTerms,
        contactNumber: formData.contactNumber,
        location: formData.baseLocation,
        ...(fcmToken ? { fcmToken } : {}),
      };

      const res = await traderRegister(payload);

      if (res) {
        const token =
          res.accessToken ||
          res.access_token ||
          res.token ||
          res.data?.accessToken ||
          res.data?.token;
        const refreshToken =
          res.refreshToken ||
          res.refresh_token ||
          res.data?.refreshToken;
        if (token) {
          setTokens(token, refreshToken);
          setUser(res.user || res.data?.user || res);
        }
      }

      toast.success("Trader account created! Please verify your email.");
      router.replace(
        `/auth/verify-otp?email=${encodeURIComponent(formData.businessEmail)}`
      );
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

      if (typeof msg === "string") {
        msg = Array.from(new Set(msg.split(/,\s*(?=[A-Z])/))).join(", ");
      }

      setErrors({});
      if (
        msg.toLowerCase().includes("email already exists") ||
        msg.toLowerCase().includes("email is already registered") ||
        msg.toLowerCase().includes("already in use")
      ) {
        toast.error("This email is already registered. Please log in.", {
          id: "auth-error",
        });
      } else {
        toast.error(msg, { id: "auth-error" });
      }
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const inputCls = (err?: string) =>
    `h-[44px] w-full rounded-[8px] border bg-[#F9FAFB] px-3.5 text-[13.5px] text-[#1C2C1C] placeholder-[#1C2C1C]/35 outline-none transition-all font-semibold ${
      err
        ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400"
        : "border-[#E5E7EB] focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625] hover:border-[#D1D5DB]"
    }`;

  const steps = [
    {
      id: 1,
      title: "Sign-Up",
      description: "Basic business information & contact details",
      status: "active",
    },
    {
      id: 2,
      title: "Upload Docs",
      description: "Verify identity and trade certifications",
      status: "upcoming",
    },
    {
      id: 3,
      title: "Get Approved",
      description: "Manual verification by our local team",
      status: "upcoming",
    },
    {
      id: 4,
      title: "Activate Profile",
      description: "Go live and start receiving enquiries",
      status: "upcoming",
    },
  ];

  return (
    <section className="bg-white pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-12 min-h-screen relative overflow-hidden">
      <div className="max-w-[1300px] mx-auto relative">
        
        {/* DIAGONAL CORNER RIBBON - Below the navbar, inside the content area */}
        <div className="hidden lg:block absolute -top-4 -right-8 xl:-right-4 z-20 pointer-events-none">
          <div className="bg-[#78A128] text-[#142617] py-3.5 px-12 xl:px-16 shadow-lg transform rotate-[25deg] flex flex-col items-center text-center rounded-[4px] border-y border-[#8EBE2E]">
            <span className="font-extrabold text-[15px] xl:text-[16px] tracking-tight leading-tight">
              No commission on your jobs
            </span>
            <span className="text-[12px] xl:text-[13px] font-medium leading-tight mt-0.5 opacity-90">
              Keep 100% of what you agree with the customer.
            </span>
          </div>
        </div>

        {/* HEADER AREA */}
        <div className="mb-8 max-w-[720px]">
          <h1 className="text-[34px] sm:text-[44px] lg:text-[48px] font-extrabold text-[#1E3A2B] leading-[1.12] tracking-tight mb-3">
            <span className="text-[#6E9625]">Grow</span> Your Business With
            <br />
            TugaTrades
          </h1>

          <p className="text-[16px] sm:text-[17.5px] text-[#243A24] font-medium leading-snug">
            Get discovered by customers looking for your trade across Portugal.
          </p>
          <p className="text-[16px] sm:text-[17.5px] text-[#243A24] font-bold leading-snug mb-3.5">
            First 3 months FREE*
          </p>

          <p className="text-[14px] sm:text-[15px] text-[#4A5548] font-normal leading-relaxed">
            Create your professional profile and start receiving relevant customer enquiries.
          </p>
        </div>

        {/* MAIN GRID: FORM (LEFT) + STEPPER TIMELINE (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-stretch">
          
          {/* LEFT: FORM CARD */}
          <div className="lg:col-span-6 w-full max-w-[420px] flex flex-col h-full">
            <div className="bg-white rounded-[20px] p-6 sm:p-7 border border-[#E5E7EB] shadow-[0_4px_25px_rgba(0,0,0,0.04)] flex flex-col gap-4 flex-1 h-full">
              
              <div>
                <h2 className="text-[22px] sm:text-[24px] font-bold text-[#1C2C1C] tracking-tight leading-tight mb-1">
                  Create Your Account
                </h2>
                <p className="text-[12.5px] text-[#6B7280] font-medium">
                  Join our network of vetted tradespeople
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 flex-1 justify-between">
                
                {/* Full Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10.5px] font-bold text-[#1C2C1C]/75 uppercase tracking-wider">
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

                {/* Business Email */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10.5px] font-bold text-[#1C2C1C]/75 uppercase tracking-wider">
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

                {/* Contact Number */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10.5px] font-bold text-[#1C2C1C]/75 uppercase tracking-wider">
                    CONTACT NUMBER
                  </label>
                  <PhoneInput
                    defaultCountry="pt"
                    value={formData.contactNumber}
                    onChange={(phone) => field("contactNumber", phone)}
                    inputClassName="!h-[44px] !w-full !rounded-r-[8px] !border-l-0 !text-[13.5px] !text-[#1C2C1C] !font-medium !placeholder-[#1C2C1C]/35 !outline-none !bg-[#F9FAFB]"
                    countrySelectorStyleProps={{
                      buttonClassName:
                        "!h-[44px] !rounded-l-[8px] !border-[#243A241F] !bg-[#F9FAFB] !px-3 hover:!bg-[#F5F5F5]",
                    }}
                    className={`w-full rounded-[8px] border transition-all ${
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

                {/* Location */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10.5px] font-bold text-[#1C2C1C]/75 uppercase tracking-wider">
                    LOCATION
                  </label>
                  <input
                    type="text"
                    placeholder="Town / Postcode"
                    value={formData.baseLocation}
                    onChange={(e) => field("baseLocation", e.target.value)}
                    className={`${inputCls(errors.baseLocation)} max-w-[200px]`}
                  />
                  {errors.baseLocation && (
                    <p className="text-red-500 text-[11px] font-medium">{errors.baseLocation}</p>
                  )}
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 relative">
                  <div className="flex flex-col gap-1 relative">
                    <label className="text-[10.5px] font-bold text-[#1C2C1C]/75 uppercase tracking-wider">
                      PASSWORD
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => field("password", e.target.value)}
                      className={inputCls(errors.password)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[44px] -translate-y-1/2 z-10"
                    >
                      <AnimatedEye show={showPassword} isBlinking={false} mouseOffset={{ x: 0, y: 0 }} />
                    </button>
                    {errors.password && (
                      <p className="text-red-500 text-[11px] font-medium">{errors.password}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 relative">
                    <label className="text-[10.5px] font-bold text-[#1C2C1C]/75 uppercase tracking-wider">
                      CONFIRM PASSWORD
                    </label>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => field("confirmPassword", e.target.value)}
                      className={inputCls(errors.confirmPassword)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-[44px] -translate-y-1/2 z-10"
                    >
                      <AnimatedEye show={showConfirmPassword} isBlinking={false} mouseOffset={{ x: 0, y: 0 }} />
                    </button>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-[11px] font-medium">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Terms */}
                <div
                  className="flex items-start gap-2 cursor-pointer select-none group mt-0.5"
                  onClick={() => field("agreeTerms", !formData.agreeTerms)}
                >
                  <div
                    className={`mt-0.5 w-[15px] h-[15px] rounded-[3px] border flex items-center justify-center flex-shrink-0 transition-all ${
                      formData.agreeTerms
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
                  <p className="text-[10.5px] text-[#4A5548] font-medium leading-tight">
                    I agree to the{" "}
                    <span className="text-[#1C2C1C] font-bold hover:underline">
                      <Link href="/terms">Terms of Service</Link>
                    </span>{" "}
                    and{" "}
                    <span className="text-[#1C2C1C] font-bold hover:underline">
                      <Link href="/terms?tab=cookies">Privacy Policy</Link>
                    </span>
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !isFormFilled}
                  className="h-[44px] w-full rounded-[8px] bg-[#758475] hover:bg-[#617061] text-[13.5px] font-bold text-white shadow-sm transition-all cursor-pointer mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Account…" : "Create Account"}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: STEPPER TIMELINE */}
          <div className="lg:col-span-6 w-full max-w-[420px] flex flex-col h-full">
            <div className="bg-[#F8FAF7] rounded-[24px] p-6 sm:p-8 border border-[#E6EDE2] relative flex-1 h-full flex flex-col justify-between">
              
              {/* Connecting Line */}
              <div className="absolute left-[46px] sm:left-[56px] -translate-x-1/2 top-[50px] sm:top-[58px] bottom-[50px] sm:bottom-[58px] w-[1.5px] bg-[#E0E5DC]" />

              <div className="flex flex-col justify-between flex-1 h-full py-1 gap-6 sm:gap-8 relative z-10">
                {steps.map((step) => {
                  const isActive = step.status === "active";
                  return (
                    <div key={step.id} className="flex items-start gap-4 sm:gap-5 group">
                      {/* Step Circle */}
                      <div
                        className={`relative z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-[16px] sm:text-[17px] transition-all duration-300 shadow-sm shrink-0 ${
                          isActive
                            ? "bg-[#182C1F] text-white shadow-md ring-4 ring-white"
                            : "bg-white border-2 border-[#E5E7EB] text-[#9CA3AF]"
                        }`}
                      >
                        {step.id}
                      </div>

                      {/* Step Content */}
                      <div className="flex flex-col gap-0.5 pt-0.5">
                        <h3
                          className={`text-[16px] sm:text-[17px] font-bold transition-all ${
                            isActive ? "text-[#182C1F]" : "text-[#7B8B9B]"
                          }`}
                        >
                          {step.title}
                        </h3>
                        <p
                          className={`text-[12px] sm:text-[12.5px] font-medium leading-snug ${
                            isActive ? "text-[#4A5548]" : "text-[#9CA3AF]"
                          }`}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default HowItWorksHero;
