"use client";

import React from 'react';
import Image from 'next/image';

export default function BuiltForPortugal() {
  return (
    <section className="bg-white -mt-6 sm:-mt-8 lg:-mt-10 -mb-4 sm:-mb-6 lg:-mb-8 py-2 sm:py-3 px-4 sm:px-6 lg:px-12 overflow-hidden">
      <div className="max-w-[1100px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-4 sm:gap-6 lg:gap-8 items-center">
        {/* LEFT TEXT CONTENT */}
        <div className="flex flex-col items-start w-full max-w-[620px]">
          <h2
            className="text-[30px] sm:text-[36px] md:text-[40px] font-bold text-[#1C2C1C] leading-[1.15] mb-4 sm:mb-5 tracking-tight"
            style={{ fontFamily: 'var(--font-bricolage)' }}
          >
            Built for Portugal
          </h2>

          <div className="flex flex-col gap-3.5 sm:gap-4 text-[#4B5563] text-[14.5px] sm:text-[15px] lg:text-[15.5px] leading-[1.68] font-normal">
            <p>
              Portugal has a huge network of skilled tradespeople, from plumbers and electricians to painters, carpenters, gardeners, builders and specialists.
            </p>

            <p>
              We created TugaTrades specifically for the Portuguese market, helping customers discover local professionals while giving tradespeople another way to reach potential customers.
            </p>

            <p>
              Whether you&apos;re a homeowner, business, property manager or tradesperson, TugaTrades is designed to make finding and connecting with the right people&nbsp;simpler.
            </p>
          </div>
        </div>

        {/* RIGHT MAP IMAGE */}
        <div className="relative flex justify-center lg:justify-start items-center w-full">
          <div className="relative w-full max-w-[320px] sm:max-w-[350px] lg:max-w-[380px] h-[360px] sm:h-[400px] lg:h-[435px] transition-transform duration-300 hover:scale-[1.03] cursor-pointer">
            <Image
              src="/newMap.jpg"
              alt="Built for Portugal Map"
              fill
              className="object-contain mix-blend-multiply"
              priority
              sizes="(max-width: 768px) 100vw, 380px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
