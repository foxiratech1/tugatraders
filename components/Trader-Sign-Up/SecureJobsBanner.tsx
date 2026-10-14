import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

const SecureJobsBanner = () => {
  return (
    <section className="relative w-full overflow-hidden py-14 sm:py-16 md:py-20 flex items-center bg-[#0C2516]">
      {/* Background Image with Lighter Green Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Right-aligned image container for natural zoomed-out context */}
        <div className="absolute inset-y-0 right-0 w-full sm:w-[75%] md:w-[65%] lg:w-[58%]">
          <Image
            src="/image2.png"
            alt="Tradesperson in Portugal"
            fill
            className="object-cover object-[70%_center]"
            priority
          />
        </div>
        {/* Lighter forest green gradient: solid on the left for contrast, clear and translucent on the right to reveal the electrician */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C2516] via-[#0C2516]/85 md:via-[#0C2516]/55 to-[#0C2516]/20 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start max-w-[580px]">
          {/* Headline */}
          <h2 className="text-[28px] sm:text-[34px] md:text-[40px] font-extrabold text-white leading-[1.15] tracking-tight mb-2 sm:mb-2.5">
            Are You a <span className="text-[#6E9625]">Tradesperson</span>
            <br />
            in Portugal?
          </h2>

          {/* Subtitle */}
          <p className="text-[14px] sm:text-[15.5px] text-white/85 font-normal leading-relaxed mb-6 sm:mb-7">
            Get discovered by customers looking for your services.
          </p>

          {/* CTA Button */}
          <Link
            href="/auth/trader-signup"
            className="inline-flex items-center gap-2.5 bg-[#C60C03] hover:bg-[#A80A02] text-white font-bold text-[13px] sm:text-[13.5px] tracking-wider uppercase px-5 sm:px-6 py-2.5 sm:py-3 rounded-[6px] sm:rounded-[7px] transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus size={17} className="shrink-0 stroke-[2.4]" />
            <span>JOIN TUGATRADES</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SecureJobsBanner;

