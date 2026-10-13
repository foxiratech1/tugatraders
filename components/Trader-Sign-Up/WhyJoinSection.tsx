import React from 'react';
import Image from 'next/image';
import { FaUser, FaThumbsUp, FaHandshake } from 'react-icons/fa6';
import { FiBell, FiStar } from 'react-icons/fi';

const WhyJoinSection = () => {
  const leftFeatures = [
    {
      icon: <FaUser className="text-[#6E9625]" size={19} />,
      isCircled: false,
      title: "Build Your Profile",
      description: "Showcase your services, experience, work and customer reviews.",
    },
    {
      icon: <FaThumbsUp className="text-[#6E9625]" size={19} />,
      isCircled: false,
      title: "Choose The Work You Want",
      description: "Set your services, location and availability.",
    },
    {
      icon: <FiBell className="text-[#6E9625]" size={18} />,
      isCircled: true,
      title: "Receive & Manage Enquiries",
      description: "Get notified when customers post relevant jobs in your service area.",
    },
  ];

  const rightFeatures = [
    {
      icon: <FaHandshake className="text-[#6E9625]" size={21} />,
      isCircled: false,
      title: "Connect & Agree",
      description: "Communicate directly with clients, discuss the job, exchange quotes, and agree on the work and price directly with each other.",
    },
    {
      icon: <FiStar className="text-[#6E9625]" size={18} />,
      isCircled: true,
      title: "Build Your Reputation",
      description: "Collect genuine customer reviews and build your profile over time.",
    },
    {
      icon: <span className="text-[#6E9625] font-semibold text-[23px] leading-none">€</span>,
      isCircled: false,
      title: "Keep What You Earn",
      description: (
        <span className="underline decoration-[#1C2C1C] underline-offset-2">
          No commission on your earnings.
        </span>
      ),
    },
  ];

  return (
    <section className="bg-white py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-[960px] mx-auto">
        {/* TOP HEADING */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-[26px] sm:text-[32px] md:text-[36px] font-extrabold text-[#1E3A2B] leading-tight tracking-tight">
            <span className="text-[#6E9625]">More Jobs.</span> Less Chasing.
          </h2>
        </div>

        {/* 3 COLUMNS: LEFT SEGMENTS | IMAGE | RIGHT SEGMENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 lg:gap-6 xl:gap-8 items-center">

          {/* LEFT COLUMN: Segment 1 (Top), Segment 2 (Center), Segment 3 (Bottom) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-6 sm:gap-7 py-0.5">
            {leftFeatures.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3.5 group">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 mt-0.5 ${
                    feature.isCircled ? "rounded-full bg-[#6E9625]/10" : ""
                  }`}
                >
                  {feature.icon}
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-[15px] sm:text-[15.5px] font-bold text-[#1C2C1C] leading-snug">
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
            <div className="relative w-full max-w-[260px] sm:max-w-[280px] aspect-[3/4] rounded-[18px] overflow-hidden shadow-sm">
              <Image
                src="/couple.png"
                alt="Tradesperson speaking with client"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 280px"
                priority
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Segment 1 (Top), Segment 2 (Center), Segment 3 (Bottom) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-6 sm:gap-7 py-0.5">
            {rightFeatures.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3.5 group">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 mt-0.5 ${
                    feature.isCircled ? "rounded-full bg-[#6E9625]/10" : ""
                  }`}
                >
                  {feature.icon}
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-[15px] sm:text-[15.5px] font-bold text-[#1C2C1C] leading-snug">
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
