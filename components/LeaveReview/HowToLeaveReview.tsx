"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, ArrowRight, LogIn } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [dropdownResults, setDropdownResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDropdownLoading, setIsDropdownLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDropdownResults = async () => {
      if (searchQuery.trim().length > 1) {
        setIsDropdownLoading(true);
        setShowDropdown(true);
        try {
          const res = await authApi.searchTraders({ search: searchQuery });
          const results = Array.isArray(res) ? res : res?.data || [];
          setDropdownResults(results);
        } catch (err) {
          console.error('Failed to fetch dropdown traders', err);
          setDropdownResults([]);
        } finally {
          setIsDropdownLoading(false);
        }
      } else {
        setDropdownResults([]);
        setShowDropdown(false);
      }
    };

    const timeoutId = setTimeout(fetchDropdownResults, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const params = searchQuery ? { query: searchQuery } : {};
      await authApi.searchTraders(params);

      const queryString = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
      router.push(`/directory-listing/search${queryString}`);
    } catch (error) {
      console.error("Search failed:", error);
      const queryString = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
      router.push(`/directory-listing/search${queryString}`);
    } finally {
      setIsSearching(false);
    }
  };

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

          {/* Search Bar Container */}
          <div
            ref={dropdownRef}
            className="max-w-[1050px] mx-auto bg-white rounded-[28px] sm:rounded-[34px] shadow-[0_18px_50px_rgba(0,0,0,0.05)] border-2 border-[#243A24] px-4 sm:px-5 py-4 flex flex-col sm:flex-row items-center mb-6 gap-3 sm:gap-0 relative z-20"
          >
            <div className="flex-1 flex items-center gap-5 px-5 sm:px-8 py-4 sm:py-3 w-full">
              <Search className="text-[#243A24] shrink-0" size={28} />

              <div className="text-left w-full flex flex-col justify-center">
                <span className="block text-[18px] sm:text-[20px] text-[#243A24] font-extrabold tracking-tight">
                  Find Traders
                </span>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                  placeholder="SEARCH BY TRADER'S NAME OR COMPANY..."
                  className="block w-full text-[13px] tracking-[0.18em] uppercase font-semibold text-[#111111] placeholder-[#55555570] bg-transparent outline-none mt-1"
                />
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full sm:w-auto bg-[#243A24] hover:bg-[#152719] text-white px-10 sm:px-12 py-5 rounded-[20px] sm:rounded-[26px] flex items-center justify-center gap-2 font-bold text-[16px] transition-all shrink-0 cursor-pointer disabled:opacity-70">
              {isSearching ? 'Searching...' : 'Find Tradesperson'}
              <ArrowRight size={18} />
            </button>

            {/* Autocomplete Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E5E5E5] rounded-[20px] shadow-2xl max-h-[300px] overflow-y-auto z-50 overflow-hidden">
                {isDropdownLoading ? (
                  <div className="px-6 py-6 text-center text-[14px] text-[#6B7280] font-medium flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#6E9625] border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </div>
                ) : dropdownResults.length > 0 ? (
                  dropdownResults.map((trader) => (
                    <div
                      key={trader.id}
                      onClick={() => router.push(`/profile/${trader.id}`)}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-[#F3F8EC] transition-colors cursor-pointer border-b border-[#E5E5E5] last:border-b-0"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden shrink-0">
                        <img
                          src={trader.profileImage || trader.logo || '/placeholder.png'}
                          alt={trader.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-[#1F2937]">{trader.fullName}</h4>
                        <p className="text-[13px] text-[#6B7280]">{trader.companyName || trader.location || 'Trader'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#F3F8EC] flex items-center justify-center mb-3">
                      <Search className="text-[#6E9625]" size={20} />
                    </div>
                    <p className="text-[15px] font-bold text-[#1F2937] mb-1">Trader not found</p>
                    <p className="text-[13px] text-[#6B7280]">We couldn't find any tradesperson matching "{searchQuery}".</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Spelling Helper Text */}
          <p className="text-center text-[13px] text-[#555555] mb-20 font-medium">
            Can't find them?{" "}
            <Link href="/directory-listing/search" className="text-[#243A24] font-semibold underline decoration-1 hover:text-[#5a7d1e] transition-colors">
              browse categories
            </Link>
          </p>

          {/* Section Heading */}
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-[28px] sm:text-[36px] md:text-[44px] font-bold text-[#243A24] mb-3 sm:mb-4 leading-tight" style={{ fontFamily: 'var(--font-bricolage)' }}>
              How to leave a <span className="text-[#6E9625]">review</span>
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
                <h3 className="text-[22px] sm:text-[25px] md:text-[28px] font-bold text-[#243A24] leading-snug mb-3 min-h-[72px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
                  Did you search & contact the trader directly?
                </h3>

                {/* Description */}
                <p className="text-[#243A24B2] text-[14px] leading-relaxed mb-6 font-medium min-h-[120px]">
                  If you found and contacted a trader through our directory and completed a job, revisit the trader's profile to leave a review and share your experience. Your feedback helps other customers discover trusted local tradespeople with confidence.
                </p>

                {/* Stepper List (Vertical) */}
                <div className="flex flex-col gap-3 mb-6 min-h-[120px]">
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
                <h3 className="text-[22px] sm:text-[25px] md:text-[28px] font-bold text-[#243A24] leading-snug mb-3 min-h-[72px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
                  Did you post a job?
                </h3>

                {/* Description */}
                <p className="text-[#243A24B2] text-[14px] leading-relaxed mb-6 font-medium min-h-[120px]">
                  Quotes don't need to be formally accepted, simply chat with one or more trusted traders who responded to your job. Once the job is complete, you'll be invited to leave a review based on your experience. To keep reviews fair, you can only review traders you've interacted with through the platform.
                </p>

                {/* Stepper List (Vertical) */}
                <div className="flex flex-col gap-3 mb-6 min-h-[120px]">
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

          {/* Notices Section */}
          <div className="w-full">
            {/* Important Notice Card */}
            <div className="bg-[#FFFFFF66]/40 border-2 border-[#F2C94C4D] rounded-[16px] p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start w-full shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
              <div className="w-10 h-10 bg-[#FACC15] rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                <Clock size={20} className='text-white' />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-[#243A24] mb-2">Important Notice</h4>
                <p className="text-[#555555] text-[13px] leading-relaxed font-medium">
                  Remember: You can leave a review anytime within 6 months of your job being completed, so there's no rush to share your experience. After submitting your review, you'll have up to 48 hours to make any changes before it becomes final.
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
