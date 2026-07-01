"use client";

import React from 'react';

const QuoteBanner = () => {
  return (
    <section className="bg-[#F8F9F5] py-6 lg:py-8 px-6 lg:px-20 overflow-hidden flex items-center justify-center">
      <div className="max-w-[1200px] mx-auto w-full">
        <div className="bg-white rounded-[24px] border border-[#CFE3B4] py-8 px-6 md:py-10 md:px-14 text-center shadow-[0_4px_30px_rgba(36,58,36,0.02)] animate-fade-in">
          <p
            className="text-[#243A24] text-[18px] sm:text-[22px] md:text-[26px] lg:text-[28px] font-bold leading-relaxed tracking-tight max-w-[860px] mx-auto"
            style={{ fontFamily: 'var(--font-bricolage)' }}
          >
            “TugaTrades connects people through a platform<br /> where{" "}
            <span className="text-[#6E9625]">trust and quality</span>{" "}
            shape every interaction.”
          </p>
        </div>
      </div>
    </section>
  );
};

export default QuoteBanner;
