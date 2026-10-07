"use client";

import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { motion } from "framer-motion";
import TrustSafetyModal from "@/components/modal/TrustSafetyModal";

const transparencyFeatures = [
  {
    title: "Vetted Professionals",
    desc: "Information and documents reviewed during registration",
  },
  {
    title: "Real Customer Reviews",
    desc: "Reviews linked to genuine customer experiences.",
  },
  {
    title: "Local Coverage",
    desc: "Find professionals covering your area.",
  },
  {
    title: "Direct communication",
    desc: "Discuss your project and payment terms directly with the tradesperson.",
  },
];

export default function TrustSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="w-full py-16 md:py-24 bg-white px-6">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

        {/* LEFT SPEECH BUBBLE CARD */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6 relative group flex justify-center lg:justify-start"
        >
          <div className="relative bg-[#162D1A] rounded-[48px] rounded-bl-none p-8 sm:p-10 md:p-11 text-white shadow-2xl shadow-[#162D1A]/20 transition-transform hover:-translate-y-1 duration-500 z-10 w-full max-w-[540px]">
            {/* THE "TAIL" OF THE BUBBLE */}
            <div className="absolute -bottom-6 left-0 w-0 h-0 border-t-[24px] border-t-[#162D1A] border-r-[24px] border-r-transparent" />

            {/* TITLE - CENTERED ON ONE LINE */}
            <h3 className="text-[24px] sm:text-[28px] md:text-[30px] font-extrabold text-white text-center leading-tight mb-5 whitespace-nowrap">
              Hire with confidence
            </h3>

            {/* BODY PARAGRAPHS */}
            <p className="text-[13.5px] sm:text-[14px] text-white/90 leading-relaxed font-normal mb-5">
              TugaTrades reviews information submitted by traders and provides profiles, reviews and other information to help you choose a tradesperson with confidence.
            </p>

            <p className="text-[13.5px] sm:text-[14px] text-white/90 leading-relaxed font-normal">
              For more info visit our{" "}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-[#84cc16] hover:text-[#9fe231] font-semibold underline underline-offset-2 transition-colors inline"
              >
                Hiring Safely
              </button>{" "}
              guide for a safer hiring experience.
            </p>
          </div>

          {/* Subtle accent shadow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#84cc16]/20 to-transparent rounded-[60px] rounded-bl-none -z-10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>

        {/* RIGHT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-6 flex flex-col justify-center"
        >
          {/* HEADING */}
          <h2 className="text-[30px] sm:text-[36px] md:text-[40px] font-extrabold text-[#1E3A2B] leading-tight mb-7">
            Built Around<br />Transparency.
          </h2>

          {/* FEATURES LIST */}
          <div className="space-y-4 sm:space-y-5">
            {transparencyFeatures.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-[#6E9625] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <FiCheck size={12} strokeWidth={3} />
                </div>
                <div>
                  <h4 className="text-[15px] sm:text-[16px] font-bold text-[#1E3A2B] leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[13px] sm:text-[13.5px] text-[#4A5548] leading-relaxed mt-0.5">
                    {item.desc}
                  </p>
                </div>
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