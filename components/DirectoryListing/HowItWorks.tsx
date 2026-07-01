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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            {/* IMAGE */}
            <div className="relative w-full aspect-square md:aspect-auto md:h-[360px]">
              <Image
                src="/system1.png"
                alt="Find & Contact a Trader"
                fill
                className="object-contain md:object-right"
                unoptimized
              />
            </div>

            {/* CONTENT */}
            <div className="flex flex-col items-start w-full max-w-[420px] mx-auto md:mx-0">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-[46px] h-[46px] bg-[#243A24] rounded-[14px] flex items-center justify-center text-white text-[22px] font-bold shrink-0">
                  1
                </div>

                <h3 className="text-[26px] font-bold text-[#000000] leading-tight">
                  Find & Contact a Trader
                </h3>
              </div>

              <p className="text-[#000000] text-[17px] leading-relaxed">
                Browse the directory, compare local tradespeople, and contact
                the trader that best fits your job.
              </p>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            {/* IMAGE */}
            <div className="order-1 md:order-2 relative w-full aspect-square md:aspect-auto md:h-[360px]">
              <Image
                src="/system2.png"
                alt="Job Complete"
                fill
                className="object-contain md:object-left"
                unoptimized
              />
            </div>

            {/* CONTENT */}
            <div className="order-2 md:order-1 flex flex-col items-start w-full max-w-[420px] mx-auto md:mx-0 md:ml-auto">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-[46px] h-[46px] bg-[#243A24] rounded-[14px] flex items-center justify-center text-white text-[22px] font-bold shrink-0">
                  2
                </div>

                <h3 className="text-[26px] font-bold text-[#000000] leading-tight">
                  Job Complete
                </h3>
              </div>

              <p className="text-[#1E1E1F] text-[17px] leading-relaxed">
                Agree the work directly with the trader and complete the job
                outside the platform.
              </p>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            {/* IMAGE */}
            <div className="relative w-full aspect-square md:aspect-auto md:h-[360px]">
              <Image
                src="/system3.png"
                alt="Leave a Verified Review"
                fill
                className="object-contain md:object-right"
                unoptimized
              />
            </div>

            {/* CONTENT */}
            <div className="flex flex-col items-start w-full max-w-[420px] mx-auto md:mx-0">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-[46px] h-[46px] bg-[#243A24] rounded-[14px] flex items-center justify-center text-white text-[22px] font-bold shrink-0">
                  3
                </div>

                <h3 className="text-[26px] font-bold text-[#1F1F1F] leading-tight">
                  Leave a Verified Review
                </h3>
              </div>

              <p className="text-[#1E1E1F] text-[17px] leading-relaxed">
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