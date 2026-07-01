"use client";

import React from 'react';
import { Search, Clock, ArrowRight } from 'lucide-react';

const HowToLeaveReview = () => {
  return (
    <section className="bg-[#F8F9F5] pt-4 lg:pt-8 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-20 overflow-hidden">
      <div className="max-w-[1200px] mx-auto w-full">

        {/* Search Bar Container */}
        <div className="max-w-[1050px] mx-auto bg-white rounded-[28px] sm:rounded-[34px] shadow-[0_18px_50px_rgba(0,0,0,0.05)] border-2 border-[#243A24] px-4 sm:px-5 py-4 flex flex-col sm:flex-row items-center mb-6 gap-3 sm:gap-0">
          <div className="flex-1 flex items-center gap-5 px-5 sm:px-8 py-4 sm:py-3 w-full">
            <Search className="text-[#243A24] shrink-0" size={28} />

            <div className="text-left w-full flex flex-col justify-center">
              <span className="block text-[18px] sm:text-[20px] text-[#243A24] font-extrabold tracking-tight">
                Find Traders
              </span>

              <input
                type="text"
                placeholder="SEARCH BY TRADER'S NAME OR COMPANY..."
                className="block w-full text-[13px] tracking-[0.18em] uppercase font-semibold text-[#111111] placeholder-[#55555570] bg-transparent outline-none mt-1"
              />
            </div>
          </div>

          <button className="w-full sm:w-auto bg-[#243A24] hover:bg-[#152719] text-white px-10 sm:px-12 py-5 rounded-[20px] sm:rounded-[26px] flex items-center justify-center gap-2 font-bold text-[16px] transition-all shrink-0 cursor-pointer">
            Find Tradesperson
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Spelling Helper Text */}
        <p className="text-center text-[13px] text-[#555555] mb-20 font-medium">
          Can't find them?{" "}
          <a href="#" className="text-[#243A24] font-semibold underline decoration-1 hover:text-[#5a7d1e] transition-colors">
            browse categories
          </a>
        </p>

        {/* Section Heading */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-[28px] sm:text-[36px] md:text-[44px] font-bold text-[#243A24] mb-3 sm:mb-4 leading-tight" style={{ fontFamily: 'var(--font-bricolage)' }}>
            How to leave a <span className="text-[#6E9625]">review</span>
          </h2>
          <p className="text-[#555555] text-[15px] md:text-[16px] font-medium mx-auto">
            Choose the method that matches how you connected with your tradesperson.
          </p>
        </div>

        {/* Flow Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-10 sm:mb-16">

          {/* Left Card: Direct Contact (Sage Green) */}
          <div className="bg-[#D6DED0] rounded-[22px] p-5 sm:p-6 border border-[#C4CEBE] shadow-sm flex flex-col justify-between h-full min-h-[460px] w-full">
            <div>
              {/* Title */}
              <h3 className="text-[22px] sm:text-[25px] md:text-[28px] font-bold text-[#243A24] leading-snug mb-3 min-h-[72px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
                Did you search & contact the trader directly?
              </h3>

              {/* Description */}
              <p className="text-[#243A24B2] text-[14px] leading-relaxed mb-6 font-medium min-h-[120px]">
                If you found and contacted a trader through our directory and completed a job, revisit the trader's profile to leave a review and share your experience. Your feedback helps other customers discover trusted local tradespeople with confidence.
              </p>

              {/* Stepper List (Vertical) */}
              <div className="flex flex-col gap-3 mb-6 min-h-[120px]">
                {/* Step 1 */}
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-[#243A24] rounded-[8px] flex items-center justify-center text-[13px] font-bold text-white shrink-0">
                    1
                  </div>
                  <span className="text-[14px] font-bold text-[#243A24]">
                    Search for the trader
                  </span>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-[#243A24] rounded-[8px] flex items-center justify-center text-[13px] font-bold text-white shrink-0">
                    2
                  </div>
                  <span className="text-[14px] font-bold text-[#243A24]">
                    Open Traders Profile
                  </span>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-[#243A24] rounded-[8px] flex items-center justify-center text-[13px] font-bold text-white shrink-0">
                    3
                  </div>
                  <span className="text-[14px] font-bold text-[#243A24]">
                    Submit your review & proof
                  </span>
                </div>
              </div>
            </div>

            {/* Button */}
            <button className="bg-[#243A24] hover:bg-[#1A301A] text-white px-7 py-3.5 rounded-[14px] flex items-center justify-center gap-2 font-bold text-[14px] transition-all w-full cursor-pointer shadow-md">
              Find Tradesperson
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Right Card: Post a Job (Sage Green) */}
          <div className="bg-[#D6DED0] rounded-[22px] p-5 sm:p-6 border border-[#C4CEBE] shadow-sm flex flex-col justify-between h-full min-h-[460px] w-full mt-6 lg:mt-0">
            <div>
              {/* Title */}
              <h3 className="text-[22px] sm:text-[25px] md:text-[28px] font-bold text-[#243A24] leading-snug mb-3 min-h-[72px]" style={{ fontFamily: 'var(--font-bricolage)' }}>
                Did you post a job?
              </h3>

              {/* Description */}
              <p className="text-[#243A24B2] text-[14px] leading-relaxed mb-6 font-medium min-h-[120px]">
                Quotes don't need to be formally accepted, simply chat with one or more trusted traders who responded to your job. Once the job is complete, you'll be invited to leave a review based on your experience. To keep reviews fair, you can only review traders you've interacted with through the platform.
              </p>

              {/* Stepper List (Vertical) */}
              <div className="flex flex-col gap-3 mb-6 min-h-[120px]">
                {/* Step 1 */}
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-[#6E9625] rounded-[8px] flex items-center justify-center text-[13px] font-bold text-white shrink-0">
                    1
                  </div>
                  <span className="text-[14px] font-bold text-[#243A24]">
                    Mark job as completed
                  </span>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-[#6E9625] rounded-[8px] flex items-center justify-center text-[13px] font-bold text-white shrink-0">
                    2
                  </div>
                  <span className="text-[14px] font-bold text-[#243A24]">
                    Select Tradesperson to review
                  </span>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-[#6E9625] rounded-[8px] flex items-center justify-center text-[13px] font-bold text-white shrink-0">
                    3
                  </div>
                  <span className="text-[14px] font-bold text-[#243A24]">
                    Submit your review
                  </span>
                </div>
              </div>
            </div>

            {/* Button */}
            <button className="bg-[#6E9625] hover:bg-[#5a7d1e] text-white px-7 py-3.5 rounded-[14px] flex items-center justify-center gap-2 font-bold text-[14px] transition-all w-full cursor-pointer shadow-md">
              Go To Dashboard
            </button>
          </div>

        </div>

        {/* Notices Section */}
        <div className="w-full">
          {/* Important Notice Card */}
          <div className="bg-[#FFFFFF66]/40 border-2 border-[#F2C94C4D] rounded-[16px] p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start w-full shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
            <div className="w-10 h-10 bg-[#FACC15] rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
              <Clock size={20} className='text-white' />
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-[#243A24] mb-2">Important Notice</h4>
              <p className="text-[#555555] text-[13px] leading-relaxed font-medium">
                Remember: You can leave a review anytime within 6 months of your job being completed, so there's no rush to share your experience. After submitting your review, you'll have up to 48 hours to make any changes before it becomes final.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HowToLeaveReview;
