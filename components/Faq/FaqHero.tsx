"use client";

import React from "react";
import Image from "next/image";

const FaqHero = () => {
  return (
    <section className="bg-[#FAFAF9] pt-[80px] sm:pt-[85px] lg:pt-[95px] pb-8 lg:pb-10 px-4 sm:px-6 lg:px-10 xl:px-20 overflow-hidden flex items-center justify-center">

      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-12 items-center">

        {/* LEFT CONTENT */}
        <div className="xl:col-span-6 flex flex-col justify-center items-center xl:items-start text-center xl:text-left animate-fade-in max-w-full">

          {/* HEADING */}
          <h1
            className="text-[32px] sm:text-[38px] md:text-[42px] lg:text-[46px] xl:text-[46px] font-bold text-[#243A24] leading-[1.05] mb-4 tracking-tight"
            style={{
              fontFamily: "var(--font-bricolage)",
            }}
          >
            Frequently Asked
            <br />

            <span className="text-[#6E9625]">
              Questions
            </span>
          </h1>

          {/* SUBTITLE */}
          <p className="text-[#555555] text-[12px] sm:text-[13px] md:text-[13px] lg:text-[13px] font-medium leading-[1.6] max-w-[420px] mx-auto xl:mx-0">
            Find answers to all your questions about our platform.
            Whether you're looking for a pro or looking for work,
            we've got you covered.
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <div className="xl:col-span-6 flex justify-center xl:justify-end items-center w-full mt-4 xl:mt-0">

          <div className="relative w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[440px] aspect-[550/330] rounded-[20px] sm:rounded-[24px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-[#243A240A]">

            <Image
              src="/faq.png"
              alt="Frequently Asked Questions"
              fill
              className="object-cover"
              unoptimized
            />

          </div>
        </div>

      </div>
    </section>
  );
};

export default FaqHero;