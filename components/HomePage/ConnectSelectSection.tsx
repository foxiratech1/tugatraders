"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ConnectSelectSection() {
  return (
    <section className="w-full py-10 md:py-16 bg-white px-4 sm:px-6 overflow-hidden">
      <div className="max-w-[940px] mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14">
        
        {/* LEFT: Tradespeople Image with soft feathered vignette */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-[420px] md:max-w-[450px] aspect-[1.35/1] shrink-0"
        >
          <div className="relative w-full h-full overflow-hidden">
            <Image
              src="/We connect. You Select.png"
              alt="We Connect. You Select"
              fill
              className="object-cover object-center"
              priority
            />

            {/* Inset shadow vignette for smooth feathered edges */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_20px_#ffffff]" />

            {/* Edge fades to eliminate any hard line boundary */}
            <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none" />
          </div>
        </motion.div>

        {/* RIGHT: Text & Button */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center text-center justify-center max-w-[380px] w-full"
        >
          {/* Heading - Left-aligned internally so 'Select' starts flush under 'We Connect.' */}
          <div className="w-fit text-left mb-3">
            <h2 className="text-[32px] sm:text-[38px] md:text-[40px] font-extrabold text-[#1E3A2B] leading-[1.12] tracking-tight">
              We Connect. <span className="text-[#729B27]">You</span>
              <br />
              Select
            </h2>
          </div>

          {/* Subtext */}
          <p className="text-[15px] sm:text-[17px] font-semibold text-[#2D3748] mb-1 leading-snug">
            Do you need a tradesperson?
          </p>
          <p className="text-[14px] sm:text-[15px] font-medium text-[#4A5568] mb-6 leading-normal">
            Post a job for free
          </p>

          {/* Button */}
          <Link
            href="/post-job"
            className="bg-[#729B27] hover:bg-[#628620] text-white px-8 py-3 rounded-[10px] font-bold text-[13px] sm:text-[14px] uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 inline-flex items-center justify-center"
          >
            POST YOUR JOB
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
