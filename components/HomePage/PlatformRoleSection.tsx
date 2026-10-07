"use client";

import Image from "next/image";
import Link from "next/link";
import { FiCheck, FiMail } from "react-icons/fi";
import { motion } from "framer-motion";

const PlatformRoleSection = () => {
  return (
    <section className="bg-white py-16 md:py-20 border-t border-gray-100">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-[30px] sm:text-[34px] font-bold text-[#1E3A2B] tracking-tight leading-tight mb-2">
                TugaTrades <span className="text-[#6E9625]">Role</span>
              </h2>
              <p className="text-[14px] text-[#4A5548] font-medium leading-relaxed">
                TugaTrades is a platform connecting customers with independent tradespeople.
              </p>
            </div>

            {/* Intro */}
            <p className="text-[14px] font-medium text-[#1E3A2B] mb-4">
              We provide the tools to:
            </p>

            {/* 3 Checklist Items */}
            <div className="space-y-3.5 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <FiCheck className="text-[#1E3A2B] stroke-[3]" size={16} />
                  <span className="font-bold text-[15px] text-[#1E3A2B]">Find</span>
                </div>
                <p className="text-[13.5px] text-[#4A5548] pl-6 mt-0.5 leading-relaxed">
                  Discover tradespeople by trade, service and location.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <FiCheck className="text-[#1E3A2B] stroke-[3]" size={16} />
                  <span className="font-bold text-[15px] text-[#1E3A2B]">Compare</span>
                </div>
                <p className="text-[13.5px] text-[#4A5548] pl-6 mt-0.5 leading-relaxed">
                  View profiles, services and customer reviews to help you make an informed choice.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <FiCheck className="text-[#1E3A2B] stroke-[3]" size={16} />
                  <span className="font-bold text-[15px] text-[#1E3A2B]">Connect</span>
                </div>
                <p className="text-[13.5px] text-[#4A5548] pl-6 mt-0.5 leading-relaxed">
                  Communicate directly with the tradesperson about your project, availability and pricing.
                </p>
              </div>
            </div>

            {/* What TugaTrades does not do */}
            <div className="mb-5">
              <p className="font-bold text-[14.5px] text-[#1E3A2B] mb-2">
                What TugaTrades does <span className="underline underline-offset-2">not</span> do
              </p>
              <ul className="space-y-1 text-[13.5px] text-[#4A5548]">
                <li className="flex items-center gap-2">
                  <span className="text-[#1E3A2B] text-base leading-none">•</span>
                  <span>Employ tradespeople</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#1E3A2B] text-base leading-none">•</span>
                  <span>Manage or oversee your project</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#1E3A2B] text-base leading-none">•</span>
                  <span>Process payments between customers and tradespeople</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#1E3A2B] text-base leading-none">•</span>
                  <span>Guarantee the work or its outcome</span>
                </li>
              </ul>
            </div>

            {/* Disclaimer & Footer */}
            <div className="text-[13.5px] text-[#1E3A2B] leading-relaxed">
              <p className="font-bold mb-1">
                The agreement for the work is directly between you and the independent tradesperson.
              </p>
              <p className="text-[#4A5548]">
                For more info visit our{" "}
                <Link
                  href="/trust-safety"
                  className="underline font-semibold text-[#1E3A2B] hover:text-[#6E9625] transition-colors"
                >
                  'Trust & Safety'
                </Link>{" "}
                page.
              </p>
            </div>
          </motion.div>

          {/* Right Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 flex items-center justify-center lg:justify-end"
          >
            <div className="relative overflow-hidden rounded-[26px] bg-[#162717] p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between w-full max-w-[370px] min-h-[410px]">

              {/* Background Image with Overlay */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/Concern.jfif"
                  alt="Contact Support"
                  fill
                  className="object-cover object-[center_10%]"
                  priority
                />
                <div className="absolute inset-0 bg-[#162617]/72" />
              </div>

              {/* Card Content */}
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <h3 className="mb-2.5 text-[26px] sm:text-[28px] font-bold leading-[1.18] tracking-tight text-white">
                    Have questions
                    <br /> or concerns?
                  </h3>

                  <p className="mb-6 text-[13px] font-normal text-white/80 leading-relaxed max-w-[290px]">
                    Our support team is available to help you navigate the platform safely and effectively.
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-[#6E9625]">
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
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default PlatformRoleSection;