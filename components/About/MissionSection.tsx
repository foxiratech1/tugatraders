"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
import { HelpCircle, Check } from 'lucide-react';
import { scrollToTop } from '@/utils/scroll';

const MissionSection = () => {
  useEffect(() => {
    scrollToTop();
  }, []);

  return (
    <section className="bg-[#FAFAF9] pt-24 lg:pt-28 pb-16 lg:pb-20 px-4 sm:px-6 lg:px-20 overflow-hidden">
      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

        {/* LEFT CONTENT */}
        <div className="flex flex-col items-start">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#6E962512] border border-[#6E962526] px-3.5 py-1.5 rounded-full mb-6">
            <HelpCircle size={13} className="text-[#6E9625]" />

            <span className="text-[#6E9625] text-[10px] font-bold uppercase tracking-[0.15em]">
              Trusted Trades Platform
            </span>
          </div>

          {/* Heading */}
          <h1
            className="text-[46px] sm:text-[56px] lg:text-[64px] font-bold text-[#243A24] leading-[0.95] tracking-[-0.03em] mb-7"
            style={{ fontFamily: 'var(--font-bricolage)' }}
          >
            <span className="text-[#6E9625]">Our</span> Mission
            <br />
            & Vision
          </h1>

          {/* Paragraphs */}
          <div className="flex flex-col gap-7 max-w-[700px]">

            <p className="text-[#555555] text-[15px] leading-[1.8] font-medium">
              At TugaTrades, our vision is to strengthen communities by
              transforming every job into a success story. We connect
              homeowners and businesses with skilled, trusted
              tradespeople who take pride in delivering exceptional work.
            </p>

            <p className="text-[#555555] text-[14px] leading-[1.8] font-medium">
              Our mission is to link people in need of services with reliable
              experts, through quality, transparency, and trust.
            </p>

          </div>
        </div>

        {/* RIGHT IMAGE SIDE */}
        <div className="relative flex justify-center lg:justify-end">

          {/* Main Image Wrapper */}
          <div className="relative w-full max-w-[420px] h-[450px] rounded-[26px] overflow-visible">

            {/* Background Glow */}
            <div className="absolute -top-5 -left-5 w-full h-full rounded-[36px] bg-[#243A2408] blur-3xl" />

            {/* Main Image */}
            <div className="relative w-full h-full rounded-[24px] overflow-hidden shadow-[0_14px_40px_rgba(0,0,0,0.10)]">
              <Image
                src="/workers.png"
                alt="Mission Vision"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Floating Quote Card */}
            <div
              className="absolute top-[41px] -left-[78px] w-[270px] h-[170px] bg-[#FFFFFFB2]/60 rounded-[18px] p-4 z-20"
              style={{

                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0px 10px 40px rgba(0,0,0,0.06)',
              }}
            >

              {/* Quote Icon */}
              <div className="w-8 h-8 rounded-full bg-[#243A24] flex items-center justify-center mb-3">
                <span className="text-white text-[22px] font-bold leading-none mt-1">
                  “
                </span>
              </div>

              <p className="text-[#243A24] text-[12px] leading-[1.65] font-medium">
                Connecting you with skilled tradespeople
                you can rely on - delivering every job with
                expertise, quality, and transparency, while
                creating meaningful opportunities for
                tradespeople.
              </p>
            </div>

            {/* Why Choose Us Card */}
            <div
              className="absolute bottom-[18px] left-[300px] w-[256px] h-[176px] bg-[#FFFFFFB2]/60 rounded-[18px] p-4 z-20 border-[#FFFFFF4D]/30"
              style={{

                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',

              }}
            >

              <h3 className="text-[14px] font-bold text-[#243A24] mb-4">
                Why Choose Us?
              </h3>

              <div className="flex flex-col gap-3">

                {/* Item */}
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#6E9625] flex items-center justify-center shrink-0">
                    <Check size={9} className="text-white stroke-[3]" />
                  </div>

                  <span className="text-[12px] font-medium text-[#555555]">
                    Vetted Tradespeople
                  </span>
                </div>

                {/* Item */}
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#6E9625] flex items-center justify-center shrink-0">
                    <Check size={9} className="text-white stroke-[3]" />
                  </div>

                  <span className="text-[12px] font-medium text-[#555555]">
                    Free Quotes
                  </span>
                </div>

                {/* Item */}
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#6E9625] flex items-center justify-center shrink-0">
                    <Check size={9} className="text-white stroke-[3]" />
                  </div>

                  <span className="text-[12px] font-medium text-[#555555]">
                    Trusted Reviews
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default MissionSection;