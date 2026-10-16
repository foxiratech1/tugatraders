"use client";

import React from 'react';

export default function ApproachAndRole() {
  return (
    <section className="bg-white pt-4 sm:pt-6 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-20 overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 items-stretch">
          {/* CARD 1: OUR APPROACH */}
          <div className="bg-[#E4ECD5] rounded-[18px] sm:rounded-[20px] p-6 sm:p-8 lg:p-9 flex flex-col">
            <h3
              className="text-[22px] sm:text-[26px] font-bold text-[#1C2C1C] mb-5 sm:mb-6 tracking-tight"
              style={{ fontFamily: 'var(--font-bricolage)' }}
            >
              Our Approach
            </h3>

            <div className="flex flex-col gap-4 sm:gap-5 text-[#2C3B2D] text-[14px] sm:text-[14.5px] leading-[1.65]">
              <div>
                <h4 className="font-bold text-[#1C2C1C] text-[15px] sm:text-[15.5px] mb-1">
                  Local
                </h4>
                <p>
                  We focus on connecting customers with tradespeople serving their area.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1C2C1C] text-[15px] sm:text-[15.5px] mb-1">
                  Transparent
                </h4>
                <p>
                  We give customers access to professional profiles, services and reviews so they can make their own decisions.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1C2C1C] text-[15px] sm:text-[15.5px] mb-1">
                  Direct
                </h4>
                <p>
                  Customers and tradespeople communicate directly about the work, price and timing.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1C2C1C] text-[15px] sm:text-[15.5px] mb-1">
                  Community-focused
                </h4>
                <p>
                  We want to help local professionals build their businesses while making it easier for people across Portugal to find the services they need.
                </p>
              </div>
            </div>
          </div>

          {/* CARD 2: OUR ROLE */}
          <div className="bg-[#E4ECD5] rounded-[18px] sm:rounded-[20px] p-6 sm:p-8 lg:p-9 flex flex-col">
            <h3
              className="text-[22px] sm:text-[26px] font-bold text-[#1C2C1C] mb-5 sm:mb-6 tracking-tight"
              style={{ fontFamily: 'var(--font-bricolage)' }}
            >
              Our Role
            </h3>

            <div className="flex flex-col gap-4 sm:gap-5 text-[#2C3B2D] text-[14px] sm:text-[14.5px] leading-[1.65]">
              <p>
                TugaTrades provides the platform that brings customers and independent tradespeople together.
              </p>

              <p>
                We help customers <strong className="font-bold text-[#1C2C1C]">find, compare and connect.</strong>
                <br />
                We do not employ the tradespeople listed on the platform, manage their work or guarantee the outcome of a project.
              </p>

              <p>
                Customers should always discuss the scope of work, pricing, timing, insurance and any other relevant details directly with the tradesperson before hiring.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
