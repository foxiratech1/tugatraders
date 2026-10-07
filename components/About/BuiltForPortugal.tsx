"use client";

import React from 'react';
import Image from 'next/image';

export default function BuiltForPortugal() {
  return (
    <section className="bg-[#FAFAF9] py-16 md:py-24 px-4 sm:px-6 lg:px-20 overflow-hidden border-b border-[#EAECE6]">
      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* LEFT TEXT CONTENT */}
        <div className="flex flex-col items-start max-w-[620px]">
          <h2
            className="text-[34px] sm:text-[42px] md:text-[48px] font-bold text-[#1C2C1C] leading-[1.1] mb-6 tracking-tight"
            style={{ fontFamily: 'var(--font-bricolage)' }}
          >
            Built for Portugal
          </h2>

          <div className="flex flex-col gap-5 sm:gap-6 text-[#4B5563] text-[15px] sm:text-[16px] leading-[1.8] font-normal">
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
        <div className="relative flex justify-center lg:justify-end w-full">
          <div className="relative w-full max-w-[460px] h-[380px] sm:h-[460px] lg:h-[520px]">
            <Image
              src="/maplogo.jfif"
              alt="Built for Portugal Map"
              fill
              className="object-contain"
              unoptimized
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
