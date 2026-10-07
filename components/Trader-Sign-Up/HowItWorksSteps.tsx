import React from 'react';
import { Pencil, Check, MessageCircleMore, Handshake, Star } from 'lucide-react';

const HowItWorksSteps = () => {
  const steps = [
    {
      number: 1,
      icon: <Pencil className="w-7 h-7 text-[#1C2C1C]" strokeWidth={2.4} />,
      title: "Sign Up & Create Your Profile",
      description: "Join TugaTrades and create your professional trader profile.",
    },
    {
      number: 2,
      icon: <Check className="w-7 h-7 text-[#1C2C1C]" strokeWidth={3} />,
      title: "Get Vetted & Go Live",
      description: "Complete the relevant checks and activate your profile.",
    },
    {
      number: 3,
      icon: <MessageCircleMore className="w-7 h-7 text-[#1C2C1C]" strokeWidth={2} />,
      title: "Send Quotes & Respond to Enquiries",
      description:
        "Receive relevant job notifications, and appear in the TugaTrades directory so customers can find you.",
    },
    {
      number: 4,
      icon: <Handshake className="w-7 h-7 text-[#1C2C1C]" strokeWidth={2} />,
      title: "Connect, Agree & Complete",
      description:
        "Talk directly with the customer, agree the price and details, then complete the work.",
    },
    {
      number: 5,
      icon: <Star className="w-7 h-7 text-[#1C2C1C]" strokeWidth={2} />,
      title: "Get Reviewed",
      description:
        "The customer leaves a review based on their experience, helping you build your reputation",
    },
  ];

  return (
    <section className="bg-white py-14 sm:py-18 lg:py-22 px-6 lg:px-12 xl:px-16 overflow-hidden">
      <div className="max-w-[1300px] mx-auto">
        
        {/* Centered Heading */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-[32px] sm:text-[38px] lg:text-[44px] font-extrabold text-[#1E3A2B] leading-tight tracking-tight">
            <span className="text-[#6E9625]">How</span> It Works
          </h2>
        </div>

        {/* 5 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-6 lg:gap-5 xl:gap-8 items-start">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col">
              {/* Badge + Icon Header */}
              <div className="flex items-center gap-3 mb-3.5">
                <div className="w-[25px] h-[25px] rounded-[5px] bg-[#6E9625] text-white text-[13px] font-bold flex items-center justify-center shrink-0 shadow-sm">
                  {step.number}
                </div>
                <div className="flex items-center justify-center shrink-0">
                  {step.icon}
                </div>
              </div>

              {/* Step Title */}
              <h3 className="text-[16px] sm:text-[17px] font-bold text-[#1C2C1C] leading-snug mb-2">
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
