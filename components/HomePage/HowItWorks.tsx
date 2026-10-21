"use client";

import React, { useEffect } from "react";
import { FiSearch, FiLink, FiStar, FiArrowRight } from "react-icons/fi";
import { LuFileText, LuMessageSquare, LuUserCheck, LuSlidersHorizontal } from "react-icons/lu";
import { FaHandshake } from "react-icons/fa6";

const postJobSteps = [
  {
    num: 1,
    icon: LuFileText,
    title: "Post Your Job",
    desc: "Tell us what you need – add a few details and photos.",
  },
  {
    num: 2,
    icon: LuMessageSquare,
    title: "Get Quotes",
    desc: "Receive up to 3 responses from vetted tradespeople.",
  },
  {
    num: 3,
    icon: LuUserCheck,
    title: "Compare & Choose",
    desc: "Review profiles, ratings and quotes. Select the right professional for you.",
  },
  {
    num: 4,
    icon: FaHandshake,
    title: "Get The Job Done",
    desc: "You and the trader agree on the terms, timeline and price.",
  },
  {
    num: 5,
    icon: FiStar,
    title: "Leave a review",
    desc: "Help others by sharing your experience.",
  },
];

const selfSearchSteps = [
  {
    num: 1,
    icon: FiSearch,
    label: "Search",
  },
  {
    num: 2,
    icon: LuSlidersHorizontal,
    label: "Compare",
  },
  {
    num: 3,
    icon: FiLink,
    label: "Connect",
  },
  {
    num: 4,
    icon: FaHandshake,
    label: "Agree",
  },
  {
    num: 5,
    icon: FiStar,
    label: "Review",
  },
];

export default function HowItWorks() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#how-it-works") {
      setTimeout(() => {
        const el = document.getElementById("how-it-works");
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 300);
    }
  }, []);

  return (
    <section
      id="how-it-works"
      className="w-full pt-6 pb-12 sm:pt-8 sm:pb-16 md:pt-10 md:pb-20 bg-white px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-[1200px] mx-auto w-full">
        {/* TITLE */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-[34px] sm:text-[42px] md:text-[48px] font-extrabold leading-tight">
            <span className="text-[#6E9625]">How</span>{" "}
            <span className="text-[#1E3A2B]">It Works</span>
          </h2>
        </div>

        {/* TOP SECTION: 5 STEPS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 items-start">
          {postJobSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="flex flex-col">
                {/* Badge & Icon */}
                <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
                  <div className="w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] rounded-[5px] bg-[#6E9625] text-white font-extrabold text-[11px] sm:text-[12px] flex items-center justify-center shrink-0">
                    {step.num}
                  </div>
                  <Icon className="text-[#1E3A2B] w-8 h-8 sm:w-9 sm:h-9" strokeWidth={1.8} />
                </div>

                {/* Title */}
                <h3 className="text-[16px] sm:text-[17px] font-extrabold text-[#1E3A2B] leading-snug mb-2">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-[13px] text-[#4A5548] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* BOTTOM SECTION: Or find a trader yourself */}
        <div className="mt-14 md:mt-16">
          <h3 className="text-[20px] sm:text-[22px] font-extrabold text-[#1E3A2B] mb-8 text-left">
            Or <span className="underline underline-offset-4 decoration-2">find</span> a trader yourself
          </h3>

          {/* 5-step horizontal flow aligned identically with 5 columns above */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 items-start">
            {selfSearchSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="relative flex flex-col items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] rounded-[5px] bg-[#1A3326] text-white text-[11px] sm:text-[12px] font-extrabold flex items-center justify-center shrink-0 shadow-xs">
                      {step.num}
                    </div>
                    <Icon className="text-[#1A3326] w-8 h-8 sm:w-9 sm:h-9" strokeWidth={1.9} />
                  </div>
                  <span className="text-[15px] sm:text-[16px] font-extrabold text-[#1A3326] mt-4 sm:mt-5">
                    {step.label}
                  </span>

                  {/* Connecting arrow for desktop, neatly centered in the gap between columns */}
                  {index < selfSearchSteps.length - 1 && (
                    <div className="hidden lg:flex absolute -right-3 xl:-right-3.5 top-1.5 text-gray-400 items-center justify-center pointer-events-none">
                      <FiArrowRight size={20} className="text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
