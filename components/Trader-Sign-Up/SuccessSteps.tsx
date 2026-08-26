import React from 'react';
import { Store, Mail, Handshake, Star } from 'lucide-react';

const SuccessSteps = () => {
  const steps = [
    {
      Icon: Store,
      title: "Establish Presence",
      description: "Create a compelling business profile with verified details, high-quality images, and clear service offerings to stand out instantly."
    },
    {
      Icon: Mail,
      title: "Receive Enquiries",
      description: "Get matched with high-intent customers looking exactly for your expertise. Manage all leads efficiently in one centralized dashboard."
    },
    {
      Icon: Handshake,
      title: "Connect & Secure",
      description: "Communicate securely, send professional quotes, and finalize agreements seamlessly through our trusted platform tools."
    },
    {
      Icon: Star,
      title: "Build Reputation",
      description: "Collect verified reviews after successful projects to boost your ranking and automatically attract even more premium clients."
    }
  ];

  return (
    <section className="bg-[#243A24] pt-12 lg:pt-14 pb-18 lg:pb-20 px-6 lg:px-20">
      <div className="max-w-[1400px] mx-auto">
        {/* Section Title */}
        <h2 className="text-center text-[28px] sm:text-[36px] md:text-[44px] font-bold text-white mb-10 tracking-tight" style={{ fontFamily: "var(--font-bricolage)" }}>
          Four Steps to Success
        </h2>

        {/* Steps Grid */}
        <div className="relative">
          {/* Connecting Line (Horizontal on Desktop) */}
          <div className="hidden xl:block absolute top-[75px] lg:top-[95px] left-0 w-full h-[1px] bg-white/10 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-white rounded-[24px] p-6 sm:p-8 lg:p-10 flex flex-col items-center text-center shadow-2xl transition-all hover:-translate-y-2 duration-300 h-full border border-white/5"
              >
                {/* Icon Container */}
                <div className="w-20 h-20 rounded-[16px] flex items-center justify-center border border-[#E5E7EB] mb-10 shadow-sm">
                  <step.Icon size={32} className="text-[#1A3023]" />
                </div>

                {/* Content */}
                <h3 className="text-[20px] font-extrabold text-[#102417] mb-5 leading-tight" style={{ fontFamily: "var(--font-bricolage)" }}>
                  {step.title}
                </h3>
                <p className="text-[#4B5563] text-[14px] leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Subtext */}
        <div className="mt-16 md:mt-24 max-w-[1440px] mx-auto text-center px-4">
          <p className="text-[18px] sm:text-[24px] md:text-[30px] font-bold text-white leading-[1.4]" style={{ fontFamily: "var(--font-bricolage)" }}>
            Boost your visibility with a detailed profile, build trust with every review,<br className="hidden md:block" />
            and turn every opportunity into consistent business growth.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SuccessSteps;
