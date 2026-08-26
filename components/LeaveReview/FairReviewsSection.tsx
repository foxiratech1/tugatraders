"use client";

import React, { useState } from "react";
import { TbAlertTriangleFilled } from "react-icons/tb";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const FairReviewsSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="bg-[#F8F9F5] px-4 sm:px-6 lg:px-20 relative py-6">
      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 xl:grid-cols-2 gap-5 xl:gap-8 items-stretch">

        {/* Left Card */}
        <div className="bg-white rounded-[24px] border border-[#243A241F] shadow-[0_15px_40px_rgba(0,0,0,0.02)] overflow-hidden relative flex flex-col">

          {/* HEADER */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-start justify-between gap-3 p-6 sm:p-7 xl:p-10 text-left cursor-pointer"
          >
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">

              {/* ICON */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 xl:w-12 xl:h-12 bg-[#C60C030D] border border-[#C60C031A] rounded-[16px] flex items-center justify-center shrink-0">
                <TbAlertTriangleFilled
                  size={18}
                  className="text-[#C60C03]"
                />
              </div>

              {/* TITLE */}
              <h3
                className="text-[15px] sm:text-[18px] xl:text-[20px] font-bold text-[#243A24] leading-snug"
                style={{ fontFamily: "var(--font-bricolage)" }}
              >
                Fair Reviews & Full Transparency?
              </h3>
            </div>

            {/* ARROW */}
            <ChevronDown
              size={20}
              className={`text-[#243A24] shrink-0 mt-1 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {/* COLLAPSIBLE CONTENT */}
          <div
            className={`transition-all duration-500 overflow-hidden ${isOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            {/* Divider */}
            <div className="border-t border-[#243A241F]"></div>

            {/* CONTENT */}
            <div className="px-6 sm:px-7 xl:px-10 py-6">
              <p className="text-[#555555] text-[13px] sm:text-[14px] xl:text-[15px] leading-relaxed font-medium">
                Occasionally, a trusted trader may receive a negative review. If
                this happens, we encourage customers to speak directly with the
                trader first and try to reach a mutually agreed outcome. As a
                platform, we connect customers with traders but do not manage
                jobs or disputes.
              </p>
            </div>
          </div>
        </div>

        {/* Right Card */}
        <div className="bg-[#243A24] rounded-[24px] rounded-bl-none p-6 sm:p-7 xl:p-10 text-left relative shadow-[0_15px_40px_rgba(0,0,0,0.02)] flex flex-col justify-center min-h-[220px] sm:min-h-[250px] mt-2 xl:mt-0">

          {/* Tail */}
          <div className="absolute -bottom-4 left-0 w-6 h-6 bg-[#243A24] [clip-path:polygon(0_0,_100%_0,_0_100%)]" />

          <div className="relative z-10">
            <h2
              className="text-[22px] sm:text-[24px] xl:text-[28px] font-bold text-white leading-tight mb-3 sm:mb-4"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              We're here to support the community.
            </h2>

            <p className="text-white/80 text-[13px] sm:text-[14px] xl:text-[15px] leading-relaxed font-medium">
              We act solely as a connection platform and are not responsible for
              any work carried out by traders. However, if you are not
              satisfied, please{" "}
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