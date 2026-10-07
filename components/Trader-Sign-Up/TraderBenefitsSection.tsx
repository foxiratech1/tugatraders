import React from 'react';
import { Check } from 'lucide-react';

const TraderBenefitsSection = () => {
  const benefitsLeft = [
    {
      bold: "Exclusive membership",
      text: " – Join a select network of professionals",
    },
    {
      bold: "Personal company profile",
      text: " – Highlight your skills and experience.",
    },
    {
      bold: "Job portfolio",
      text: " – Display images & videos of your completed work.",
    },
    {
      bold: "Quality leads",
      text: " – Receive relevant enquiries from clients across Portugal.",
    },
    {
      bold: "Flexible membership options",
      text: " –  First 3 months FREE! Choose a monthly or yearly plan after your free period.",
    },
  ];

  const benefitsRight = [
    {
      bold: "No commission fees",
      text: " – Never pay for the leads you receive.",
    },
    {
      bold: "Client reviews",
      text: " – Showcase genuine feedback from past verified clients.",
    },
    {
      bold: "Be found on Google",
      text: " – Boost your visibility and get discovered by more clients online.",
    },
    {
      bold: "Flexible subscription tiers",
      text: " – Choose from Bronze, Silver, or Gold plans.",
    },
  ];

  return (
    <section className="bg-white py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[940px] mx-auto">
        <div className="bg-[#F4F6F2] rounded-[24px] px-6 py-7 sm:px-9 sm:py-8 border border-[#E6EDE2]/60 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-4 sm:gap-y-4.5">

            {/* Left Column */}
            <div className="space-y-4 sm:space-y-4.5">
              {benefitsLeft.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-[22px] h-[22px] rounded-full bg-[#3B6622] flex items-center justify-center shrink-0 mt-[2px] shadow-sm">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3.5} />
                  </div>
                  <p className="text-[14px] sm:text-[14.5px] text-[#4A5548] leading-[1.48]">
                    <span className="font-bold text-[#1C2C1C]">{item.bold}</span>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-4.5">
              {benefitsRight.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-[22px] h-[22px] rounded-full bg-[#3B6622] flex items-center justify-center shrink-0 mt-[2px] shadow-sm">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3.5} />
                  </div>
                  <p className="text-[14px] sm:text-[14.5px] text-[#4A5548] leading-[1.48]">
                    <span className="font-bold text-[#1C2C1C]">{item.bold}</span>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default TraderBenefitsSection;
