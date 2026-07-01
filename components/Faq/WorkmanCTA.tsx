"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const WorkmanCTA = () => {
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
              className="text-[24px] sm:text-[30px] md:text-[34px] lg:text-[38px] xl:text-[40px] font-bold text-white leading-[1.1] tracking-tight mb-3 whitespace-nowrap"
              style={{
                fontFamily: "var(--font-bricolage)",
              }}
            >
              Get more <span className="text-[#8FD14F]">jobs, faster</span>
            </h2>

            {/* Description */}
            <p className="text-white/80 text-[13px] sm:text-[14px] md:text-[15px] leading-relaxed max-w-[480px] mb-7 sm:mb-8 font-medium">
              Connect with clients ready to hire,
              increase your visibility, and turn
              enquiries into consistent, paying work.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">

              <Link
                href="/trader-signup"
                className="bg-[#6E9625] hover:bg-[#5a7d1e] text-white font-bold py-3 px-5 sm:px-6 rounded-[5px] text-[14px] sm:text-[15px] transition-all hover:scale-[1.02] shadow-sm whitespace-nowrap cursor-pointer text-center"
              >
                Join As a Tradesperson
              </Link>

              <Link
                href="/directory-listing"
                className="bg-[#FFFFFF1A] hover:bg-white/5 text-white border border-white/20 font-bold py-3.5 px-6 sm:px-8 rounded-[5px] text-[14px] sm:text-[15px] transition-all hover:scale-[1.02] whitespace-nowrap cursor-pointer text-center"
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
                  src="/workman.png"
                  alt="Workman Growth"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkmanCTA;