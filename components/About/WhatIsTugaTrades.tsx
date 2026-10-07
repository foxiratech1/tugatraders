"use client";

import React from 'react';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export default function WhatIsTugaTrades() {
  return (
    <section className="bg-white py-16 md:py-20 px-4 sm:px-6 lg:px-20 overflow-hidden border-b border-[#F0F2EE]">
      <div className="max-w-[1200px] mx-auto">
        {/* SECTION HEADER */}
        <div className="mb-12 sm:mb-14">
          <h2
            className="text-[34px] sm:text-[42px] md:text-[48px] font-bold text-[#1C2C1C] leading-[1.1] mb-5 tracking-tight"
            style={{ fontFamily: 'var(--font-bricolage)' }}
          >
            <span className="text-[#6E9625]">What</span> is TugaTrades?
          </h2>

          <p className="text-[#4B5563] text-[15px] sm:text-[16px] leading-[1.8] font-normal max-w-[1020px]">
            TugaTrades is an online marketplace connecting customers with independent tradespeople across Portugal. Whether you need a small repair, ongoing maintenance, a renovation or a larger project, TugaTrades makes it easier to find professionals offering the services you need in your area.
          </p>
        </div>

        {/* FOR CUSTOMERS */}
        <div className="mb-14 sm:mb-16">
          <h3 className="text-[24px] sm:text-[28px] font-bold text-[#1C2C1C] mb-6 tracking-tight">
            For Customers
          </h3>

          {/* 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10">
            <div>
              <h4 className="font-bold text-[#6E9625] text-[17px] mb-2">Find.</h4>
              <p className="text-[#4B5563] text-[14.5px] sm:text-[15px] leading-relaxed">
                Search for tradespeople by trade, service and location.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[#6E9625] text-[17px] mb-2">Connect.</h4>
              <p className="text-[#4B5563] text-[14.5px] sm:text-[15px] leading-relaxed">
                Contact tradespeople directly to discuss your project, availability and pricing. You choose who you want to work with.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[#6E9625] text-[17px] mb-2">Compare.</h4>
              <p className="text-[#4B5563] text-[14.5px] sm:text-[15px] leading-relaxed">
                View profiles, services, customer reviews and relevant information to help you make an informed decision.
              </p>
            </div>
          </div>

          {/* Customer Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
            <Link
              href="/directory-listing/search"
              className="bg-[#15341C] hover:bg-[#0E2914] text-white font-bold text-[12.5px] tracking-wider uppercase py-3 px-6 sm:px-7 rounded-[8px] transition-all shadow-sm hover:shadow text-center"
            >
              FIND A TRADESPERSON
            </Link>

            <Link
              href="/post-job"
              className="bg-[#729A26] hover:bg-[#5f8220] text-white font-bold text-[12.5px] tracking-wider uppercase py-3 px-6 sm:px-7 rounded-[8px] transition-all shadow-sm hover:shadow text-center"
            >
              POST YOUR JOB - FREE
            </Link>
          </div>
        </div>

        {/* FOR TRADESPEOPLE */}
        <div>
          <h3 className="text-[24px] sm:text-[28px] font-bold text-[#1C2C1C] mb-2 tracking-tight">
            For Tradespeople
          </h3>

          <h4 className="text-[18px] sm:text-[21px] font-bold text-[#1C2C1C] mb-4">
            Get discovered by customers looking for your trade
          </h4>

          <div className="space-y-3.5 text-[#4B5563] text-[15px] sm:text-[16px] leading-[1.8] max-w-[1020px] mb-5">
            <p>
              TugaTrades gives independent tradespeople a place to showcase what they do and connect with customers across Portugal.
            </p>
            <p>
              Create your profile, list your services, show examples of your work and build your reputation through customer reviews.
            </p>
          </div>

          <p className="font-bold text-[#6E9625] text-[16px] sm:text-[17px] mb-8">
            More visibility. More opportunities. Build your reputation.
          </p>

          {/* Join TugaTrades Button */}
          <div className="flex justify-center">
            <Link
              href="/trader-signup"
              className="inline-flex items-center gap-2 bg-[#B81D13] hover:bg-[#9E180F] text-white font-bold text-[12.5px] sm:text-[13px] tracking-wider uppercase py-2.5 sm:py-3 px-6 sm:px-7 rounded-[8px] transition-all shadow-md hover:shadow-lg"
            >
              <UserPlus size={16} className="shrink-0" />
              <span>JOIN TUGATRADES</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
