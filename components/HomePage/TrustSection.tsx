"use client";

import Link from "next/link";
import { useState } from "react";
import { FiCheckCircle, FiArrowRight } from "react-icons/fi";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import TrustSafetyModal from "@/components/modal/TrustSafetyModal";

export default function TrustSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="w-full py-24 bg-white px-6">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* LEFT CARD */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="relative group"
        >
          <div className="relative bg-[#243A24] rounded-[60px] rounded-bl-none p-6 sm:p-10 md:p-14 shadow-2xl shadow-[#243A24]/20 transition-transform hover:-translate-y-1 duration-500 z-10">

            {/* THE "TAIL" OF THE BUBBLE */}
            <div className="absolute -bottom-6 left-0 w-0 h-0 border-t-[24px] border-t-[#243A24] border-r-[24px] border-r-transparent" />

            {/* SMALLER & TIGHTER TITLE */}
            <h2 className="text-[20px] sm:text-[28px] md:text-[36px] font-bold text-white leading-[1.1] mb-4">
              Want to hire with <br className="max-sm:hidden" /> confidence?
            </h2>

            <p className="text-[16px] text-white/70 font-medium leading-relaxed mb-8 max-w-[380px]">
              Check our{" "}
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(true);
                }}
                className="text-[#89b341] underline underline-offset-4 hover:text-[#a3c64c] transition-colors"
              >
                Trust & Safety guide
              </Link>{" "}
              for a safer hiring experience.
            </p>

            {/* <p
              className="inline-flex items-center gap-2 text-[#89b341] font-bold text-[16px]"
            >
              Learn how we protect you
             
            </p> */}
          </div>

          {/* Subtle accent shadow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#89b341]/20 to-transparent rounded-[60px] rounded-bl-none -z-10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>

        {/* RIGHT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col gap-8"
        >
          {/* ICON HEADER */}
          <div className="flex items-center gap-4 sm:gap-6 mb-2">
            <div className="w-16 h-16 flex-shrink-0 rounded-[20px] bg-[#f4f7f2] flex items-center justify-center text-[#89b341]">
              <IoShieldCheckmarkOutline size={32} />
            </div>

            <h2 className="text-[22px] sm:text-[32px] md:text-[42px] font-bold text-[#243A24] leading-tight">
              Built on Trust. <br className="max-sm:hidden" />
              Designed for Results.
            </h2>
          </div>

          {/* FEATURES LIST */}
          <div className="flex flex-col gap-6 pl-[88px] sm:pl-[96px]">
            {[
              "Verified reviews from real clients",
              "Direct access to qualified professionals",
              "Local tradespeople across Portugal",
              "A simple and transparent process from start to finish",
            ].map((text) => (
              <div
                key={text}
                className="flex items-start sm:items-center gap-4 group"
              >
                <div className="text-[#89b341] flex-shrink-0 mt-1 sm:mt-0 transition-transform group-hover:scale-110">
                  <FiCheckCircle size={22} />
                </div>

                <span className="text-[12px] md:text-[17px] font-medium text-[#6F736C]">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* MODAL */}
      <TrustSafetyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}