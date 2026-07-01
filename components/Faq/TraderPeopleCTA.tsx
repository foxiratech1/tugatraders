"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const TraderPeopleCTA = () => {
  return (
    <section className="bg-[#FAFAF9] pb-10 sm:pb-12 lg:pb-14 px-4 sm:px-6 lg:px-10 xl:px-16 overflow-hidden flex items-center justify-center">

      <div className="max-w-[1200px] w-full">

        {/* Banner Card */}
        <div className="bg-[#243A24] rounded-[18px] sm:rounded-[22px] p-5 sm:p-6 md:p-7 lg:p-8 xl:p-9 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center shadow-lg relative overflow-hidden">

          {/* Decorative Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          {/* LEFT CONTENT */}
          <div className="lg:col-span-7 flex flex-col justify-center z-10 animate-fade-in w-full">

            {/* Heading */}
            <h2
              className="text-[24px] sm:text-[30px] md:text-[34px] lg:text-[38px] xl:text-[40px] font-bold text-white leading-[1.1] tracking-tight mb-3"
              style={{
                fontFamily: "var(--font-bricolage)",
              }}
            >
              Find the{" "}
              <span className="text-[#6E9625]">
                right professional
              </span>

              <br className="hidden lg:inline" />{" "}

              with confidence
            </h2>

            {/* Description */}
            <p className="text-[#FFFFFFCC]/85 text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] leading-relaxed mb-5 sm:mb-6 max-w-[624px] font-medium animate-slide-up">

              Post your job or browse trusted local
              tradespeople, compare quotes and services,
              and hire confidently with verified reviews
              and proven results.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">

              <Link
                href="/post-job"
                className="bg-[#6E9625] hover:bg-[#6E9625]/90 text-white font-bold py-3.5 px-6 sm:px-8 rounded-[8px] text-[14px] sm:text-[15px] transition-all hover:scale-[1.02] shadow-sm whitespace-nowrap cursor-pointer text-center"
              >
                Post a Job
              </Link>

              <Link
                href="/directory-listing"
                className="bg-[#FFFFFF1A] hover:bg-[#FFFFFF24] text-white border border-white/20 font-bold py-3.5 px-6 sm:px-8 rounded-[8px] text-[14px] sm:text-[15px] transition-all hover:scale-[1.02] whitespace-nowrap cursor-pointer animate-fade-in text-center"
              >
                Browse Traders
              </Link>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end items-center z-10 w-full">

            <div className="w-full max-w-[250px] sm:max-w-[320px] lg:max-w-[360px] overflow-hidden">
              <div className="relative w-full aspect-[400/225]">

                <Image
                  src="/tradepeople.png"
                  alt="Tradespeople Group"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section >
  );
};

export default TraderPeopleCTA;