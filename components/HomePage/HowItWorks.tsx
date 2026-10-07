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
      className="w-full py-16 md:py-24 bg-white px-4 sm:px-8 xl:px-12"
    >
      <div className="max-w-[1200px] mx-auto w-full">
        {/* TITLE */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-[34px] sm:text-[42px] md:text-[48px] font-extrabold leading-tight">
            <span className="text-[#6E9625]">How It</span>{" "}
            <span className="text-[#1E3A2B]">Works</span>
          </h2>
        </div>

        {/* TOP SECTION: 5 STEPS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 items-start">
          {postJobSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="flex flex-col">
                {/* Badge & Icon */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 rounded-[6px] bg-[#6E9625] text-white font-extrabold text-[13px] flex items-center justify-center shrink-0">
                    {step.num}
                  </div>
                  <Icon className="text-[#1E3A2B] w-7 h-7" strokeWidth={1.8} />
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
        <div className="mt-20 md:mt-24">
          <h3 className="text-[20px] sm:text-[22px] font-extrabold text-[#1E3A2B] mb-10">
            Or <span className="underline underline-offset-4 decoration-2">find</span> a trader yourself
          </h3>

          {/* 5-step horizontal flow */}
          <div className="w-full overflow-x-auto no-scrollbar py-3">
            <div className="flex items-center justify-between min-w-[720px] lg:min-w-0 w-full">
              {selfSearchSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <React.Fragment key={step.num}>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1A3326] text-white text-[14px] font-extrabold flex items-center justify-center shrink-0 shadow-sm">
                          {step.num}
                        </div>
                        <Icon className="text-[#1A3326] w-8 h-8 sm:w-9 sm:h-9" strokeWidth={2} />
                      </div>
                      <span className="text-[16px] sm:text-[17px] font-extrabold text-[#1A3326] mt-3">
                        {step.label}
                      </span>
                    </div>

                    {index < selfSearchSteps.length - 1 && (
                      <FiArrowRight className="text-gray-400 shrink-0" size={24} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
