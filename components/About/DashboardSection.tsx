"use client";

import React from 'react';
import Image from 'next/image';

const DashboardSection = () => {
  return (
    <section className="bg-[#F8F9F5] py-20 px-6 lg:px-20 overflow-hidden">
      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

        {/* Left Column - Content & Stats */}
        <div className="lg:col-span-6 flex flex-col justify-center animate-fade-in">
          {/* Heading */}
          <h2
            className="text-[28px] sm:text-[34px] md:text-[36px] font-bold text-[#243A24] leading-[1.25] mb-6 tracking-tight"
            style={{ fontFamily: 'var(--font-bricolage)' }}
          >
            TugaTrades is Portugal's <span className='text-[#6E9625]'>trusted online marketplace</span> connecting homeowners and businesses with skilled, reliable tradespeople.
          </h2>

          {/* Description */}
          <p className="text-[#555555] text-[17px] md:text-[18px] font-normal leading-relaxed mb-8 max-w-[700px]">
            Our platform allows you to find vetted local professionals for any job,
            emergency or planned - without the guesswork. Every tradesperson on
            TugaTrades is vetted and has relevant experience. Customers can leave
            reviews after each job, ensuring transparency and trust for future users.
          </p>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 md:gap-10 border-t border-[#243A241A] pt-8">
            {/* Stat 1 */}
            <div className="flex flex-col">
              <span
                className="text-[32px] md:text-[36px] font-bold text-[#243A24] leading-none mb-2"
                style={{ fontFamily: 'var(--font-bricolage)' }}
              >
                15k+
              </span>
              <span className="text-[#555555] text-[12px] md:text-[14px] font-semibold">
                Active Users
              </span>
            </div>

            {/* Separator */}
            <div className="h-10 w-[1px] bg-[#243A241F]" />

            {/* Stat 2 */}
            <div className="flex flex-col">
              <span
                className="text-[32px] md:text-[36px] font-bold text-[#243A24] leading-none mb-2"
                style={{ fontFamily: 'var(--font-bricolage)' }}
              >
                98%
              </span>
              <span className="text-[#555555] text-[12px] md:text-[14px] font-semibold">
                Job Success
              </span>
            </div>

            {/* Separator */}
            <div className="h-10 w-[1px] bg-[#243A241F]" />

            {/* Stat 3 */}
            <div className="flex flex-col">
              <span
                className="text-[32px] md:text-[36px] font-bold text-[#243A24] leading-none mb-2"
                style={{ fontFamily: 'var(--font-bricolage)' }}
              >
                4.9/5
              </span>
              <span className="text-[#555555] text-[12px] md:text-[14px] font-semibold">
                User Rating
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Dashboard Image Mockup */}
        <div className="lg:col-span-6 flex justify-center items-center">
          <div className="relative w-full max-w-[550px] aspect-[550/380] rounded-[20px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#243A240A]">
            <Image
              src="/dashboard.png"
              alt="TugaTrades Dashboard"
              fill
              className="object-cover object-left-top"
              unoptimized
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default DashboardSection;
