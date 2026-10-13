"use client";

import React from "react";
import { motion } from "framer-motion";

export default function HiringSafelySection() {
  return (
    <section id="hiring-safely" className="w-full pb-16 md:pb-24 bg-white px-6 md:px-12 overflow-hidden scroll-mt-28">
      <div className="max-w-[1200px] mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-10"
        >
          <h2 className="text-[36px] md:text-[50px] font-bold leading-[1.1] mb-4 tracking-tight">
            <span className="text-[#243A24]">
              Hiring <span className="text-[#6E9625]">Safely</span>
            </span>
          </h2>

          <p className="max-w-[860px] text-[#6F736C] text-[16px] md:text-[17px] leading-[1.75] font-medium">
            TugaTrades helps you connect with independent tradespeople, but we always recommend taking a few simple steps before hiring anyone. These tips help you make informed decisions and avoid common issues.
          </p>
        </motion.div>

        {/* 4 CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          {/* Card 1: Tips before hiring a trader */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.4 }}
            className="bg-[#EBF1E6] rounded-[20px] p-6 sm:p-7 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-[17px] sm:text-[18px] font-bold text-[#1C2C1C] mb-2">
                Tips before hiring a trader
              </h3>
              <p className="text-[14px] text-[#3E4D3C] mb-3.5 font-medium">
                Before choosing a tradesperson, we recommend:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[14px] text-[#344131]">
                <li>Get multiple responses where possible</li>
                <li>Compare profiles, reviews, and experience</li>
                <li>Check photos of previous work</li>
                <li>Ask questions about their experience with similar jobs</li>
                <li>Confirm availability and timelines in advance</li>
              </ul>
            </div>
          </motion.div>

          {/* Card 2: Insurance and qualifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-[#EBF1E6] rounded-[20px] p-6 sm:p-7 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-[17px] sm:text-[18px] font-bold text-[#1C2C1C] mb-2">
                Insurance and qualifications
              </h3>
              <p className="text-[14px] text-[#3E4D3C] mb-3.5 font-medium">
                Depending on the type of work, you may wish to ask the trader for:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[14px] text-[#344131]">
                <li>Proof of insurance</li>
                <li>Relevant qualifications or certifications</li>
                <li>Business registration details (if applicable)</li>
              </ul>
            </div>
            <p className="text-[13px] text-[#4A5747] leading-relaxed pt-5 mt-2">
              Some traders may display &ldquo;insured&rdquo; or &ldquo;vetted&rdquo; badges on their profile. These indicate information provided at a point in time and should always be confirmed directly with the trader.
            </p>
          </motion.div>

          {/* Card 3: What to check before agreeing to work */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-[#EBF1E6] rounded-[20px] p-6 sm:p-7 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-[17px] sm:text-[18px] font-bold text-[#1C2C1C] mb-2">
                What to check before agreeing to work
              </h3>
              <p className="text-[14px] text-[#3E4D3C] mb-3.5 font-medium">
                Before any work begins, make sure you are clear on:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[14px] text-[#344131]">
                <li>The full scope of the job</li>
                <li>Total price or how pricing will be calculated</li>
                <li>Estimated start and completion dates</li>
                <li>Materials included or required</li>
                <li>Any deposits or payment terms agreed directly with the trader</li>
              </ul>
            </div>
            <p className="text-[13px] text-[#4A5747] leading-relaxed pt-5 mt-2">
              We recommend confirming all details in writing (email or message) where possible.
            </p>
          </motion.div>

          {/* Card 4: How to avoid common issues */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-[#EBF1E6] rounded-[20px] p-6 sm:p-7 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-[17px] sm:text-[18px] font-bold text-[#1C2C1C] mb-2">
                How to avoid common issues
              </h3>
              <p className="text-[14px] text-[#3E4D3C] mb-3.5 font-medium">
                To reduce the risk of misunderstandings:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[14px] text-[#344131]">
                <li>Avoid paying large upfront amounts where possible</li>
                <li>Do not rely on verbal agreements alone</li>
                <li>Be cautious of unusually low quotes compared to others</li>
                <li>Keep all communication records</li>
                <li>Ensure both parties clearly agree on expectations before work starts</li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* BOTTOM ROLE AND DISCLAIMER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 pt-6 space-y-4 text-[14.5px] text-[#344131] leading-relaxed"
        >
          <div>
            <strong className="text-[#1C2C1C] font-bold block mb-1">
              TugaTrades is a connection platform.
            </strong>
            <p>
              We help customers find and connect with independent tradespeople, but we are not involved in the work or the agreement between you.
            </p>
          </div>

          <div>
            <p>
              You and the tradesperson{" "}
              <strong className="text-[#1C2C1C] font-bold">
                agree the work, price, payment terms and schedule directly with each other.
              </strong>
            </p>
            <p>
              TugaTrades does not process payments, manage projects or guarantee the work or its outcome.
            </p>
            <p>
              We provide information to help you make an informed choice, but we always recommend carrying out your own checks before hiring.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
