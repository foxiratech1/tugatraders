"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { FiSearch, FiFileText, FiCheckCircle, FiStar, FiArrowRight, FiUsers } from "react-icons/fi";
import { LuLayoutDashboard, LuMessageSquare, LuClipboardCheck } from "react-icons/lu";
import { MdOutlineArrowRightAlt } from "react-icons/md";
import { motion } from "framer-motion";
import { slideFromLeft, slideFromRight, staggerContainer } from "./animationVariants";

export default function HowItWorks() {
  useEffect(() => {
    // If we land on the page from another route and the hash is #how-it-works
    if (typeof window !== "undefined" && window.location.hash === "#how-it-works") {
      setTimeout(() => {
        const el = document.getElementById('how-it-works');
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 300); // small delay allows page to layout properly
    }
  }, []);

  return (
    <motion.section
      id="how-it-works"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={slideFromLeft}


      className="w-full py-10 xl:py-16 bg-[#FDFDF9] px-4 sm:px-8 xl:px-12 overflow-hidden xl:overflow-visible"
    >
      <div className="max-w-[1240px] mx-auto w-full">
        {/* TITLE */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}


          className="text-[30px] sm:text-[38px] md:text-[50px] font-bold text-center mb-8 md:mb-12"
        >
          <span className="text-[#243A24]">How it</span>{" "}
          <span className="text-[#6E9625]">Works</span>
        </motion.h2>

        <div className="flex flex-col xl:flex-row justify-center gap-10 xl:gap-[40px] items-start w-full">

          {/* MAIN CONTENT COLUMN */}
          <div className="w-full xl:w-[760px] max-w-full space-y-12 flex flex-col mx-auto xl:mx-0">

            {/* BLOCK 1: Post Job */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}


              className="bg-[#D6DED0] border border-[#C4CEBE] rounded-[20px] xl:rounded-[24px] p-4 sm:p-5 xl:p-6 flex flex-col xl:flex-row items-center gap-4 relative overflow-hidden w-full"
            >
              <div className="flex-1 z-10">

                {/* ICON REMOVED */}

                <h3 className="text-[20px] md:text-[22px] font-bold text-[#243A24] leading-tight mb-5 md:mb-6">
                  Post your job, get quotes, hire a professional - All set!
                </h3>

                <Link
                  href="/post-job"
                  className="inline-flex items-center gap-2 bg-[#7FAE2E] hover:bg-[#7aa23a] text-white px-6 py-3 rounded-xl font-bold transition-colors group"
                >
                  Post Your Job
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="flex-1 relative w-full aspect-[4/3] md:aspect-auto"> <Image
                src="/image1.png"
                alt="Working on laptop"
                width={320}
                height={240}
                className="rounded-xl object-cover w-full max-w-[320px] h-auto shadow-lg"
              /> </div>
            </motion.div>

            {/* Sub-steps 1-3 */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
            >
              {[
                {
                  num: 1,
                  title: "Post your job",
                  desc: "Tell us what needs doing. Add photos, details, and your location to attract the right pros.",
                },
                {
                  num: 2,
                  title: "Get responses",
                  desc: "Receive up to 3 competitive quotes from local, vetted tradespeople ready to help.",
                },
                {
                  num: 3,
                  title: "Compare & choose",
                  desc: "Review profiles, past reviews, and quotes to select the perfect match for your project.",
                },
              ].map((step, index) => (
                <motion.div
                  key={step.num}
                  variants={slideFromRight}
                  className="relative group/card"
                >
                  <div className="bg-white border-[#E6EDE2] p-5 md:p-6 rounded-[20px] hover:shadow-xl hover:shadow-[#243A24]/5 transition-all h-full">
                    <div className="w-8 h-8 bg-[#243A24] text-white rounded-xl flex items-center justify-center text-[14px] font-bold mb-6">
                      {step.num}
                    </div>
                    <h4 className="text-[14px] font-bold text-[#243A24] mb-3">{step.title}</h4>
                    <p className="text-[16px] text-[#6B7280] font-normal">
                      {step.desc}
                    </p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:flex absolute top-12 -right-8 z-10 items-center">
                      <MdOutlineArrowRightAlt className="text-[#E6EDE2] text-[24px]" />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* BLOCK 2: Search Trade */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6 }}


                className="bg-[#D6DED0] rounded-[20px] xl:rounded-[24px] border border-[#C4CEBE] p-4 sm:p-5 xl:p-6 flex flex-col xl:flex-row items-center gap-4 mb-8 relative overflow-hidden w-full"
              >

                <div className="flex-1 z-10">

                  <h3 className="text-[20px] md:text-[24px] font-bold text-[#6E9625] leading-tight mb-5 md:mb-6">
                    Search a trade, choose your trader, get in touch - All set!
                  </h3>
                  <Link
                    href="/directory-listing/search"
                    className="inline-flex items-center gap-2 bg-[#243A24] text-white px-6 py-3 rounded-xl font-bold transition-colors group"
                  >
                    Browse Tradespeople
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="flex-1 relative w-full aspect-[4/3] md:aspect-auto">
                  <Image
                    src="/image2.png"
                    alt="Electrician working"
                    width={320}
                    height={240}
                    className="rounded-xl object-cover w-full max-w-[320px] h-auto shadow-lg"
                  />
                </div>
              </motion.div>

              {/* Sub-steps 1-3 (repeat for block 2) */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
              >
                {[
                  {
                    num: 1,
                    title: "Browse trades",
                    desc: "Explore our comprehensive directory of vetted professionals across all trades.",
                  },
                  {
                    num: 2,
                    title: "Select your trade",
                    desc: "Filter by skill, service area, and ratings to find exactly what you need.",
                  },
                  {
                    num: 3,
                    title: "Connect",
                    desc: "Contact a tradesperson directly through our secure platform to discuss your needs.",
                  },
                ].map((step, index) => (
                  <motion.div
                    key={step.num}
                    variants={slideFromRight}
                    className="relative group/card"
                  >
                    <div className="bg-white border-[#E6EDE2] p-5 md:p-6 rounded-[20px] hover:shadow-xl hover:shadow-[#243A24]/5 transition-all h-full">
                      <div className="w-8 h-8 bg-[#243A24] text-white rounded-xl flex items-center justify-center text-[14px] font-bold mb-6">
                        {step.num}
                      </div>
                      <h4 className="text-[14px] font-bold text-[#1F4B2A] mb-3">{step.title}</h4>
                      <p className="text-[16px] text-[#6B7280] font-normal">
                        {step.desc}
                      </p>
                    </div>
                    {index < 2 && (
                      <div className="hidden md:flex absolute top-12 -right-8 z-10 items-center">
                        <MdOutlineArrowRightAlt className="text-[#E6EDE2] text-[24px]" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* RIGHT SIDEBAR (The Final Steps) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full xl:w-[421px] max-w-[500px] xl:max-w-none mt-8 xl:mt-[195px] mx-auto xl:mx-0"
          >
            <div
              className="bg-[#D6DED0] rounded-[24px] pt-[32px] xl:pt-[42px] px-[24px] xl:px-[32px] pb-[32px] flex flex-col justify-between border border-[#C4CEBE] w-full min-h-[auto] xl:min-h-[715px] xl:h-[715px]"
              style={{
                boxShadow: '0px 4px 6px -2px #0000000A, 0px 10px 30px -5px #00000014'
              }}
            >
              <div>
                <h3 className="text-[30px] font-bold text-[#243A24] mb-4">The Final Steps</h3>

                <p className="text-[#1F4B2A] text-[14px] leading-relaxed mb-12 whitespace-nowrap">
                  Completing your project is secure and rewarding.
                </p>

                <div className="space-y-12 mb-12">
                  {/* Step 4 */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-[#243A24] text-white rounded-xl flex-shrink-0 flex items-center justify-center text-[13px] font-bold mt-1">
                      4
                    </div>
                    <div>
                      <h4 className="text-[17px] font-bold text-[#1F4B2A] mb-2 flex items-center gap-2">
                        Agree & get it done! 🤝
                      </h4>
                      <p className="text-[14px] text-[#3A5A44] leading-relaxed">
                        You and the trader agree on the terms, timeline, and price. Work begins with confidence knowing you've made an informed choice through our platform.
                      </p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-[#243A24] text-white rounded-xl flex-shrink-0 flex items-center justify-center text-[13px] font-bold mt-1">
                      5
                    </div>
                    <div>
                      <h4 className="text-[17px] font-bold text-[#1F4B2A] mb-2 flex items-center gap-2">
                        Leave a review ⭐
                      </h4>
                      <p className="text-[14px] text-[#3A5A44] leading-relaxed mb-6">
                        Share your experience by leaving a review. This helps the tradesperson build their reputation and assists future customers in making great choices.
                      </p>

                      {/* Review Card */}
                      <div className="bg-white rounded-[12px] p-4 shadow-sm border border-[#E6EDE2] flex items-center gap-3 mt-4 w-fit">
                        <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                          <Image src="/avt.png" alt="User" width={32} height={32} className="object-cover h-full w-full" />
                        </div>
                        <div>
                          <div className="flex text-[#EAB308] gap-0.5 mb-0.5">
                            {[...Array(5)].map((_, i) => (
                              <FiStar key={i} size={10} fill="currentColor" />
                            ))}
                          </div>
                          <p className="text-[12px] font-medium text-[#243A24] italic">
                            "Fantastic job, highly recommended!"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ready to start? */}
              <div className="pt-8 border-t border-[#1F4B2A1A] flex items-center justify-between">
                <span className="text-[14px] font-bold text-[#1F4B2A]">Ready to start?</span>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-[#DEE7D7] shadow-sm">
                      <Image src="/combo.png" alt="Pro" width={32} height={32} className="object-cover h-full w-full" />
                    </div>
                  ))}

                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* BOTTOM SECTION */}

      {/* BOTTOM SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="mt-12 xl:mt-20 flex flex-col items-center justify-center text-center mx-auto w-full max-w-screen-lg"
      >
        <div className="w-full max-w-[540px] h-[1px] bg-[#6E962533] mb-16 mx-auto"></div>

        <h2 className="text-[30px] sm:text-[36px] xl:text-[48px] font-bold mb-6">
          <span className="text-[#243A24]">We connect &</span>{" "}
          <span className="text-[#6E9625]">you</span>{" "}
          <span className="text-[#243A24]">select.</span>
        </h2>

        <p className="max-w-[800px] text-[#6F736C] text-[18px] leading-relaxed mb-12 font-medium">
          Every trader on our platform is vetted*, so you can choose with confidence -<br />
          TugaTrades makes it easy to find skilled, dependable professionals for the job.
        </p>

        <Link
          href="/directory-listing/search"
          className="inline-flex items-center gap-3 bg-[#C60C03] text-white px-10 py-5 rounded-2xl font-bold text-[18px]"
        >
          Get Started Now
          <FiArrowRight />
        </Link>
      </motion.div>
    </motion.section>
  );
}
