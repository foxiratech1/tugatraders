"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const HowItWorks = () => {
  return (
    <section className="bg-[#F9FAFB] py-14 md:py-16 px-6 lg:px-20 overflow-hidden">
      <div className="max-w-[1150px] mx-auto">

        {/* HEADER */}
        <h2
          className="text-center text-[32px] md:text-[42px] font-bold text-[#243A24] mb-12 leading-[1.1]"
          style={{ fontFamily: "var(--font-bricolage)" }}
        >
          How our{" "}
          <span className="text-[#6E9625]">directory review</span>
          <br />
          system works
        </h2>

        {/* STEPS */}
        <div className="flex flex-col gap-12 md:gap-16 relative max-w-[1040px] mx-auto">

          {/* STEP 1 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-14 items-center text-center xl:text-left">
            {/* IMAGE */}
            <div className="relative w-full max-w-[400px] mx-auto aspect-square xl:max-w-none xl:aspect-auto xl:h-[360px]">
              <Image
                src="/system1.png"
                alt="Find & Contact a Trader"
                fill
                className="object-contain xl:object-right"
                unoptimized
              />
            </div>

            {/* CONTENT */}
            <div className="flex flex-col items-center xl:items-start w-full max-w-[420px] mx-auto xl:mx-0">
              <div className="flex flex-col xl:flex-row items-center gap-4 mb-3 xl:mb-4">
                <div className="w-[46px] h-[46px] bg-[#243A24] rounded-[14px] flex items-center justify-center text-white text-[22px] font-bold shrink-0">
                  1
                </div>

                <h3 className="text-[22px] sm:text-[24px] xl:text-[26px] font-bold text-[#000000] leading-tight">
                  Find & Contact a Trader
                </h3>
              </div>

              <p className="text-[#000000] text-[15px] sm:text-[16px] xl:text-[17px] leading-relaxed">
                Browse the directory, compare local tradespeople, and contact
                the trader that best fits your job.
              </p>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-14 items-center text-center xl:text-left">
            {/* IMAGE */}
            <div className="order-1 xl:order-2 relative w-full max-w-[400px] mx-auto aspect-square xl:max-w-none xl:aspect-auto xl:h-[360px]">
              <Image
                src="/system2.png"
                alt="Job Complete"
                fill
                className="object-contain xl:object-left"
                unoptimized
              />
            </div>

            {/* CONTENT */}
            <div className="order-2 xl:order-1 flex flex-col items-center xl:items-start w-full max-w-[420px] mx-auto xl:mx-0 xl:ml-auto">
              <div className="flex flex-col xl:flex-row items-center gap-4 mb-3 xl:mb-4">
                <div className="w-[46px] h-[46px] bg-[#243A24] rounded-[14px] flex items-center justify-center text-white text-[22px] font-bold shrink-0">
                  2
                </div>

                <h3 className="text-[22px] sm:text-[24px] xl:text-[26px] font-bold text-[#000000] leading-tight">
                  Job Complete
                </h3>
              </div>

              <p className="text-[#1E1E1F] text-[15px] sm:text-[16px] xl:text-[17px] leading-relaxed">
                Agree the work directly with the trader and complete the job
                outside the platform.
              </p>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-14 items-center text-center xl:text-left">
            {/* IMAGE */}
            <div className="relative w-full max-w-[400px] mx-auto aspect-square xl:max-w-none xl:aspect-auto xl:h-[360px]">
              <Image
                src="/system3.png"
                alt="Leave a Verified Review"
                fill
                className="object-contain xl:object-right"
                unoptimized
              />
            </div>

            {/* CONTENT */}
            <div className="flex flex-col items-center xl:items-start w-full max-w-[420px] mx-auto xl:mx-0">
              <div className="flex flex-col xl:flex-row items-center gap-4 mb-3 xl:mb-4">
                <div className="w-[46px] h-[46px] bg-[#243A24] rounded-[14px] flex items-center justify-center text-white text-[22px] font-bold shrink-0">
                  3
                </div>

                <h3 className="text-[22px] sm:text-[24px] xl:text-[26px] font-bold text-[#1F1F1F] leading-tight">
                  Leave a Verified Review
                </h3>
              </div>

              <p className="text-[#1E1E1F] text-[15px] sm:text-[16px] xl:text-[17px] leading-relaxed">
                Search traders profile on TugaTrades and submit your review
                with proof of work completed such as an invoice or job photos.
              </p>
            </div>
          </div>
        </div>

        {/* BUTTON */}
        <div className="mt-12 flex justify-center relative z-10">
          <Link href="/review" className="bg-[#6E9625] hover:bg-[#5a7d1e] text-white font-bold py-3.5 px-9 rounded-[12px] transition-all cursor-pointer inline-block">
            Leave a Review
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;