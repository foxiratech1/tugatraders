"use client";

import Image from "next/image";
import { FiCheckCircle, FiPlusCircle, FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";
import { slideFromLeft, slideFromRight, staggerContainer } from "./animationVariants";
import Link from "next/link";

const FinalCTASection = () => {
  const bottomChecklist = [
    "100% FREE FOR HOMEOWNERS",
    "VETTED AND LOCAL TRADESPEOPLE",
    "DIRECT TRADER COMMUNICATION",
    "TRUSTED REVIEW SYSTEM",
  ];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={slideFromLeft}
      className="bg-white"
    >
      {/* Main CTA Banner */}
      <div className="relative w-full min-h-[420px] lg:min-h-[500px] overflow-hidden flex items-center py-8 lg:py-0">
        {/* Background Image with Dark Green Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/Ready to transform.png"
            alt="Ready to transform"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#243A24] mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#243A24] via-[#243A24]/40 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1320px] w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 px-6 py-10 sm:p-10 lg:p-14 items-center">

          {/* Left Column Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 w-full"
          >
            <h2 className="text-[34px] sm:text-[44px] md:text-[52px] lg:text-[58px] font-bold text-white leading-[1.05] tracking-tight mb-5 lg:mb-6">
              Ready to <br className="hidden lg:inline" />
              <span className="text-[#6E9625]">Transform</span>{" "}
              <br className="hidden lg:inline" />
              Your Home?
            </h2>
            <p className="text-[15px] sm:text-[17px] lg:text-[14px] text-white/80 font-medium max-w-[430px] leading-relaxed mb-7 lg:mb-10">
              The smarter, safer way to find and hire independent professionals in Portugal.
              One platform, total peace of
              mind.
            </p>

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-8 lg:mb-0">
              {bottomChecklist.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <FiCheckCircle className="text-[#6E9625] flex-shrink-0" size={18} />
                  <span className="text-[12px] font-bold text-white/60 tracking-widest uppercase">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column Cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-5 flex flex-col gap-4 sm:gap-6 w-full"
          >

            {/* Post Your Job Card */}
            <motion.div
              variants={slideFromRight}
              className="bg-white rounded-[32px] sm:rounded-[48px] lg:rounded-[64px] px-6 sm:px-10 py-6 sm:py-8 flex items-center justify-between shadow-2xl transition-transform hover:scale-[1.02] cursor-pointer"
            >
              <div>
                <p className="text-[10px] sm:text-[12px] font-bold text-[#6E9625] tracking-[2px] uppercase mb-1">
                  HOMEOWNERS
                </p>
                <Link href="/post-job">
                  <h3 className="text-[24px] sm:text-[28px] lg:text-[32px] font-bold text-[#243A24]">
                    Post Your Job
                  </h3>
                </Link>
              </div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#243A24] flex items-center justify-center shadow-lg flex-shrink-0 ml-4">
                <FiPlusCircle className="text-white w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </motion.div>

            {/* Find a Trader Card */}
            <motion.div
              variants={slideFromLeft}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] sm:rounded-[48px] lg:rounded-[64px] px-6 sm:px-10 py-6 sm:py-8 flex items-center justify-between transition-transform hover:scale-[1.02] cursor-pointer"
            >
              <div>
                <p className="text-[10px] sm:text-[12px] font-bold text-white/60 tracking-[2px] uppercase mb-1">
                  QUICK SEARCH
                </p>
                <Link href="/directory-listing/search">
                  <h3 className="text-[24px] sm:text-[28px] lg:text-[32px] font-bold text-white">
                    Find a Trader
                  </h3>
                </Link>
              </div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 ml-4">
                <FiSearch className="text-white w-5 h-5 sm:w-7 sm:h-7" />
              </div>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </motion.section >
  );
};

export default FinalCTASection;
