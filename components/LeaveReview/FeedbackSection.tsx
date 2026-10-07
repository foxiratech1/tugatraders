"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { authApi } from '@/app/api/authApi';
import { ShieldCheck, BadgeCheck, Star, Search, ArrowRight } from 'lucide-react';
import { IoShieldHalfSharp } from "react-icons/io5";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getImageUrl = (path?: any) => {
  if (!path) return "/avt.png";

  let p = typeof path === 'string' ? path : (path?.fileUrl || path?.url || path?.path || path?.src);
  if (!p || typeof p !== 'string') return "/placeholder.png";

  if (p.startsWith("http")) return p;

  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const imagePath = p.startsWith('/') ? p : `/${p}`;

  return `${baseUrl}${imagePath}`;
};

const FeedbackSection = () => {
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

  return (
    <section className="bg-[#FAFAF9] pt-24 pb-16 xl:pb-20 px-4 sm:px-6 xl:px-20 relative flex items-center">
      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 xl:grid-cols-12 gap-12 xl:gap-20 items-center">

        {/* Left Column (Content) */}
        <div className="xl:col-span-7 w-full flex flex-col items-start animate-fade-in">
          
          <h1 className="text-[32px] sm:text-[38px] md:text-[46px] font-bold text-[#1d3321] leading-[1.1] mb-5 tracking-tight">
            <span className="text-[#6E9625]">Real</span> Experiences Matter
          </h1>

          <p className="text-[#1d3321] text-[15px] sm:text-[17px] font-medium leading-relaxed mb-8 max-w-[500px]">
            Reviews help customers make informed decisions and help good tradespeople build their reputation.
          </p>

          <div className="mb-8 w-full">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1d3321] mb-1">Leave a Review</h2>
            <p className="text-[#1d3321] text-[15px] sm:text-[16px] mb-5 font-medium">Have you recently used a TugaTrades professional?</p>

            {/* Search Bar Container */}
            <div
              ref={dropdownRef}
              className="max-w-[760px] w-full bg-white rounded-[32px] sm:rounded-full border border-[#243A24] p-2 flex flex-col sm:flex-row items-center relative z-20 shadow-sm"
            >
              <div className="flex-1 flex items-center gap-5 px-4 sm:pl-8 sm:pr-4 py-3 sm:py-0 w-full min-h-[64px] sm:h-[68px]">
                <Search className="text-[#243A24] shrink-0" size={28} strokeWidth={1.5} />

                <div className="text-left w-full flex flex-col justify-center">
                  <span className="block text-[18px] sm:text-[20px] text-[#243A24] font-extrabold tracking-tight leading-tight mb-0.5">
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
                    className="block w-full text-[11px] sm:text-[12px] tracking-[0.18em] uppercase font-bold text-[#A3A3A3] placeholder-[#A3A3A3] bg-transparent outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full sm:w-auto bg-[#243A24] hover:bg-[#1A2E1A] text-white px-8 sm:px-12 h-[56px] sm:h-[68px] rounded-[24px] sm:rounded-full flex items-center justify-center gap-2.5 font-bold text-[15px] sm:text-[16px] transition-all shrink-0 cursor-pointer disabled:opacity-70 mt-2 sm:mt-0"
              >
                {isSearching ? 'Searching...' : 'Find Tradesperson'}
                <ArrowRight size={20} strokeWidth={2} />
              </button>

              {/* Autocomplete Dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E5E5E5] rounded-[20px] shadow-2xl max-h-[300px] overflow-y-auto z-50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                            src={getImageUrl(trader.profileImage || trader.logo)}
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
          </div>
        </div>

        {/* Right Column (Images and Cards) */}
        <div className="xl:col-span-5 flex justify-center xl:justify-end relative w-full mt-10 xl:mt-0">
          <div className="relative w-full max-w-[360px] sm:max-w-[420px] aspect-[4/4] rounded-[24px] overflow-visible">
            
            {/* Main image */}
            <div className="w-full h-full rounded-[24px] overflow-hidden relative shadow-lg">
              <Image
                src="/man.png"
                alt="Verified Tradesperson"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Floating Card: Customer Review */}
            <div className="absolute -left-4 sm:-left-12 -bottom-6 bg-white rounded-[16px] p-4 shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-[#243A241F] flex flex-col gap-2.5 w-[200px] sm:w-[240px] z-10 animate-fade-in">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden relative shrink-0">
                  <Image
                    src="/customer2.png"
                    alt="Maria S."
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="text-left flex-1">
                  <h4 className="text-[13px] sm:text-[14px] font-bold text-[#111111]">Maria S.</h4>
                  {/* Gold Stars */}
                  <div className="flex gap-0.5 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="text-[#FACC15]" fill="currentColor" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[#555555] text-[11px] sm:text-[12px] leading-relaxed font-medium italic mt-1">
                "Excellent work on the plumbing, very clean and professional. Highly recommended!"
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default FeedbackSection;
