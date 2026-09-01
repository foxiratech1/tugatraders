"use client";

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, BadgeCheck, Star } from 'lucide-react';
import { IoShieldHalfSharp } from "react-icons/io5";

const FeedbackSection = () => {
  return (
    <section className="bg-[#FAFAF9] pt-28 pb-10 xl:pb-12 px-4 sm:px-6 xl:px-20 overflow-hidden flex items-center">
      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 xl:grid-cols-12 gap-12 xl:gap-20 items-center">

        {/* Left Column (Content) */}
        <div className="xl:col-span-5 w-full xl:w-[638px] flex flex-col items-start pr-0 xl:pr-4 animate-fade-in">
          {/* Verified Badge */}
          <div className="inline-flex items-center gap-2 bg-[#6E96250F] border border-[#6E96251A] px-3 py-1 rounded-full mb-5">
            <BadgeCheck size={14} className="text-[#6E9625]" />
            <span className="text-[#6E9625] text-[10px] font-extrabold tracking-wider uppercase">
              Verified Reviews
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-[28px] sm:text-[34px] md:text-[38px] xl:text-[46px] font-bold text-[#243A24] leading-[1.15] mb-5 tracking-tight animate-slide-up" style={{ fontFamily: 'var(--font-bricolage)' }}>
            Your Feedback Helps Others Find <span className="text-[#6E9625]">Reliable</span> Tradespeople
          </h1>

          {/* Description */}
          <p className="text-[#243A2480] text-[14px] md:text-[15px] font-medium leading-relaxed max-w-[480px]">
            TugaTrades is built on trust. Share your experience to help the community
            connect with the best professionals in the industry.
          </p>
        </div>

        {/* Right Column (Images and Cards) */}
        <div className="xl:col-span-7 flex justify-center xl:justify-end relative w-full">
          <div className="relative w-full max-w-[320px] sm:max-w-[400px] aspect-[400/360] xl:max-w-[400px] xl:h-[420px] xl:aspect-auto xl:ml-auto mt-8 xl:mt-0">

            {/* Background Decorative Glass Card */}
            <div
              className="absolute -top-4 -left-4 w-full h-full rounded-[32px] border border-white/25 -z-10"
              style={{
                backgroundImage: 'linear-gradient(45deg, rgba(193, 204, 184, 0.2) 0%, rgba(193, 204, 184, 0) 100%)',
                backgroundColor: '#243A240D',
                backdropFilter: 'blur(64px)',
                WebkitBackdropFilter: 'blur(64px)'
              }}
            />

            {/* Main image of the tradesman */}
            <div className="w-full h-full rounded-[24px] overflow-hidden relative shadow-lg">
              <Image
                src="/man.png"
                alt="Verified Tradesperson"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Bottom-Left Floating Card: Verified Professional */}


            {/* Top-Right Floating Card: Customer Review */}
            <div className="absolute left-2 sm:-left-6 md:-left-8 xl:-left-10 bottom-[8%] bg-white rounded-[14px] p-2.5 sm:p-3 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-[#243A241F] flex flex-col gap-2 w-[180px] sm:w-[210px] md:w-[230px] z-10 animate-fade-in">
              <div className="flex items-center gap-2.5">
                {/* Avatar */}
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full overflow-hidden relative shrink-0">
                  <Image
                    src="/customer2.png"
                    alt="Maria S."
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="text-left flex-1">
                  <h4 className="text-[12px] sm:text-[13px] font-bold text-[#111111]">Maria S.</h4>
                  {/* Gold Stars */}
                  <div className="flex gap-1 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} className="text-[#FACC15] sm:w-[10px] sm:h-[10px]" fill="currentColor" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[#555555] text-[10px] sm:text-[11px] leading-relaxed font-medium italic">
                "Excellent work on the plumbing, very clean and professional. Highly recommended!"
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default FeedbackSection;
