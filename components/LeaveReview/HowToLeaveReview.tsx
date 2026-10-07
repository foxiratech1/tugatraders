"use client";

import React, { useState } from 'react';
import { Hourglass, Clock, ArrowRight, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/app/api/authApi';

const LoginModal = ({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      const accessToken = data?.accessToken || data?.access_token || data?.token;
      const refreshToken = data?.refreshToken || data?.refresh_token;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        onSuccess();
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-[420px] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-[#1C2C1C]/40 hover:bg-gray-100 hover:text-[#1C2C1C] transition-colors cursor-pointer text-lg"
        >
          ✕
        </button>

        <div className="w-12 h-12 rounded-full bg-[#F3F8EC] flex items-center justify-center mb-4">
          <LogIn size={22} className="text-[#6E9625]" />
        </div>

        <h3 className="text-[22px] font-bold text-[#1C2C1C] mb-1" style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
          Login to Dashboard
        </h3>
        <p className="text-[13px] text-[#1C2C1C]/55 font-medium mb-6">
          Please log in to access your dashboard.
        </p>

        {error && (
          <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-extrabold text-[#1C2C1C] uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5] outline-none text-[14px] font-medium focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625] transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-extrabold text-[#1C2C1C] uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-10 rounded-xl border border-[#E5E5E5] outline-none text-[14px] font-medium focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1C2C1C]/40 hover:text-[#1C2C1C] transition-colors cursor-pointer"
              >
                {showPw ? (
                  <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 py-3 bg-[#1C2C1C] text-white rounded-xl font-bold text-[14px] hover:bg-[#121E12] transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
          >
            {loading ? 'Logging in…' : 'Log In & Continue'}
          </button>
        </form>

        <p className="text-center text-[12px] text-[#1C2C1C]/50 mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-[#6E9625] font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

const HowToLeaveReview = () => {
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();

  const handleLoginSuccess = () => {
    setShowLogin(false);
    router.push('/trader');
  };

  return (
    <>
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
      />
      <section className="bg-[#F8F9F5] pt-4 lg:pt-8 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-20 overflow-hidden">
        <div className="max-w-[1200px] mx-auto w-full">

          {/* Section Heading */}
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-[28px] sm:text-[36px] md:text-[44px] font-bold text-[#243A24] mb-3 sm:mb-4 leading-tight" style={{ fontFamily: 'var(--font-bricolage)' }}>
              How to Leave a <span className="text-[#6E9625]">Review</span>
            </h2>
            <p className="text-[#555555] text-[15px] md:text-[16px] font-medium mx-auto">
              Choose the method that matches how you connected with your tradesperson.
            </p>
          </div>

          {/* Flow Cards Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8 mb-10 sm:mb-16">

            {/* Left Card: Direct Contact (Sage Green) */}
            <div className="bg-[#D6DED0] rounded-[22px] p-5 sm:p-6 border border-[#C4CEBE] shadow-sm flex flex-col justify-between h-full min-h-[460px] w-full">
              <div>
                {/* Title */}
                <h3 className="text-[22px] sm:text-[25px] md:text-[28px] font-bold text-[#243A24] leading-snug mb-3 min-h-[70px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
                  Did you contact a tradesperson via the <span className="text-[#6E9625]">directory?</span>
                </h3>

                {/* Description */}
                <p className="text-[#243A24B2] text-[14px] leading-relaxed mb-6 font-medium min-h-[75px]">
                  Revisit the trader&apos;s profile to leave a review and share your experience.
                </p>

                {/* Stepper List (Vertical) */}
                <div className="flex flex-col gap-3 mb-6">
                  {/* Step 1 */}
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#243A24] rounded-[8px] flex items-center justify-center text-[13px] font-bold text-white shrink-0">
                      1
                    </div>
                    <span className="text-[14px] font-bold text-[#243A24]">
                      Search for the trader
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#243A24] rounded-[8px] flex items-center justify-center text-[13px] font-bold text-white shrink-0">
                      2
                    </div>
                    <span className="text-[14px] font-bold text-[#243A24]">
                      Open Traders Profile
                    </span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#243A24] rounded-[8px] flex items-center justify-center text-[13px] font-bold text-white shrink-0">
                      3
                    </div>
                    <span className="text-[14px] font-bold text-[#243A24]">
                      Submit your review & proof
                    </span>
                  </div>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={() => {
                  router.push('/directory-listing/search');
                }}
                className="bg-[#243A24] hover:bg-[#1A301A] text-white px-7 py-3.5 rounded-[14px] flex items-center justify-center gap-2 font-bold text-[14px] transition-all w-full cursor-pointer shadow-md">
                Find Tradesperson
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Right Card: Post a Job (Sage Green) */}
            <div className="bg-[#D6DED0] rounded-[22px] p-5 sm:p-6 border border-[#C4CEBE] shadow-sm flex flex-col justify-between h-full min-h-[460px] w-full">
              <div>
                {/* Title */}
                <h3 className="text-[22px] sm:text-[25px] md:text-[28px] font-bold text-[#243A24] leading-snug mb-3 min-h-[70px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
                  Did you <span className="text-[#6E9625]">post a job?</span>
                </h3>

                {/* Description */}
                <p className="text-[#243A24B2] text-[14px] leading-relaxed mb-6 font-medium min-h-[75px]">
                  No need to formally accept a quote. Simply chat with vetted traders and choose who to work with. Once job is complete leave a review based on your experience.
                </p>

                {/* Stepper List (Vertical) */}
                <div className="flex flex-col gap-3 mb-6">
                  {/* Step 1 */}
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#6E9625] rounded-[8px] flex items-center justify-center text-[13px] font-bold text-white shrink-0">
                      1
                    </div>
                    <span className="text-[14px] font-bold text-[#243A24]">
                      Mark job as completed
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#6E9625] rounded-[8px] flex items-center justify-center text-[13px] font-bold text-white shrink-0">
                      2
                    </div>
                    <span className="text-[14px] font-bold text-[#243A24]">
                      Select Tradesperson to review
                    </span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#6E9625] rounded-[8px] flex items-center justify-center text-[13px] font-bold text-white shrink-0">
                      3
                    </div>
                    <span className="text-[14px] font-bold text-[#243A24]">
                      Submit your review
                    </span>
                  </div>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && localStorage.getItem('accessToken')) {
                    router.push('/trader');
                  } else {
                    setShowLogin(true);
                  }
                }}
                className="bg-[#6E9625] hover:bg-[#5a7d1e] text-white px-7 py-3.5 rounded-[14px] flex items-center justify-center gap-2 font-bold text-[14px] transition-all w-full cursor-pointer shadow-md"
              >
                Go To Dashboard
              </button>
            </div>

          </div>

          {/* Quick Reminder Section */}
          <div className="w-full pt-4 sm:pt-6 flex justify-center">
            <div className="max-w-[720px] w-full flex items-start gap-3.5 sm:gap-4">
              {/* Standalone Yellow Hourglass Icon */}
              <div className="shrink-0 mt-0.5">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M6 2H18M6 22H18M7 2V6.5C7 7.8 7.6 9 8.5 9.8L12 13L15.5 9.8C16.4 9 17 7.8 17 6.5V2M7 22V17.5C7 16.2 7.6 15 8.5 14.2L12 11L15.5 14.2C16.4 15 17 16.2 17 17.5V22"
                    stroke="#EAB308"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.5 19.5C8.5 18 10 16.5 12 16.5C14 16.5 15.5 18 15.5 19.5H8.5Z"
                    fill="#EAB308"
                  />
                </svg>
              </div>

              {/* Text content */}
              <div>
                <h4 className="text-[17px] sm:text-[18px] font-bold text-[#1C2C1C] mb-1 tracking-tight">
                  Quick reminder
                </h4>
                <p className="text-[#4A5548] text-[13.5px] sm:text-[14px] leading-relaxed font-normal">
                  You can leave a review anytime within 6 months of your job being completed, so there&apos;s no rush to share your experience. After submitting your review, you&apos;ll have up to 48 hours to make any changes before it becomes final.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default HowToLeaveReview;
