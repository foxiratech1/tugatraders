"use client";

import { useState } from "react";
import {
  FiUserCheck,
  FiStar,
  FiRefreshCw,
  FiCreditCard,
  FiAlertTriangle,
  FiArrowRight,
} from "react-icons/fi";
import { LuShieldAlert, LuShieldCheck } from "react-icons/lu";
import { motion } from "framer-motion";
import TrustSafetyModal from "@/components/modal/TrustSafetyModal";
import VettingModal from "@/components/modal/VettingModal";
import ReviewPolicyModal from "@/components/modal/ReviewPolicyModal";
import DisputeModal from "@/components/modal/DisputeModal";

const safetyFeatures = [
  {
    title: "How we vet traders",
    description: (
      <div className="space-y-3">
        <p>Before traders can appear on the platform, they go through a vetting process.</p>
        <p>This may include:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Identity checks</li>
          <li>Business information review (where applicable)</li>
          <li>Supporting documents such as insurance or trade details</li>
        </ul>
        <p>We&apos;ve reviewed key information during sign-up.</p>
        <p>We do not guarantee the quality of work, reliability, or ongoing compliance.</p>
        <p>Always carry out your own checks before hiring.</p>
        <p>For more info click <span className="underline font-medium text-[#89b341]">here</span>.</p>
      </div>
    ),
    icon: <FiUserCheck className="text-[#6E9625]" size={20} />,
  },
  {
    title: "Profiles & badges explained",
    description: (
      <div className="space-y-3">
        <p>You may see badges such as:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Individual</li>
          <li>Trade</li>
          <li>Insured</li>
        </ul>
        <p>These are based on information provided by the trader and reviewed at a specific point in time.</p>
        <p>They help you make informed decisions, they are not guarantees or certifications.</p>
        <p>We recommend asking traders for up-to-date documents before starting any work.</p>
        <p>For more info click <span className="underline font-medium text-[#89b341]">here</span>.</p>
      </div>
    ),
    icon: <LuShieldCheck className="text-[#6E9625]" size={20} />,
  },
  {
    title: "Reviews you can trust",
    description: (
      <div className="space-y-3">
        <p>We take reviews seriously.</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Only verified customers can leave reviews</li>
          <li>Reviews must reflect real experiences</li>
          <li>We monitor for suspicious or fake activity</li>
        </ul>
        <p>Honest feedback helps you choose the right trader</p>
        <p>Reviews are opinions, not guarantees</p>
        <p>For more info click <span className="underline font-medium text-[#89b341]">here</span>.</p>
      </div>
    ),
    icon: <FiStar className="text-[#6E9625]" size={20} />,
  },
  {
    title: "Staying safe when hiring",
    description: (
      <div className="space-y-3">
        <p>We recommend taking a few simple steps before hiring to help you make informed decisions and avoid issues.</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>User responsibility: Users must verify traders themselves, compare options, and confirm all job details before hiring.</li>
          <li>Clear agreements reduce risk: Scope, pricing, timelines, and terms should always be agreed directly (preferably in writing).</li>
          <li>Content moderation rights: We may remove fake, abusive, defamatory, or illegal content and suspend accounts where necessary.</li>
          <li>No guarantee on content accuracy: Reviews and profiles are user-generated and may not be fully verified; users should exercise their own judgment.</li>
        </ul>
        <p>For more info click <span className="underline font-medium text-[#89b341]">here</span>.</p>
      </div>
    ),
    icon: <LuShieldAlert className="text-[#6E9625]" size={20} />,
  },
  {
    title: "Maintaining trader quality",
    description: (
      <div className="space-y-3">
        <p>We monitor activity on the platform to help ensure a safe and reliable experience for all users.</p>
        <p>If concerns are raised about a trader, we may review the situation and take action where necessary, including:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Warnings to the trader</li>
          <li>Temporary limits on account activity</li>
          <li>Suspension during investigation</li>
          <li>Removal from the platform in serious cases</li>
        </ul>
        <p>Each case is reviewed individually, based on the issue, available evidence, and overall trader activity.</p>
        <p>Our goal is to maintain a fair, transparent, and trustworthy platform for customers and tradespeople.</p>
      </div>
    ),
    icon: <FiRefreshCw className="text-[#6E9625]" size={20} />,
    hideLearnMore: true,
  },
  {
    title: "Payments",
    description: (
      <div className="space-y-3">
        <p>All payments are made <strong>directly between you and the trader</strong>.</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>We do not handle or process payments</li>
          <li>We do not hold funds or offer payment protection</li>
        </ul>
        <p>Always agree payment terms clearly before work begins.</p>
      </div>
    ),
    icon: <FiCreditCard className="text-[#6E9625]" size={20} />,
    hideLearnMore: true,
  },
  {
    title: "If something goes wrong",
    description: (
      <div className="space-y-3">
        <p>We encourage customers and traders to resolve issues directly first.</p>
        <p>If that&apos;s not possible:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>You can contact us with details of the issue</li>
          <li>We may review the situation and take action where appropriate</li>
          <li>This may include:</li>
          <ul className="list-[circle] pl-4 space-y-1">
            <li>Reviewing evidence</li>
            <li>Moderating reviews or content</li>
            <li>Taking action on accounts that breach our policies</li>
          </ul>
        </ul>
        <p>For full details, see our <span className="underline font-medium">Dispute Resolution Policy</span>.</p>
      </div>
    ),
    icon: <FiAlertTriangle className="text-[#6E9625]" size={20} />,
  },
  {
    title: "Insurance & protection",
    description: (
      <div className="space-y-3">
        <p>Some traders provide insurance details on their profile.</p>
        <p>This means documentation has been reviewed</p>
        <p>It does not guarantee:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>The policy is still active</li>
          <li>The coverage is suitable for your job</li>
        </ul>
        <p>Always confirm insurance directly with the trader before work starts.</p>
      </div>
    ),
    icon: <LuShieldCheck className="text-[#6E9625]" size={20} />,
    hideLearnMore: true,
  },
];

export default function SafetySection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVettingModalOpen, setIsVettingModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  return (
    <section className="w-full py-20 md:py-24 bg-white px-6 md:px-12 overflow-hidden">
      <div className="max-w-[1200px] mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <h2 className="text-[42px] md:text-[60px] font-bold leading-[1.05] mb-6">
            <span className="text-[#243A24]">Your <span className="text-[#6E9625]">safety</span></span>{" "}
            <span className="text-[#243A24]">matters</span>
          </h2>

          <p className="max-w-[860px] text-[#6F736C] text-[16px] md:text-[17px] leading-[1.8] font-medium">
            TugaTrades is designed to help you find reliable tradespeople with
            confidence. While we connect you with independent professionals, we
            also put systems in place to make your experience safer, more
            transparent, and easier to manage.
          </p>
        </motion.div>

        {/* INTERACTIVE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {safetyFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              onClick={() => {
                if (feature.title === "How we vet traders" || feature.title === "Profiles & badges explained") {
                  setIsVettingModalOpen(true);
                } else if (feature.title === "Reviews you can trust") {
                  setIsReviewModalOpen(true);
                } else if (feature.title === "Staying safe when hiring") {
                  setIsModalOpen(true);
                } else if (feature.title === "If something goes wrong") {
                  setIsDisputeModalOpen(true);
                }
              }}
              className="group relative overflow-hidden bg-[#F8F9F8] border border-[#D7DAD4] rounded-[30px] p-6 min-h-[220px] hover:bg-[#243A24] hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#243A24]/10 transition-all duration-500 cursor-pointer flex flex-col justify-start"
            >
              {/* TOP CONTENT */}
              <div className="mb-4">
                <div className="w-11 h-11 rounded-xl bg-white border border-[#E8ECE5] flex items-center justify-center mb-5 transition-all duration-500 group-hover:bg-[#89b341]/10 group-hover:border-[#89b341]/20 group-hover:scale-105">
                  {feature.icon}
                </div>

                <h4 className="text-[20px] md:text-[22px] leading-[1.2] font-bold text-[#243A24] transition-colors duration-500 group-hover:text-white">
                  {feature.title}
                </h4>
              </div>

              {/* HOVER CONTENT */}
              <div className="opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-[1000px] transition-all duration-700">
                <div className="text-[13px] leading-relaxed text-white/80 pb-4">
                  {feature.description}
                </div>

                {/* {!feature.hideLearnMore && (
                  <div className="flex items-center gap-2 mt-2 text-[#89b341] text-[14px] font-semibold">
                    Learn more
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                )} */}
              </div>

              {/* HOVER GLOW */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-[#89b341]/10 to-transparent pointer-events-none transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>

      <TrustSafetyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <VettingModal isOpen={isVettingModalOpen} onClose={() => setIsVettingModalOpen(false)} />
      <ReviewPolicyModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} />
      <DisputeModal isOpen={isDisputeModalOpen} onClose={() => setIsDisputeModalOpen(false)} />
    </section>
  );
}