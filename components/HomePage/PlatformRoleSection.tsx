"use client";

import Image from "next/image";
import Link from "next/link";
import { FiShield, FiMail } from "react-icons/fi";
import { motion } from "framer-motion";

const PlatformRoleSection = () => {
  return (
    <section className="bg-white py-24 border-t border-gray-100">
      <div className="mx-auto max-w-[1300px] px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col"
          >
            {/* Badge */}
            <div className="mb-6 flex">
              <div className="flex items-center gap-2 rounded-full bg-[#243A24] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white">
                <FiShield className="text-[#84cc16]" size={14} />
                OUR ROLE AS A PLATFORM
              </div>
            </div>

            {/* Main Heading */}
            {/* Main Heading */}
            <h2 className="mb-6 text-[36px] md:text-[46px] lg:text-[56px] font-bold leading-[1.05] text-[#243A24] tracking-tight">
              TugaTrades is a platform that
              connects customers with <span className="text-[#6E9625]">
                independent Tradespeople.
              </span>
            </h2>

            {/* Subtext */}
            <p className="mb-10 max-w-[540px] text-[16px] text-[#6F736C] leading-relaxed font-medium">
              Our role is to provide tools, transparency, and support, so you can make informed decisions.
            </p>

            {/* Features Row */}
            <div className="flex flex-wrap lg:flex-nowrap items-start lg:items-center gap-y-6 pt-10">

              <div className="pr-8 lg:pr-12">
                <p className="text-[12px] font-bold text-[#1F1F1F] mb-1">
                  We do not
                </p>
                <p className="text-[15px] font-bold text-[#1F1F1F] whitespace-nowrap">
                  Employ traders
                </p>
              </div>

              <div className="hidden sm:block h-[50px] w-[1px] bg-[#C1CCB8]"></div>

              <div className="sm:px-8 lg:px-12">
                <p className="text-[12px] font-bold text-[#1F1F1F] mb-1">
                  We do not
                </p>
                <p className="text-[15px] font-bold text-[#1F1F1F] whitespace-nowrap">
                  Manage jobs
                </p>
              </div>

              <div className="hidden sm:block h-[50px] w-[1px] bg-[#C1CCB8]"></div>

              <div className="sm:pl-8 lg:pl-12">
                <p className="text-[12px] font-bold text-[#1F1F1F] mb-1">
                  We do not
                </p>
                <p className="text-[15px] font-bold text-[#1F1F1F] whitespace-nowrap">
                  Guarantee outcomes
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 flex items-center justify-center lg:justify-end"
          >
            <div className="relative overflow-hidden rounded-[28px] bg-[#162717] p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between w-full max-w-[380px] min-h-[420px]">

              {/* Background Image with Overlay */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/Contact Support.png"
                  alt="Contact Support"
                  fill
                  className="object-cover object-[center_10%]"
                  priority
                />
                {/* Green tinted overlay matching screenshot */}
                <div className="absolute inset-0 bg-[#162617]/72" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#162617]/50 via-[#182a19]/70 to-[#122013]/92" />
              </div>

              {/* Card Content */}
              <div className="relative z-10 flex flex-col">
                <h3 className="mb-2.5 text-[26px] sm:text-[28px] font-bold leading-[1.18] tracking-tight text-white">
                  Have questions
                  <br /> or concerns?
                </h3>

                <p className="mb-6 text-[13px] font-normal text-white/80 leading-relaxed max-w-[290px]">
                  Our support team is available to help you navigate the platform safely and effectively.
                </p>

                <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-wider text-[#6E9625]">
                  OFFICIAL CONTACT
                </p>

                {/* Email Box */}
                <div className="mb-3.5 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#252C24]/90 px-3.5 py-3 backdrop-blur-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#84cc16]/50 bg-transparent flex-shrink-0">
                    <FiMail className="text-[#84cc16]" size={15} />
                  </div>

                  <span className="text-[13.5px] sm:text-[14px] font-bold text-white tracking-tight">
                    contact@tugatrades.com
                  </span>
                </div>

                {/* FAQ Button */}
                <Link
                  href="/faq"
                  className="w-full flex justify-center items-center rounded-xl bg-[#6E9625] hover:bg-[#5C7F1F] py-3 text-[14px] font-bold text-white transition-all shadow-md active:scale-[0.99]"
                >
                  FAQs
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default PlatformRoleSection;