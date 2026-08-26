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
          <div className="inline-flex items-center gap-2 bg-[#6E96250F] border border-[#6E96251A] px-4 py-1.5 rounded-full mb-6">
            <BadgeCheck size={14} className="text-[#6E9625]" />
            <span className="text-[#6E9625] text-[11px] font-extrabold tracking-wider uppercase">
              Verified Reviews
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-[32px] sm:text-[38px] md:text-[44px] xl:text-[55px] font-bold text-[#243A24] leading-[1.15] mb-6 tracking-tight animate-slide-up" style={{ fontFamily: 'var(--font-bricolage)' }}>
            Your Feedback Helps Others Find <span className="text-[#6E9625]">Reliable</span> Tradespeople
          </h1>

          {/* Description */}
          <p className="text-[#243A2480] text-[15px] md:text-[16px] font-medium leading-relaxed max-w-[520px]">
            TugaTrades is built on trust. Share your experience to help the community

            connect with the best professionals in the industry.
          </p>
        </div>

        {/* Right Column (Images and Cards) */}
        <div className="xl:col-span-7 flex justify-center xl:justify-end relative w-full">
          <div className="relative w-full max-w-[400px] sm:max-w-[480px] aspect-[500/440] xl:max-w-[480px] xl:h-[500px] xl:aspect-auto xl:ml-auto mt-8 xl:mt-0">

            {/* Background Decorative Glass Card */}
            <div
              className="absolute -top-5 -left-5 w-full h-full rounded-[40px] border border-white/25 -z-10"
              style={{
                backgroundImage: 'linear-gradient(45deg, rgba(193, 204, 184, 0.2) 0%, rgba(193, 204, 184, 0) 100%)',
                backgroundColor: '#243A240D',
                backdropFilter: 'blur(64px)',
                WebkitBackdropFilter: 'blur(64px)'
              }}
            />

            {/* Main image of the tradesman */}
            <div className="w-full h-full rounded-[32px] overflow-hidden relative shadow-lg">
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
            <div className="absolute left-2 sm:-left-4 md:-left-10 xl:-left-12 bottom-[6%] bg-white rounded-[16px] p-3 sm:p-4 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-[#243A241F] flex flex-col gap-3 w-[210px] sm:w-[235px] md:w-[260px] z-10 animate-fade-in">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden relative shrink-0">
                  <Image
                    src="/customer2.png"
                    alt="Maria S."
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="text-left flex-1">
                  <h4 className="text-[13px] sm:text-[14px] font-bold text-[#111111]">Maria S.</h4>
                  {/* Gold Stars */}
                  <div className="flex gap-1 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} className="text-[#FACC15] sm:w-[12px] sm:h-[12px]" fill="currentColor" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[#555555] text-[11px] sm:text-[12px] leading-relaxed font-medium italic">
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
