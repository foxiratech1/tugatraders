"use client";

import React, { useState, useEffect } from 'react';
import { Edit, Briefcase, Plus, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const cards = [
  {
    title: 'Leave a Review',
    description: 'Help the community by sharing your feedback on completed jobs.',
    linkText: 'Leave a review',
    icon: <Edit size={22} className="text-[#6E9625]" />,
    linkUrl: '/review'
  },
  {
    title: 'Join as a Tradesperson',
    description: 'Apply to become a vetted professional and grow your business.',
    linkText: 'Register Now',
    icon: <Briefcase size={22} className="text-[#6E9625]" />,
    linkUrl: '/auth/trader-signup',
  },
  {
    title: 'Post a Job',
    description: 'Describe your job and let local and vetted experts get in touch.',
    linkText: 'Post a job',
    icon: <Plus size={22} className="text-[#6E9625]" />,
    linkUrl: '/post-job'
  }
];

const ActionCards = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      let cardsCount = 1;
      if (window.innerWidth >= 768) {
        cardsCount = 2;
      }
      setVisibleCards(cardsCount);
      setCurrentIndex((prev) => Math.min(prev, cards.length - cardsCount));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? cards.length - visibleCards : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= cards.length - visibleCards ? 0 : prev + 1));
  };

  return (
    <section className="bg-[#F9FAFB] py-12 px-6 lg:px-10 xl:px-20">
      <div className="max-w-[1440px] mx-auto">

        {/* Desktop Grid Layout (1280px and above) */}
        <div className="hidden xl:grid grid-cols-3 gap-4 xl:gap-6 justify-items-center">
          {cards.map((card, index) => (
            <div key={index} className="w-full max-w-[400px] bg-[#D6DED0] rounded-[24px] p-6 xl:p-8 flex flex-col justify-start border border-[#6E96254D]">
              <div className="w-12 h-12 xl:w-14 xl:h-14 bg-[#FFFFFF] rounded-[16px] flex text-[#65A30D] items-center justify-center mb-4 xl:mb-6 shadow-sm">
                {card.icon}
              </div>
              <h3 className="text-[20px] xl:text-[24px] font-bold text-[#243A24] mb-3 xl:mb-4 tracking-tight leading-tight" style={{ fontFamily: 'var(--font-bricolage)' }}>
                {card.title}
              </h3>
              <p className="text-[#1E1E1F] text-[14px] xl:text-[16px] leading-relaxed mb-6 xl:mb-8 flex-grow">
                {card.description}
              </p>
              <Link href={card.linkUrl} className="inline-flex items-center gap-2 text-[14px] xl:text-[15px] font-bold text-[#243A24] hover:text-[#6E9625] transition-colors mt-auto cursor-pointer">
                {card.linkText} <ArrowRight size={18} />
              </Link>
            </div>
          ))}
        </div>

        {/* Mobile/Tablet Slider/Carousel Layout (Below 1280px) */}
        <div
          className="xl:hidden relative w-full mx-auto overflow-hidden"
          style={{ maxWidth: visibleCards === 2 ? '840px' : '400px' }}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / visibleCards)}%)` }}
          >
            {cards.map((card, index) => (
              <div
                key={index}
                className="flex-shrink-0 px-2"
                style={{ width: `${100 / visibleCards}%` }}
              >
                <div className="bg-[#D6DED0] rounded-[24px] p-6 sm:p-8 flex flex-col justify-start border border-[#6E96254D] h-full min-h-[340px]">
                  <div className="w-14 h-14 bg-[#FFFFFF] rounded-[16px] flex text-[#65A30D] items-center justify-center mb-6 shadow-sm">
                    {card.icon}
                  </div>
                  <h3 className="text-[20px] sm:text-[24px] font-bold text-[#243A24] mb-4 tracking-tight leading-tight" style={{ fontFamily: 'var(--font-bricolage)' }}>
                    {card.title}
                  </h3>
                  <p className="text-[#1E1E1F] text-[15px] sm:text-[16px] leading-relaxed mb-8 flex-grow">
                    {card.description}
                  </p>
                  <Link href={card.linkUrl} className="inline-flex items-center gap-2 text-[15px] font-bold text-[#243A24] hover:text-[#6E9625] transition-colors mt-auto cursor-pointer">
                    {card.linkText} <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Slider Controls */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-full border border-[#6E96254D] bg-[#FFFFFF] flex items-center justify-center text-[#243A24] active:bg-[#D6DED0] transition-colors cursor-pointer"
              aria-label="Previous card"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Sliding Dots Indicators */}
            <div className="flex gap-2">
              {Array.from({ length: cards.length - visibleCards + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${currentIndex === i ? 'bg-[#6E9625] w-6' : 'bg-[#D6DED0] w-2.5'
                    }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-full border border-[#6E96254D] bg-[#FFFFFF] flex items-center justify-center text-[#243A24] active:bg-[#D6DED0] transition-colors cursor-pointer"
              aria-label="Next card"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ActionCards;
