"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { UserPlus } from "lucide-react";

const SecureJobsBanner = () => {
  return (
    <section className="relative w-full overflow-hidden py-7 sm:py-8 md:py-9 lg:py-10 flex items-center bg-[#204424]">

      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">

        {/* Right-aligned Tradesperson Image */}
        <div className="absolute inset-y-0 right-0 w-full sm:w-[62%] md:w-[55%] lg:w-[52%]">

          <Image
            src="/tradesperson-banner-bg-hd.png"
            alt="Tradesperson in Portugal"
            fill
            className="object-cover object-right"
            priority
            unoptimized
          />

          {/* Softer Gradient Blend */}
          <div className="absolute inset-y-0 left-0 w-20 sm:w-28 md:w-36 bg-gradient-to-r from-[#204424]/75 via-[#204424]/40 to-transparent pointer-events-none" />

          {/* Subtle Green Overlay - Reduced Opacity */}
          <div className="absolute inset-0 bg-[#204424]/15 pointer-events-none" />

        </div>

        {/* Mobile Overlay - Reduced Opacity */}
        <div className="absolute inset-0 bg-[#204424]/65 sm:hidden pointer-events-none" />

      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col items-start w-full max-w-[750px]">

          {/* Heading - Single Line on Desktop */}
          <h2 className="text-[22px] sm:text-[26px] md:text-[29px] lg:text-[30px] font-bold text-white leading-[1.2] tracking-tight mb-2 whitespace-normal lg:whitespace-nowrap">

            Are You a{" "}
            <span className="text-[#779F2D]">
              Tradesperson
            </span>{" "}
            in Portugal?

          </h2>

          {/* Subtitle - Slightly Larger */}
          <p className="text-[14px] sm:text-[14.5px] md:text-[15px] text-white/95 font-normal leading-relaxed mb-4 sm:mb-5">

            Get discovered by customers looking for your services.

          </p>

          {/* CTA Button */}
          <Link
            href="/auth/trader-signup"
            className="inline-flex items-center gap-2 bg-[#CE2F32] hover:bg-[#B72427] text-white font-bold text-[12px] sm:text-[12.5px] tracking-wider uppercase px-4 sm:px-5 py-2.5 sm:py-3 rounded-[5px] transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus
              size={15}
              className="shrink-0 stroke-[2.4]"
            />

            <span>JOIN TUGATRADES</span>

          </Link>

        </div>

      </div>

    </section>
  );
};

export default SecureJobsBanner;