"use client";

import React, { useEffect } from 'react';
import { Pencil, Check, MessageCircleMore, Handshake, Star } from 'lucide-react';

const HowItWorksSteps = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && (window.location.hash === "#how-it-works" || window.location.hash === "#how-it-works-steps")) {
      setTimeout(() => {
        const el = document.getElementById('how-it-works');
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 300);
    }
  }, []);

  const steps = [
    {
      number: 1,
      icon: <Pencil className="w-6 h-6 text-[#1C2C1C]" strokeWidth={2.4} />,
      title: "Sign Up & Create Your Profile",
      description: "Join TugaTrades and create your professional trader profile.",
    },
    {
      number: 2,
      icon: <Check className="w-6 h-6 text-[#1C2C1C]" strokeWidth={3} />,
      title: "Get Vetted & Go Live",
      description: "Complete the relevant checks and activate your profile.",
    },
    {
      number: 3,
      icon: <MessageCircleMore className="w-6 h-6 text-[#1C2C1C]" strokeWidth={2} />,
      title: "Send Quotes & Respond to Enquiries",
      description:
        "Receive relevant job notifications, and appear in the TugaTrades directory so customers can find you.",
    },
    {
      number: 4,
      icon: <Handshake className="w-6 h-6 text-[#1C2C1C]" strokeWidth={2} />,
      title: "Connect, Agree & Complete",
      description:
        "Talk directly with the customer, agree the price and details, then complete the work.",
    },
    {
      number: 5,
      icon: <Star className="w-6 h-6 text-[#1C2C1C]" strokeWidth={2} />,
      title: "Get Reviewed",
      description:
        "The customer leaves a review based on their experience, helping you build your reputation",
    },
  ];

  return (
    <section id="how-it-works" className="bg-white py-8 sm:py-10 md:py-12 px-4 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">

        {/* Centered Heading */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-[28px] sm:text-[34px] md:text-[38px] font-extrabold text-[#1E3A2B] leading-tight tracking-tight">
            <span className="text-[#6E9625]">How</span> It Works
          </h2>
        </div>

        {/* 5 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-6 lg:gap-6 xl:gap-8 items-start">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col">
              {/* Badge + Icon Header */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-[24px] h-[24px] sm:w-[26px] sm:h-[26px] rounded-[5px] bg-[#6E9625] text-white text-[13px] sm:text-[14px] font-bold flex items-center justify-center shrink-0 shadow-sm">
                  {step.number}
                </div>
                <div className="flex items-center justify-center shrink-0">
                  {step.icon}
                </div>
              </div>

              {/* Step Title */}
              <h3 className="text-[15px] sm:text-[16px] font-bold text-[#1C2C1C] leading-snug mb-2">
                {step.title}
              </h3>

              {/* Step Description */}
              <p className="text-[13px] sm:text-[13.5px] text-[#4A5548] leading-relaxed font-normal">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorksSteps;
