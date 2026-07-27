"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Copy,
  ShieldAlert,
  Building2,
  ChevronDown,
  ArrowRight,
  Info,
} from "lucide-react";
import { authApi } from "@/app/api/authApi";

const ContactLayout = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [emailText, setEmailText] = useState(
    "contact@tugatrades.com"
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("name", fullName);
      formData.append("email", email);
      formData.append("subject", subject);
      formData.append("message", message);
      formData.append("isAnonymous", "false");
      if (selectedFile) {
        formData.append("attachments", selectedFile);
      }

      const response = await authApi.submitContactForm(formData);

      setSuccessMsg(response?.message || "We've received your messgae and will get back to you as soon as possible.");
      setFullName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setSelectedFile(null);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9F5] pt-[90px] sm:pt-[100px] overflow-hidden">

      {/* HERO SECTION */}
      <div className="pt-16 sm:pt-20 md:pt-24 xl:pt-28 pb-32 sm:pb-40 xl:pb-48 px-4 sm:px-6 xl:px-20 relative overflow-hidden">

        {/* Background Image */}
        <Image
          src="/contact.png"
          alt="Contact Background"
          fill
          className="object-cover object-right"
          unoptimized
        />

        {/* Overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(to right, rgba(36, 58, 36, 0.92) 20%, rgba(36, 58, 36, 0.65) 60%, rgba(36, 58, 36, 0.25) 100%)",
          }}
        />

        {/* Content */}
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="animate-fade-in">

            <span className="inline-block bg-[#FFFFFF1A] border border-[#FFFFFF33]/40 text-white rounded-full px-3 py-1 text-[10px] sm:text-[11px] mb-5 sm:mb-6 font-semibold tracking-wider">
              SUPPORT CENTER
            </span>

            <h1
              className="text-white text-[34px] sm:text-[42px] md:text-[52px] xl:text-[60px] font-bold mb-5 sm:mb-6 leading-[1.05] tracking-tight"
              style={{
                fontFamily: "var(--font-bricolage)",
              }}
            >
              Contact & Support
            </h1>

            <p className="text-[#FFFFFFCC]/80 text-[14px] sm:text-[15px] md:text-[18px] leading-relaxed max-w-[576px]">
              Need help or have a question? Get in touch
              with our team.
            </p>
          </div>
        </div>
      </div>

      {/* OVERLAPPING CONTENT */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 xl:px-20 -mt-16 sm:-mt-20 relative z-10 pb-16 sm:pb-24">

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-start">

          {/* LEFT SIDE */}
          <div
            className="xl:col-span-5 flex flex-col gap-5 sm:gap-6 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >

            {/* EMAIL CARD */}
            <div className="bg-white rounded-[16px] p-4 sm:p-6 shadow-sm border border-[#243A241F]/12 transition-all hover:shadow-md">

              <div className="w-10 h-10 sm:w-11 sm:h-11 border border-[#243A241F]/12 bg-[#FAFAF8] rounded-[12px] flex items-center justify-center mb-4">
                <Mail
                  size={20}
                  className="text-[#243A24]"
                />
              </div>

              <h3
                className="font-bold text-[#111111] text-[18px] sm:text-[20px] mb-2"
                style={{
                  fontFamily: "var(--font-bricolage)",
                }}
              >
                Email Us
              </h3>

              <p className="text-[13px] text-[#555555] mb-4 leading-relaxed font-medium">
                For general inquiries, account
                assistance, or technical support, drop
                us an email.
              </p>

              <div className="flex items-center justify-between border border-[#243A241F] rounded-xl px-4 py-2.5 bg-[#FAFAF8] gap-3">

                <input
                  type="text"
                  value={emailText}
                  onChange={(e) =>
                    setEmailText(e.target.value)
                  }
                  className="text-[13px] sm:text-[14px] text-[#111111] font-medium bg-transparent outline-none w-full min-w-0"
                />

                <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors shrink-0">
                  <Copy
                    size={16}
                    className="text-[#555555]"
                  />
                </button>
              </div>
            </div>

            {/* REPORT CARD */}
            <div className="bg-[#FFF8F8] rounded-[16px] p-5 sm:p-8 shadow-sm border border-[#C60C031A]/10 transition-all hover:shadow-md">

              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-[#C60C031A] rounded-[12px] flex items-center justify-center mb-5 sm:mb-6">
                <ShieldAlert
                  size={20}
                  className="text-[#C60C03]"
                />
              </div>

              <h3
                className="font-bold text-[#111111] text-[18px] sm:text-[20px] mb-2"
                style={{
                  fontFamily: "var(--font-bricolage)",
                }}
              >
                Report an Issue
              </h3>

              <p className="text-[14px] text-[#555555] leading-relaxed font-medium">
                If you believe a trader or user is
                violating our policies, providing unsafe
                services, or engaging in fraudulent
                behavior, please report them immediately
                to our Trust & Safety team.
              </p>
            </div>

            {/* LEGAL CARD */}
            <div className="bg-white rounded-[16px] p-5 sm:p-8 shadow-sm border border-[#243A241F] transition-all hover:shadow-md">

              <h3
                className="font-bold text-[#111111] text-[17px] sm:text-[18px] mb-5 sm:mb-6"
                style={{
                  fontFamily: "var(--font-bricolage)",
                }}
              >
                Legal Information
              </h3>

              <div className="flex items-start gap-4 mb-6 sm:mb-8">
                <Building2
                  size={18}
                  className="text-[#243A241F] mt-1 shrink-0"
                />

                <p className="text-[13px] text-[#555555] leading-relaxed font-medium">
                  TugaTrades Platform Ltd.
                  <br />
                  Registered in Portugal
                </p>
              </div>

              <div className="flex flex-wrap gap-4 sm:gap-6 text-[12px] font-bold text-[#243A24] border-t border-[#243A241F] pt-6">

                <Link
                  href="#"
                  className="hover:text-[#243A24] transition-colors"
                >
                  Terms of Service
                </Link>

                <Link
                  href="#"
                  className="hover:text-[#243A24] transition-colors"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div
            className="xl:col-span-7 animate-fade-in w-full"
            style={{ animationDelay: "0.2s" }}
          >

            <div className="bg-white w-full max-w-[670px] xl:ml-auto rounded-[16px] p-5 sm:p-8 lg:p-10 xl:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#243A241F]">

              <h2
                className="text-[22px] sm:text-[24px] font-bold text-[#111111] mb-3"
                style={{
                  fontFamily: "var(--font-bricolage)",
                }}
              >
                Contact Form
              </h2>

              <p className="text-[14px] text-[#555555] font-medium mb-8 sm:mb-10 leading-relaxed">
                Fill out the form below and we'll get
                back to you as soon as possible.
                <br className="hidden sm:block" />
                Before contacting us, you may find your
                answer in our FAQs
              </p>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#991B1B] text-[14px] font-medium">
                  {errorMsg}
                </div>
              )}

              <form
                className="flex flex-col gap-5 sm:gap-6"
                onSubmit={handleSubmit}
              >

                {/* INPUTS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">

                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full border border-[#243A241F] rounded-xl px-5 py-4 text-[14px] text-[#555555] font-medium outline-none bg-white"
                  />

                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-[#243A241F] rounded-xl px-5 py-4 text-[14px] text-[#555555] font-medium outline-none bg-white"
                  />
                </div>

                {/* SELECT */}
                <div className="relative">

                  <select
                    className="w-full border border-[#243A241F] rounded-xl px-5 py-4 text-[14px] font-medium outline-none focus:border-[#6E9625] transition-colors appearance-none text-[#111111] bg-white cursor-pointer"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  >

                    <option value="">
                      Select a subject...
                    </option>

                    <option value="GENERAL_ENQUIRY">
                      General Enquiry
                    </option>

                    <option value="REPORT_TRADER">
                      Report a Trader / User
                    </option>

                    <option value="REPORT_REVIEW">
                      Report a Review
                    </option>

                    <option value="TECHNICAL_ISSUE">
                      Technical Issue
                    </option>

                    <option value="OTHER">
                      Other
                    </option>
                  </select>

                  <ChevronDown
                    size={18}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>

                {/* TEXTAREA */}
                <textarea
                  placeholder="How can we help?"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full border border-[#243A241F] rounded-xl px-5 py-4 text-[14px] text-[#555555] font-medium outline-none focus:border-[#6E9625] transition-colors resize-none bg-white"
                />

                {/* FILE UPLOAD */}
                <label className="border-2 border-dashed border-[#243A241F] rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center text-center bg-[#FAFAF9]/50 hover:bg-[#FAFAF9] hover:border-gray-300 transition-all cursor-pointer group mt-2 relative">

                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".svg,.png,.jpg,.jpeg,.pdf"
                    onChange={handleFileChange}
                  />

                  <div className="w-12 h-12 bg-[#FAFAF8] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" />

                  <span className="text-[13px] sm:text-[14px] font-bold text-[#111111] break-all">
                    {selectedFile
                      ? selectedFile.name
                      : "Click to upload or drag and drop"}
                  </span>

                  <span className="text-[12px] font-medium text-[#555555] mt-1">
                    {selectedFile
                      ? "File selected"
                      : "SVG, PNG, JPG or PDF (max. 10MB)"}
                  </span>
                </label>

                {/* FOOTER */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mt-4 pt-8 border-t border-gray-100 gap-6">

                  <div className="flex items-start gap-2 text-[#555555] text-[11px] max-w-[420px]">

                    <Info
                      size={16}
                      className="shrink-0 mt-0.5"
                    />

                    <p className="leading-relaxed break-words">
                      We aim to respond to all enquiries
                      within 24-48 hours. By submitting
                      this form, you agree to our Privacy
                      Policy and consent to us using your
                      data to respond to your enquiry.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#243A24] text-white px-8 py-3.5 rounded-[14px] font-bold text-[14px] flex items-center justify-center gap-2 whitespace-nowrap hover:bg-[#1a2a1a] transition-all hover:scale-[1.02] shadow-sm w-full lg:w-auto cursor-pointer disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending..." : "Send Message"}
                    {!loading && <ArrowRight size={16} />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {successMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[20px] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#F0FDF4] rounded-full flex items-center justify-center mb-5">
              <div className="w-10 h-10 bg-[#22C55E] rounded-full flex items-center justify-center text-white shadow-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-[22px] font-bold text-[#111111] mb-2" style={{ fontFamily: "var(--font-bricolage)" }}>
              Thanks for contacting us!
            </h3>
            <p className="text-[14px] text-[#555555] font-medium leading-relaxed mb-8">
              {successMsg}
            </p>
            <button
              onClick={() => setSuccessMsg("")}
              className="w-full bg-[#243A24] text-white py-3.5 rounded-[14px] font-bold text-[14px] hover:bg-[#1a2a1a] transition-all hover:scale-[1.02]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default ContactLayout;