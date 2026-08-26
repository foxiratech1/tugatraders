"use client";

import React, { useEffect } from 'react';
import { IdCard, Briefcase, FileText, Check, Info } from 'lucide-react';

const VettingSection = () => {
  const vettingSteps = [
    {
      title: "Identity verification",
      icon: <IdCard className="w-7 h-7 text-[#1A2E1A]" />,
    },
    {
      title: "Business details",
      icon: <Briefcase className="w-7 h-7 text-[#1A2E1A]" />,
    },
    {
      title: "Basic trade information",
      icon: <FileText className="w-7 h-7 text-[#1A2E1A]" />,
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
    <section id="vetting-section" className="py-16 px-4 font-sans bg-[#F8F9F7]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#0A2619] mb-4">
            How <span className="text-[#6E9625]">Vetting</span> Works
          </h2>
          <p className="text-[#0A2619B2] text-[16px] md:text-lg max-w-2xl leading-relaxed">
            To maintain quality on our platform, all traders go through a vetting<br className="hidden md:block" />
            process before their profile goes live.
          </p>
        </div>

        {/* Grid Section */}
        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold text-[#0A2619]">What we check:</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-10 max-w-[860px] mx-auto">
          {vettingSteps.map((step, index) => (
            <div
              key={index}
              className="bg-[#D6DED0] border border-[#C4CEBE] rounded-[22px] p-4 md:p-5 flex flex-row md:flex-col items-center md:justify-between gap-4 md:gap-0 min-h-0 md:min-h-[210px] shadow-sm hover:shadow-md transition-all text-left md:text-center"
            >
              <div className="bg-white p-2.5 md:p-3 rounded-[14px] md:rounded-[16px] shadow-sm md:mb-4 md:mt-1 flex-shrink-0">
                {step.icon}
              </div>

              <h4 className="text-[15px] md:text-[16px] font-bold text-[#0A2619] md:px-1 leading-snug flex-1">
                {step.title}
              </h4>

              <div className="mt-0 md:mt-auto md:mb-1 flex-shrink-0">
                <div className="w-7 h-7 bg-[#0A26190D] border border-[#0A26191A] rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-[#0A2619] opacity-40" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Note Box */}
        <div className="bg-white border border-[#0A26191A] rounded-[24px] p-5 shadow-sm max-w-[820px] mx-auto">
          <div className="flex items-start gap-4 mb-4">
            <div className="mt-1">
              <Info className="w-5 h-5 text-gray-400" />
            </div>
            <h5 className="text-[16px] font-bold text-[#0A2619]">Please note:</h5>
          </div>

          <ul className="space-y-2 ml-7">
            {[
              "Vetting is based on the information you provide",
              "It does not guarantee approval",
              "It does not guarantee job leads or work",
              "Additional information may be requested",
            ].map((item, index) => (
              <li key={index} className="text-[#0A2619CC] text-[13px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default VettingSection;
