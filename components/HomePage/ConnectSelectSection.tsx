"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export default function ConnectSelectSection() {
  const { role } = useAuth();
  const isTrader = role === "trader";

  return (
    <section className="w-full py-6 md:py-10 bg-white px-4 sm:px-6 overflow-hidden">
      <div className="max-w-[1340px] mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14">

        {/* LEFT: TRADESPEOPLE IMAGE WITH SOFT FEATHERED VIGNETTE */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-[480px] md:max-w-[540px] lg:max-w-[580px] aspect-[1.35/1] shrink-0"
        >
          <div className="relative w-full h-full overflow-hidden">
            <Image
              src="/We connect. You Select.png"
              alt="We Connect. You Select"
              fill
              className="object-cover object-center"
              priority
            />

            {/* ORIGINAL INSET BLUR VIGNETTE - PRESERVED */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_35px_15px_#ffffff]" />

            {/* EDGE FADES - PRESERVED */}
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none" />

            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />

            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none" />

            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none" />
          </div>
        </motion.div>

        {/* RIGHT: TEXT & BUTTON */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center text-center justify-center max-w-[460px] w-full"
        >

          {/* UPDATED HEADING - TWO LINES */}
          <div className="mb-3 text-center w-full">
            <h2 className="text-[30px] sm:text-[36px] md:text-[40px] lg:text-[44px] font-extrabold text-[#1E3A2B] leading-[1.15] tracking-tight">

              {/* FIRST LINE */}
              <span className="block">
                We Connect.
              </span>

              {/* SECOND LINE */}
              <span className="block">
                <span className="text-[#729B27]">You</span>{" "}
                Select.
              </span>

            </h2>
          </div>

          {/* SUBTEXT */}
          <div className="flex flex-col items-center text-center mb-6 w-full">
            <p className="text-[16px] sm:text-[18px] font-semibold text-[#1E293B] mb-1 leading-snug">
              Do you need a tradesperson?
            </p>

            <p className="text-[14px] sm:text-[15px] font-medium text-[#64748B] leading-normal">
              Post a job for free
            </p>
          </div>

          {/* BUTTON */}
          {isTrader ? (
            <button
              type="button"
              disabled
              title="Disabled for tradespeople"
              className="bg-[#6F9824]/40 text-white/70 px-8 py-3 rounded-[10px] font-bold text-[13px] sm:text-[14px] uppercase tracking-wider cursor-not-allowed shadow-none inline-flex items-center justify-center"
            >
              POST YOUR JOB
            </button>
          ) : (
            <Link
              href="/post-job"
              className="bg-[#6F9824] hover:bg-[#628620] text-white px-8 py-3 rounded-[10px] font-bold text-[13px] sm:text-[14px] uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 inline-flex items-center justify-center cursor-pointer"
            >
              POST YOUR JOB
            </Link>
          )}

        </motion.div>
      </div>
    </section>
  );
}