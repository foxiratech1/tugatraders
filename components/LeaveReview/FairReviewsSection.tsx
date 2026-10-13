"use client";

import React, { useState } from "react";
import { TbAlertTriangleFilled } from "react-icons/tb";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const FairReviewsSection = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="bg-[#F8F9F5] px-4 sm:px-6 lg:px-20 relative pt-2 pb-12 sm:pb-16">
      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 items-stretch">

        {/* Left Card */}
        <div className="bg-white rounded-[24px] border border-[#243A241F] shadow-[0_15px_40px_rgba(0,0,0,0.02)] overflow-hidden relative flex flex-col justify-start">
          {/* HEADER TOGGLE BUTTON */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between gap-3 p-6 sm:p-7 xl:p-9 text-left cursor-pointer transition-colors hover:bg-gray-50/50"
          >
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              {/* ICON */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#C60C030D] border border-[#C60C031A] rounded-[14px] sm:rounded-[16px] flex items-center justify-center shrink-0">
                <TbAlertTriangleFilled
                  size={18}
                  className="text-[#C60C03]"
                />
              </div>

              {/* TITLE */}
              <h3
                className="text-[17px] sm:text-[19px] xl:text-[21px] font-bold text-[#243A24] leading-snug"
                style={{ fontFamily: "var(--font-bricolage)" }}
              >
                Fair Reviews &amp; Full Transparency?
              </h3>
            </div>

            {/* ARROW */}
            <ChevronDown
              size={20}
              className={`text-[#243A24] shrink-0 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* COLLAPSIBLE CONTENT */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {/* Divider */}
            <div className="border-t border-[#243A241F] mx-6 sm:mx-7 xl:mx-9"></div>

            {/* CONTENT */}
            <div className="px-6 sm:px-7 xl:px-9 py-5 sm:py-6">
              <p className="text-[#555555] text-[13px] sm:text-[14px] xl:text-[14.5px] leading-relaxed font-medium">
                Occasionally, a tradesperson may receive a negative review. If
                this happens, we encourage customers to speak directly with the
                trader first and try to reach a mutually agreed outcome. As a
                platform, we connect customers with traders but do not manage
                jobs or disputes.
              </p>
            </div>
          </div>
        </div>

        {/* Right Card */}
        <div className="bg-[#243A24] rounded-[24px] rounded-bl-none p-6 sm:p-7 xl:p-9 text-left relative shadow-[0_15px_40px_rgba(0,0,0,0.02)] flex flex-col justify-center min-h-[200px] sm:min-h-[220px] mt-2 lg:mt-0">

          {/* Tail */}
          <div className="absolute -bottom-4 left-0 w-6 h-6 bg-[#243A24] [clip-path:polygon(0_0,_100%_0,_0_100%)]" />

          <div className="relative z-10">
            <h2
              className="text-[18px] sm:text-[21px] lg:text-[23px] xl:text-[25px] font-bold text-white leading-tight mb-3 sm:mb-3.5 whitespace-normal sm:whitespace-nowrap"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              We&apos;re here to <span className="text-[#6E9625]">support</span> the community.
            </h2>

            <p className="text-white/80 text-[13px] sm:text-[14px] xl:text-[14.5px] leading-relaxed font-medium">
              We act solely as a connection platform and are not responsible for
              any work carried out by traders. For any questions , concerns or support
              please{" "}
              <Link
                href="/contact"
                className="text-white underline underline-offset-4 hover:text-white/95 transition-colors font-bold"
              >
                contact
              </Link>{" "}
              our support team.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FairReviewsSection;