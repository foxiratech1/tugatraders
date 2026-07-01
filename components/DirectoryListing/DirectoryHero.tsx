"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Hammer, Search } from 'lucide-react';
import { IoShieldHalfOutline } from "react-icons/io5";
import { FaScrewdriverWrench, FaLocationDot } from "react-icons/fa6";


const DirectoryHero = () => {
  const router = useRouter();

  const handleSearch = () => {
    router.push('/directory-listing/search');
  };

  return (
    <section className="bg-[#F7F9F6] pt-24 pb-20 px-4 sm:px-6 md:pt-36 md:pb-32">
      <div className="max-w-[1400px] mx-auto text-center">

        {/* Premium Badge */}
        <div className="inline-flex items-center gap-2 bg-[#65A30D1A]/10 px-4 py-2 rounded-full mb-6 sm:mb-12 border border-[#65A30D33]/20">
          <IoShieldHalfOutline size={16} className="text-[#064E3B]" />
          <span className="text-[#65A30D] text-[12px] font-bold tracking-wider uppercase">
            Premium Trade Network
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-[32px] sm:text-[38px] md:text-[46px] lg:text-[60px] font-bold text-[#243A24] leading-[1.1] mb-8" style={{ fontFamily: "var(--font-bricolage)" }}>
          Find Local and Expert <br className="max-sm:hidden" />
          <span className="text-[#6E9625]">Tradespeople</span> for Your Job
        </h1>

        {/* Subheadline */}
        <p className="text-[16px] md:text-[18px] lg:text-[20px] text-[#4B5563] font-medium max-w-2xl mx-auto mb-10 sm:mb-16 md:mb-20 leading-relaxed">
          Browse trusted and vetted professionals, compare <br className="hidden md:block" />
          profiles, and hire with confidence
        </p>

        {/* Search Bar Container */}
        <div 
          onClick={handleSearch}
          className="w-full max-w-[1100px] mx-auto bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border-2 border-[#243A24] p-3 cursor-pointer"
        >
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-2 lg:gap-4">

            {/* Category */}
            <div className="flex-1 flex items-center justify-center lg:justify-start gap-2 lg:gap-4 px-4 md:px-3 lg:px-6 py-4 border-b md:border-b-0 md:border-r border-[#F3F4F6] min-w-0">
              <Hammer className="text-[#243A24] flex-shrink-0 w-5 h-5 lg:w-6 lg:h-6" />
              <div className="text-left min-w-0">
                <span className="block text-[10px] lg:text-[12px] text-[#9CA3AF] uppercase font-bold tracking-wider mb-1">Category</span>
                <span className="block text-[14px] lg:text-[16px] font-bold text-[#243A24] truncate">All Trades</span>
              </div>
            </div>

            {/* Service */}
            <div className="flex-1 flex items-center justify-center lg:justify-start gap-2 lg:gap-4 px-4 md:px-3 lg:px-6 py-4 border-b md:border-b-0 md:border-r border-[#F3F4F6] min-w-0">
              <FaScrewdriverWrench className="text-[#243A24] flex-shrink-0 w-5 h-5 lg:w-6 lg:h-6" />
              <div className="text-left min-w-0">
                <span className="block text-[10px] lg:text-[12px] text-[#9CA3AF] uppercase font-bold tracking-wider mb-1">Service</span>
                <span className="block text-[14px] lg:text-[16px] font-bold text-[#243A24] truncate">Select Service</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex-1 flex items-center justify-center lg:justify-start gap-2 lg:gap-4 px-4 md:px-3 lg:px-6 py-4 min-w-0">
              <FaLocationDot className="text-[#243A24] flex-shrink-0 w-5 h-5 lg:w-6 lg:h-6" />
              <div className="text-left min-w-0">
                <span className="block text-[10px] lg:text-[12px] text-[#D1D5DB] uppercase font-bold tracking-wider mb-1">Location</span>
                <input
                  type="text"
                  placeholder="Enter Postcode or City"
                  readOnly
                  className="block w-full text-[14px] lg:text-[16px] font-bold text-[#243A24] placeholder-[#9CA3AF] bg-transparent outline-none cursor-pointer truncate"
                />
              </div>
            </div>

            {/* Search Button */}
            <button className="bg-[#243A24] hover:bg-[#1A301A] text-white px-6 py-4 md:px-3 lg:px-10 lg:py-5 rounded-[18px] flex items-center justify-center gap-2 lg:gap-3 font-bold text-[15px] md:text-[13px] lg:text-[16px] transition-all min-w-full md:min-w-[120px] lg:min-w-[200px] cursor-pointer flex-shrink-0">
              <Search className="flex-shrink-0 w-5 h-5 lg:w-6 lg:h-6" />
              <span className="truncate">Search Trades</span>
            </button>

          </div>
        </div>

      </div>
    </section>
  );
};

export default DirectoryHero;
