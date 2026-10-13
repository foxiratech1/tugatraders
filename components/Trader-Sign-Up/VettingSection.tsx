"use client";

import React, { useEffect } from 'react';
import { IdCard, Briefcase, FileText, Check, Info } from 'lucide-react';

const VettingSection = () => {
  const vettingSteps = [
    {
      title: "Identity verification",
      icon: <IdCard className="w-9 h-9 text-[#6E9625]" strokeWidth={1.8} />,
    },
    {
      title: "Business details",
      icon: <Briefcase className="w-9 h-9 text-[#6E9625]" strokeWidth={1.8} />,
    },
    {
      title: "Basic trade information",
      icon: <FileText className="w-9 h-9 text-[#6E9625]" strokeWidth={1.8} />,
    },
  ];

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#vetting-section") {
      setTimeout(() => {
        const el = document.getElementById('vetting-section');
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 300);
    }
  }, []);

  return (
    <section id="vetting-section" className="bg-white py-8 sm:py-10 md:py-12 px-4 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="text-left mb-6 sm:mb-8">
          <h2 className="text-[28px] sm:text-[34px] md:text-[38px] font-extrabold text-[#1E3A2B] leading-tight tracking-tight mb-2">
            <span className="text-[#6E9625]">Vetting</span> Process
          </h2>
          <p className="text-[14px] sm:text-[15px] text-[#4A5548] leading-relaxed md:whitespace-nowrap">
            To maintain quality on our platform, all traders go through a vetting process during signup and before their profile goes live.
          </p>
        </div>

        {/* Unified 3-Item Vetting Box */}
        <div className="border border-[#E2E8F0] rounded-[16px] py-8 sm:py-10 px-6 sm:px-12 mb-6 sm:mb-8 bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 text-center items-center">
            {vettingSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center justify-between min-h-[140px] gap-3">
                {/* Green Icon */}
                <div className="flex items-center justify-center shrink-0">
                  {step.icon}
                </div>

                {/* Title */}
                <h3 className="text-[16px] sm:text-[17px] font-bold text-[#1E3A2B] leading-tight max-w-[200px]">
                  {step.title}
                </h3>

                {/* Solid Green Checkmark Circle */}
                <div className="w-7 h-7 rounded-full bg-[#6E9625] text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note List */}
        <div className="flex flex-col gap-2 text-left">
          <div className="flex items-center gap-2 text-[#1E3A2B] font-bold text-[14px] sm:text-[15px]">
            <Info className="w-4 h-4 text-[#4A5548] shrink-0" />
            <span>Please note:</span>
          </div>

          <ul className="space-y-1.5 text-[13px] sm:text-[13.5px] text-[#4A5548] list-disc list-inside pl-1">
            <li>Vetting is based on the information you provide</li>
            <li>It does not guarantee approval</li>
            <li>It does not guarantee job leads or work</li>
            <li>Additional information may be requested</li>
          </ul>
        </div>

      </div>
    </section>
  );
};

export default VettingSection;
