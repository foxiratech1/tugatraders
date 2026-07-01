"use client";

import Image from "next/image";
import { FiPlusCircle, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import Link from "next/link";

const MapSearchSection = () => {
  const features = [
    "Easy to compare local tradespeople",
    "Transparent profiles and reviews",
    "No commissions or hidden fees",
    "Direct communication with traders",
  ];

  return (
    <section className="bg-[#FAFAF5] py-20 overflow-hidden">
      <div className="mx-auto max-w-[1300px] px-6 text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mx-auto max-w-[900px] text-[42px] font-bold leading-[1.2] text-[#243A24] tracking-tight mb-4">
            Search for trades or post your job,
            <br />
            compare quotes, and hire with confidence
          </h2>
          <p className="text-[18px] font-medium text-[#6E9625] mb-16">
            All in One Place, Completely Free.
          </p>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-[1000px] flex items-center justify-center"
        >
          {/* Center Map - Names are already in the image */}
          <div className="relative w-full max-w-[1000px] flex items-center justify-center">
            <Image
              src="/Map.jpg"
              alt="Portugal Map with Trades"
              width={1000}
              height={800}
              className="object-contain"
              priority
            />
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mt-16 flex flex-col items-center"
        >
          <Link href="/post-job" className="flex items-center gap-3 bg-[#243A24] text-white px-8 py-4 rounded-[14px] text-[17px] font-bold shadow-xl shadow-[#243A24]/20 hover:bg-[#1a2e1a] transition-all mb-10">
            <FiPlusCircle size={22} className="text-[#FFFFFF]" />
            Post a Job
            <FiArrowRight size={20} className="ml-2  text-[#FFFFFF]" />
          </Link>

          <h3 className="text-[48px] font-bold text-[#243A24] tracking-tight">
            Let the <span className="text-[#6E9625]">right</span> tradespeople<br /> come to you.
          </h3>
        </motion.div>

        {/* Bottom Feature Box */}
        <div className="mt-20 mx-auto max-w-[1352px] bg-[#F1F7E8] rounded-[56px] p-8 md:p-12 border border-[#6E96251A]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center gap-4 text-left"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <FiCheckCircle className="text-[#84cc16]" size={18} />
                </div>
                <p className="text-[20px] font-bold text-[#243A24] leading-tight">
                  {feature}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSearchSection;
