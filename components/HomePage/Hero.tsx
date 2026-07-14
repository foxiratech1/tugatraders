"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiUserPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import { slideFromLeft, slideFromRight } from "./animationVariants";

export default function Hero() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={slideFromLeft}
      className="relative min-h-screen w-full overflow-hidden pt-32 pb-20 px-6"
    >

      {/* BACKGROUND IMAGE */}
      <motion.div variants={slideFromRight} className="absolute inset-0 z-0">
        <Image
          src="/homepage.png"
          alt="Tradespeople working"
          fill
          className="object-cover object-center"
          priority
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(36, 58, 36, 0.8) 0%, rgba(36, 58, 36, 0) 50%, #243A24 100%)" }}
        />
      </motion.div>

      <div className="relative z-10 max-w-[1400px] mx-auto flex flex-col items-center text-center ">

        {/* HERO TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[36px] sm:text-[48px] md:text-[72px] font-bold text-white tracking-tight leading-[1.1] mb-4 max-w-[1000px]"
        >
          Portugal&apos;s Smarter Way to <br className="hidden md:block" />
          Find Local <span className="text-[#89b341]">Tradespeople</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-[16px] md:text-[18px] text-white/90 font-medium mb-12 md:mb-16"
        >
          Fast. Simple. Hassle-free!
        </motion.p>

        {/* CARDS GRID */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-[1000px] mb-12"
        >

          {/* SEARCH CARD */}
          <div className="bg-white/95 backdrop-blur-sm rounded-[32px] p-6 sm:p-8 md:p-10 text-left flex flex-col justify-between shadow-2xl">
            <div>
              <h2 className="text-[24px] md:text-[28px] font-bold text-[#1d3321] leading-tight mb-4">
                Search All The Trades <br /> You Need In One Place.
              </h2>
              <p className="text-[14px] text-gray-500 font-medium leading-relaxed mb-8 max-w-[320px]">
                Quickly connect with a local, trusted tradespeople to get the job done.
              </p>
            </div>
            <Link href="/directory-listing" className="inline-flex items-center justify-between w-full rounded-full bg-[#1d3321] px-6 py-4 text-[15px] font-bold text-white hover:bg-[#152719] transition-all">
              <span>Browse Trade Services</span>
              <FiArrowRight size={20} className="" />
            </Link>
          </div>

          {/* POST JOB CARD */}
          <div className="bg-white/95 backdrop-blur-sm rounded-[32px] p-6 sm:p-8 md:p-10 text-left flex flex-col justify-between shadow-2xl">
            <div>
              <h2 className="text-[24px] md:text-[28px] font-bold text-[#1d3321] leading-tight mb-4">
                Post Your Job - <br /> Get Quotes Fast
              </h2>
              <p className="text-[14px] text-gray-500 font-medium leading-relaxed mb-8 max-w-[320px]">
                We connect you with vetted and reliable tradespeople so you don&apos;t have to search.
              </p>
            </div>
            <Link href="/post-job" className="inline-flex items-center justify-between w-full rounded-full bg-[#7ca13a] px-6 py-4 text-[15px] font-bold text-white hover:bg-[#6c8d32] transition-all">
              <span>Get Free Quotes</span>
              <FiArrowRight size={20} />
            </Link>
          </div>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-[1100px] backdrop-blur-xl border border-white/10 rounded-[40px] p-6 sm:p-8 md:p-12 text-center lg:text-left flex flex-col lg:flex-row justify-between items-center gap-10"
          style={{ background: "linear-gradient(90deg, rgba(110, 150, 37, 0.1) 0%, rgba(110, 150, 37, 0) 100%)" }}
        >

          <div className="w-full lg:max-w-[500px]">
            <h3 className="text-[22px] sm:text-[24px] font-bold text-white mb-4 leading-tight">
              Join the directory & grow your business
            </h3>
            <div className="space-y-4">
              <p className="text-[14px] text-white/70 leading-relaxed mx-auto lg:mx-0 max-w-[400px] lg:max-w-none">
                Get listed in TugaTrades directory and connect with homeowners and property managers looking for reliable professionals.
              </p>
              <p className="text-[14px] text-white/70 leading-relaxed">
                Get regular work opportunities for a fixed monthly subscription.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-end gap-6 min-w-[300px]">
            <p className="text-[20px] font-bold text-white text-center lg:text-right">
              Your Next Job Is Just One Click Away
            </p>
            <Link href="/trader-signup" className="inline-flex items-center gap-3 rounded-full bg-[#d91e1e] px-8 py-4 text-[15px] font-bold text-white hover:bg-[#b81919] transition-all shadow-xl shadow-red-900/20">
              <FiUserPlus size={20} />
              <span>Join as a Tradesperson</span>
            </Link>
            <p className="text-[11px] font-bold tracking-[2px] text-[#89b341] uppercase">
              First 3 Months Free!*
            </p>
          </div>

        </motion.div>

      </div>
    </motion.section>
  );
}
