"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const HowItWorks = () => {
  return (
    <section id="how-reviews-work" className="bg-white py-16 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden scroll-mt-24">
      <div className="max-w-[1020px] mx-auto">

        {/* HEADER - Left-aligned as per feedback */}
        <div className="text-left mb-8 sm:mb-12">
          <h2 className="text-[26px] sm:text-[32px] md:text-[36px] font-extrabold text-[#1E3A2B] leading-tight tracking-tight">
            How Our <span className="text-[#6E9625]">Directory Reviews</span> Work
          </h2>
        </div>

        {/* 3-COLUMN STAGGERED GRID ON DESKTOP, STACKED ON MOBILE */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_380px_280px] justify-center gap-6 lg:gap-8 items-center">

          {/* ── ROW 1: Image 1 | Card 1 | Empty ── */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[270px] sm:max-w-[280px] aspect-[1.16/1]">
              <Image
                src="/system1.png"
                alt="Find & Contact a Trader"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="flex justify-center lg:justify-start">
            <div className="bg-[#F8FAF7] border border-[#E9EFE8] rounded-[14px] p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] w-full max-w-[380px]">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-[26px] h-[26px] bg-[#1E3A2B] text-white rounded-[6px] font-bold text-[13px] flex items-center justify-center shrink-0">
                  1
                </div>
                <h3 className="text-[16px] sm:text-[17px] font-bold text-[#1E3A2B] leading-tight">
                  Find & Contact a Trader
                </h3>
              </div>
              <p className="text-[12.5px] sm:text-[13px] text-[#4A5548] font-normal leading-relaxed">
                Browse the directory, compare local tradespeople, and contact the trader that best fits your job.
              </p>
            </div>
          </div>

          <div className="hidden lg:block" aria-hidden="true" />


          {/* ── ROW 2: Empty | Card 2 | Image 2 ── */}
          <div className="hidden lg:block" aria-hidden="true" />

          <div className="flex justify-center lg:justify-start order-2 lg:order-none">
            <div className="bg-[#F8FAF7] border border-[#E9EFE8] rounded-[14px] p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] w-full max-w-[380px]">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-[26px] h-[26px] bg-[#1E3A2B] text-white rounded-[6px] font-bold text-[13px] flex items-center justify-center shrink-0">
                  2
                </div>
                <h3 className="text-[16px] sm:text-[17px] font-bold text-[#1E3A2B] leading-tight">
                  Job Complete
                </h3>
              </div>
              <p className="text-[12.5px] sm:text-[13px] text-[#4A5548] font-normal leading-relaxed">
                Agree the work directly with the trader and complete the job outside the platform.
              </p>
            </div>
          </div>

          <div className="flex justify-center lg:justify-start order-1 lg:order-none">
            <div className="relative w-full max-w-[270px] sm:max-w-[280px] aspect-[1.16/1]">
              <Image
                src="/system2.png"
                alt="Job Complete"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>


          {/* ── ROW 3: Image 3 | Card 3 | Empty ── */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[270px] sm:max-w-[280px] aspect-[1.16/1]">
              <Image
                src="/system3.png"
                alt="Leave a Verified Review"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="flex justify-center lg:justify-start">
            <div className="bg-[#F8FAF7] border border-[#E9EFE8] rounded-[14px] p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] w-full max-w-[380px]">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-[26px] h-[26px] bg-[#1E3A2B] text-white rounded-[6px] font-bold text-[13px] flex items-center justify-center shrink-0">
                  3
                </div>
                <h3 className="text-[16px] sm:text-[17px] font-bold text-[#1E3A2B] leading-tight">
                  Leave a Verified Review
                </h3>
              </div>
              <p className="text-[12.5px] sm:text-[13px] text-[#4A5548] font-normal leading-relaxed">
                Search traders profile on TugaTrades and submit your review with proof of work completed such as an invoice or job photos.
              </p>
            </div>
          </div>

          <div className="hidden lg:block" aria-hidden="true" />


          {/* ── ROW 4: Empty | Button | Empty ── */}
          <div className="hidden lg:block" aria-hidden="true" />

          <div className="flex justify-center pt-2 sm:pt-4">
            <Link
              href="/review"
              className="bg-[#6E9625] hover:bg-[#5E831F] text-white font-bold py-2.5 sm:py-3 px-8 sm:px-10 rounded-[10px] text-[13.5px] sm:text-[14px] transition-all shadow-sm hover:shadow active:scale-[0.98] inline-block cursor-pointer"
            >
              Leave a Review
            </Link>
          </div>

          <div className="hidden lg:block" aria-hidden="true" />

        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
