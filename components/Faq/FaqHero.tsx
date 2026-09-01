"use client";

import React from "react";
import Image from "next/image";

const FaqHero = () => {
  return (
    <section className="bg-[#FAFAF9] pt-[120px] sm:pt-[130px] lg:pt-[140px] pb-16 lg:pb-20 px-4 sm:px-6 lg:px-10 xl:px-20 overflow-hidden flex items-center justify-center">

      <div className="max-w-[1440px] mx-auto w-full grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-16 items-center">

        {/* LEFT CONTENT */}
        <div className="xl:col-span-6 flex flex-col justify-center items-center xl:items-start text-center xl:text-left animate-fade-in max-w-full">

          {/* HELP CENTER PILL */}
          <div className="mb-5 sm:mb-6">
            <span className="inline-flex items-center gap-1.5 bg-[#6E96251A] text-[#6E9625] rounded-full px-3.5 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">

              <span className="w-1.5 h-1.5 bg-[#6E9625] rounded-full" />

              HELP CENTER
            </span>
          </div>

          {/* HEADING */}
          <h1
            className="text-[36px] sm:text-[48px] md:text-[60px] lg:text-[64px] xl:text-[72px] font-bold text-[#243A24] leading-[1.05] lg:leading-[1.08] xl:leading-[1.1] mb-5 sm:mb-6 tracking-tight"
            style={{
              fontFamily: "var(--font-bricolage)",
            }}
          >
            Frequently Asked <br />

            <span className="text-[#6E9625]">
              Questions
            </span>
          </h1>

          {/* SUBTITLE */}
          <p className="text-[#555555] text-[14px] sm:text-[15px] md:text-[16px] lg:text-[18px] font-medium leading-relaxed max-w-[480px] mx-auto xl:mx-0">
            Find answers to all your questions about
            our platform. Whether you're looking for a
            pro or looking for work, we've got you
            covered.
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <div className="xl:col-span-6 flex justify-center xl:justify-end items-center w-full mt-6 xl:mt-0">

          <div className="relative w-full max-w-[420px] sm:max-w-[500px] lg:max-w-[550px] aspect-[550/330] rounded-[24px] sm:rounded-[28px] lg:rounded-[32px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-[#243A240A]">
            <Image
              src="/faq.png"
              alt="Frequently Asked Questions"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqHero;