"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const CTASection = () => {
  return (
    <section className="w-full py-12 md:py-16 px-6 md:px-16 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[340px]">
      {/* Background Image */}
      <Image
        src="/view.png"
        alt="Portugal View"
        fill
        className="object-cover"
        unoptimized
      />

      {/* Green Overlays */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: '#243A24',
          opacity: 0.7
        }}
      />
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(to right, #243A24 0%, #243A2466 100%)',
          mixBlendMode: 'multiply'
        }}
      />

      {/* Heading */}
      <h2
        className="text-[28px] md:text-[48px] font-bold text-white mb-5 leading-tight max-w-[920px] tracking-tight relative z-10"
        style={{ fontFamily: 'var(--font-bricolage)' }}
      >
        TugaTrades makes it simple to find reliable <span className="text-[#8FD14F]">tradespeople</span> in Portugal.
      </h2>

      {/* Subheading */}
      <p className="text-white/70 text-[14px] md:text-[18px] font-medium leading-relaxed max-w-[700px] mb-8 relative z-10">
        Whether you're looking to hire or want to grow your professional service business, start your journey today.
      </p>

      {/* Buttons Container */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10 w-full max-w-[760px]">
        {/* Post Job Button */}
        <Link href="/post-job">
          <button className="bg-[#6E9625] hover:bg-[#5a7d1e] text-white font-bold  py-4 px-8 rounded-[5px] text-[15px] md:text-[16px] transition-all hover:scale-[1.02] shadow-sm cursor-pointer whitespace-nowrap w-full sm:w-auto min-w-[180px]">
            Post a Job
          </button>
        </Link>

        {/* Browse Tradespeople Button */}
        <Link href="/directory-listing/search">
          <button className="bg-[#243A24] hover:bg-[#1a2b1a] text-white font-bold  py-4 px-8 rounded-[5px] text-[15px] md:text-[16px] transition-all hover:scale-[1.02] shadow-sm cursor-pointer whitespace-nowrap w-full sm:w-auto min-w-[180px] border border-white/10">
            Browse Tradespeople
          </button>
        </Link>

        {/* Join Button */}
        <Link href="/trader-signup">
          <button className="bg-[#C60C03] hover:bg-[#A30A02] text-white font-bold  py-4 px-8 rounded-[5px] text-[15px] md:text-[16px] transition-all hover:scale-[1.02] shadow-sm cursor-pointer whitespace-nowrap w-full sm:w-auto min-w-[200px]">
            Join as a Tradesperson
          </button>
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
