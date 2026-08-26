"use client";

import React from 'react';
import { FaUserCheck, FaScrewdriverWrench, FaStar, FaScaleBalanced } from "react-icons/fa6";

const features = [
  {
    icon: <FaUserCheck size={18} className="text-[#6E9625]" />,
    title: "Trusted\nTradespeople",
    description: "Skilled professionals use TugaTrades to grow their business, manage schedules, and build their reputation. The platform supports a wide range of trades."
  },
  {
    icon: <FaScrewdriverWrench size={18} className="text-[#6E9625]" />,
    title: "Jobs for\nEvery Need",
    description: "Homeowners and businesses can post jobs of any size, from small repairs to major projects, and quickly connect with the right tradesperson."
  },
  {
    icon: <FaStar size={18} className="text-[#6E9625]" />,
    title: "Verified\nReviews",
    description: "After a job is completed, clients can leave reviews on each tradesperson's profile. Only verified customers who hired through TugaTrades can leave feedback, ensuring authentic and reliable reviews."
  },
  {
    icon: <FaScaleBalanced size={18} className="text-[#6E9625]" />,
    title: "Transparent Pricing &\nDirect Communication",
    description: "Post jobs for free and connect directly with tradespeople for competitive pricing and no hidden middleman costs. Tradespeople pay a fair subscription fee to keep the platform transparent and sustainable."
  }
];

const FeaturesGrid = () => {
  return (
    <section className="bg-white py-16 md:py-24 px-6 xl:px-20 overflow-hidden flex items-center justify-center">
      <div className="max-w-[1200px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#F8F9F5] border border-[#243A241F] rounded-[24px] p-8 transition-all duration-300 hover:shadow-md hover:scale-[1.02] flex flex-col items-center text-center h-full"
            >
              {/* Icon Container */}
              <div className="w-[42px] h-[42px] bg-[#6E96250D] border-[#6E96251A] text-[#6E9625] rounded-xl flex items-center justify-center mb-8 shrink-0">
                {feature.icon}
              </div>

              {/* Title */}
              <h3
                className="text-[18px] sm:text-[20px] font-bold text-[#243A24] mb-4 leading-snug whitespace-pre-line min-h-[56px] flex items-center justify-center"
                style={{ fontFamily: 'var(--font-bricolage)' }}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-[#555555] text-[13px] sm:text-[14px] md:text-[15px] xl:text-[16px] leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
