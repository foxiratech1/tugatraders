import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

const SecureJobsBanner = () => {
  return (
    <section className="relative w-full overflow-hidden py-12 sm:py-14 md:py-16 flex items-center">
      {/* Background Image with Green Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/image2.png"
          alt="Tradesperson in Portugal"
          fill
          className="object-cover object-right md:object-[75%_center]"
          priority
        />
        {/* Dark forest green gradient: solid on the left for contrast, translucent on the right to reveal the electrician */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C2516] via-[#0C2516]/90 to-[#0C2516]/45" />
        <div className="absolute inset-0 bg-[#0E2A18]/35 mix-blend-multiply" />
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

