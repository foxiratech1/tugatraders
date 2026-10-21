import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

const SecureJobsBanner = () => {
  return (
    <section className="relative w-full overflow-hidden py-5 sm:py-6 md:py-7 flex items-center bg-[#204424]">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        {/* Right-aligned electrician image with green duotone */}
        <div className="absolute inset-y-0 right-0 w-full sm:w-[60%] md:w-[52%] lg:w-[48%]">
          <Image
            src="/tradesperson-banner-bg-hd.png"
            alt="Tradesperson in Portugal"
            fill
            className="object-cover object-right"
            priority
            unoptimized
          />
          {/* Subtle gradient blend to seamlessly merge into the green background */}
          <div className="absolute inset-y-0 left-0 w-24 sm:w-32 bg-gradient-to-r from-[#204424] to-transparent pointer-events-none" />
        </div>
        {/* Mobile overlay for text readability */}
        <div className="absolute inset-0 bg-[#204424]/80 sm:hidden pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start max-w-[480px]">
          {/* Headline */}
          <h2 className="text-[20px] sm:text-[23px] md:text-[25px] lg:text-[27px] font-bold text-white leading-[1.2] tracking-tight mb-1.5 sm:mb-2">
            Are You a <span className="text-[#779F2D]">Tradesperson</span>
            <br />
            in Portugal?
          </h2>

          {/* Subtitle */}
          <p className="text-[12px] sm:text-[13px] md:text-[13.5px] text-white/90 font-normal leading-snug mb-3.5 sm:mb-4">
            Get discovered by customers looking for your services.
          </p>

          {/* CTA Button */}
          <Link
            href="/auth/trader-signup"
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#CE2F32] hover:bg-[#B72427] text-white font-bold text-[11px] sm:text-[11.5px] tracking-wider uppercase px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-[4px] sm:rounded-[5px] transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus size={14} className="shrink-0 stroke-[2.4]" />
            <span>JOIN TUGATRADES</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SecureJobsBanner;
