import React from 'react';
import Image from 'next/image';
import { FaUser, FaThumbsUp, FaHandshake } from 'react-icons/fa6';
import { FiBell, FiStar } from 'react-icons/fi';

const WhyJoinSection = () => {
  const leftFeatures = [
    {
      icon: <FaUser className="text-[#6E9625]" size={17} />,
      title: "Build Your Profile",
      description: "Showcase your services, experience, work and customer reviews.",
    },
    {
      icon: <FaThumbsUp className="text-[#6E9625]" size={17} />,
      title: "Choose The Work You Want",
      description: "Set your services, location and availability.",
    },
    {
      icon: <FiBell className="text-[#6E9625]" size={18} strokeWidth={2.2} />,
      title: "Receive & Manage Enquiries",
      description: "Get notified when customers post relevant jobs in your service area.",
    },
  ];

  const rightFeatures = [
    {
      icon: <FaHandshake className="text-[#6E9625]" size={19} />,
      title: "Connect & Agree",
      description: "Communicate directly with clients, discuss the job, exchange quotes, and agree on the work and price directly with each other.",
    },
    {
      icon: <FiStar className="text-[#6E9625]" size={18} strokeWidth={2.2} />,
      title: "Build Your Reputation",
      description: "Collect genuine customer reviews and build your profile over time.",
    },
    {
      icon: <span className="text-[#6E9625] font-bold text-[20px] leading-none">€</span>,
      title: "Keep What You Earn",
      description: (
        <span className="underline decoration-[#1C2C1C] underline-offset-2">
          No commission on your earnings.
        </span>
      ),
    },
  ];

  return (
    <section className="bg-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-[1040px] mx-auto">
        {/* TOP HEADING */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-[28px] sm:text-[34px] md:text-[38px] font-extrabold text-[#1E3A2B] leading-tight tracking-tight">
            <span className="text-[#6E9625]">More Jobs.</span> Less Chasing.
          </h2>
        </div>

        {/* 3 COLUMNS: LEFT SEGMENTS | CENTER IMAGE | RIGHT SEGMENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-10 items-stretch">

          {/* LEFT COLUMN: 3 features */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-6 sm:gap-8 lg:gap-0 py-1">
            {leftFeatures.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3.5">
                <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                  {feature.icon}
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-[15px] sm:text-[16px] font-bold text-[#1C2C1C] leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-[12.5px] sm:text-[13px] text-[#4A5548] font-normal leading-relaxed max-w-[280px]">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CENTER COLUMN: Tradesperson & Client Image */}
          <div className="lg:col-span-4 flex justify-center items-center">
            <div className="relative w-full max-w-[280px] sm:max-w-[300px] lg:max-w-[320px] aspect-[1/1.18] rounded-[20px] overflow-hidden shadow-xs">
              <Image
                src="/couple.png"
                alt="Tradesperson speaking with client"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 320px"
                priority
              />
            </div>
          </div>

          {/* RIGHT COLUMN: 3 features */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-6 sm:gap-8 lg:gap-0 py-1">
            {rightFeatures.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3.5">
                <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                  {feature.icon}
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-[15px] sm:text-[16px] font-bold text-[#1C2C1C] leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-[12.5px] sm:text-[13px] text-[#4A5548] font-normal leading-relaxed max-w-[280px]">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyJoinSection;
