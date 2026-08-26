"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShieldCheck, Award, Eye, Users, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';

const OurValues = () => {
  const [activeIndex, setActiveIndex] = useState(2); // Start at "Reliability" (index 2)
  const [cardWidth, setCardWidth] = useState(350);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardWidth(280);
      } else {
        setCardWidth(350);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const values = [
    {
      icon: <ShieldCheck size={24} />,
      title: "Trust",
      description: "Verification is at our core. Every profile on TugaTrades is carefully vetted. We connect homeowners and businesses with peace of mind, knowing they can hire with confidence.",
      image: "/Trust.png",
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Quality",
      description: "At TugaTrades, quality is at the core of the platform. Connecting you with skilled professionals while ensuring consistent standards, reliable service, and pride in every job from start to finish.",
      image: "/Quality.png",
    },
    {
      icon: <Award size={24} />,
      title: "Reliability",
      description: "Delivering results that our community can count on. Tradespeople on TugaTrades value punctuality, communication, and consistent results — helping customers feel confident throughout every stage of the job.",
      image: "/Reliability.png",
    },
    {
      icon: <Eye size={24} />,
      title: "Transparency",
      description: "Built on honest reviews and trusted profiles. Every trader profile showcases verified information, client feedback, and real reviews — giving homeowners and businesses the clarity and confidence to make informed decisions.",
      image: "/Transparency.png",
    },
    {
      icon: <Users size={24} />,
      title: "Community",
      description: "Building stronger local networks to support local trades. We believe when communities grow together, opportunities grow. Encouraging local hire and strengthening local economies.",
      image: "/Community.png",
    },
    {
      icon: <Briefcase size={24} />,
      title: "Professionalism",
      description: "Maintaining the highest standards of conduct and expertise across our platform. Connecting you with professionals who are committed to outstanding service and communication.",
      image: "/Professionalism.png",
    }
  ];

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % values.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + values.length) % values.length);
  };

  return (
    <section className="bg-[#FFFFFF66]/40 pb-24 overflow-hidden pt-12">
      {/* Header */}
      <div className="max-w-[1200px] mx-auto w-full px-6 lg:px-20">
        <div className="text-center max-w-[600px] mx-auto mb-8 animate-fade-in">
          <h2 className="text-[36px] md:text-[48px] font-bold text-[#243A24] leading-tight mb-4" style={{ fontFamily: 'var(--font-bricolage)' }}>
            Our <span className="text-[#6E9625]">Values</span>
          </h2>
          <p className="text-[#555555] text-[15px] md:text-[16px] font-medium leading-relaxed">
            The principles that guide every connection we make.
          </p>
        </div>
      </div>

      {/* Slider container */}
      <div className="relative w-full overflow-hidden py-10">
        <div
          className="flex gap-6 transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(calc(50% - ${(activeIndex * (cardWidth + 24)) + (cardWidth / 2)}px))`
          }}
        >
          {values.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={index}
                onClick={() => setActiveIndex(index)}
                style={{ width: `${cardWidth}px` }}
                className={`shrink-0 bg-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 border transition-all duration-500 flex flex-col items-center cursor-pointer justify-between ${isActive
                  ? 'border-[#6E9625] border-2 shadow-[0_20px_50px_rgba(110,150,37,0.12)] scale-105 z-10 h-[510px]'
                  : 'border-[#243A241F] border opacity-60 scale-95 hover:opacity-85 z-0 h-[460px]'
                  }`}
              >
                {/* Top content wrapper */}
                <div className="w-full flex flex-col items-center">
                  {/* Icon Wrapper */}
                  <div className="w-[56px] h-[56px] bg-[#6E96250D] border border-[#6E96251A] rounded-full flex items-center justify-center text-[#6E9625] mb-6">
                    {item.icon}
                  </div>

                  {/* Value Title */}
                  <h3 className="text-[18px] sm:text-[20px] md:text-[22px] font-bold text-[#243A24] mb-3 text-center" style={{ fontFamily: 'var(--font-bricolage)' }}>
                    {item.title}
                  </h3>

                  {/* Value Description */}
                  <p className="text-[#555555] text-[13px] md:text-[14px] leading-relaxed font-medium text-center px-1 sm:px-2">
                    {item.description}
                  </p>
                </div>

                {/* Image wrapper at bottom */}
                <div className="w-full h-[140px] relative rounded-[16px] overflow-hidden mt-6 shrink-0">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="max-w-[1200px] mx-auto w-full px-6 lg:px-20">
        <div className="flex items-center justify-center gap-6 mt-5">
          {/* Prev Button */}
          <button
            onClick={prevSlide}
            className="w-10 h-10 rounded-full border border-[#243A241F] flex items-center justify-center text-[#243A24] hover:bg-[#243A2408] hover:border-[#243A2433] transition-all cursor-pointer focus:outline-none"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Pagination Dots */}
          <div className="flex items-center gap-2">
            {values.map((_, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${isActive ? 'w-6 bg-[#6E9625]' : 'w-2 bg-[#243A241A] hover:bg-[#243A2433]'
                    }`}
                />
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="w-10 h-10 rounded-full border border-[#243A241F] flex items-center justify-center text-[#243A24] hover:bg-[#243A2408] hover:border-[#243A2433] transition-all cursor-pointer focus:outline-none"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

    </section>
  );
};

export default OurValues;
