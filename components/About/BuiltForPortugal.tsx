"use client";

import React from 'react';
import Image from 'next/image';

export default function BuiltForPortugal() {
  return (
    <section className="bg-[#FAFAF9] py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-20 overflow-hidden border-b border-[#EAECE6]">
      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
        {/* LEFT TEXT CONTENT */}
        <div className="flex flex-col items-start max-w-[600px]">
          <h2
            className="text-[30px] sm:text-[36px] md:text-[40px] font-bold text-[#1C2C1C] leading-[1.15] mb-4 sm:mb-5 tracking-tight"
            style={{ fontFamily: 'var(--font-bricolage)' }}
          >
            Built for Portugal
          </h2>

          <div className="flex flex-col gap-3.5 sm:gap-4 text-[#4B5563] text-[14.5px] sm:text-[15.5px] leading-[1.7] font-normal">
            <p>
              Portugal has a huge network of skilled tradespeople, from plumbers and electricians to painters, carpenters, gardeners, builders and specialists.
            </p>

            <p>
              We created TugaTrades specifically for the Portuguese market, helping customers discover local professionals while giving tradespeople another way to reach potential customers.
            </p>

            <p>
              Whether you&apos;re a homeowner, business, property manager or tradesperson, TugaTrades is designed to make finding and connecting with the right people simpler.
            </p>
          </div>
        </div>

        {/* RIGHT MAP IMAGE */}
        <div className="relative flex justify-center lg:justify-center w-full">
          <div className="relative w-full max-w-[380px] lg:max-w-[440px] h-[320px] sm:h-[380px] lg:h-[420px]">
            <Image
              src="/newMap.jpg"
              alt="Built for Portugal Map"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
