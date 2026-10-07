"use client";

import { useState } from "react";
import {
  FiUserCheck,
  FiStar,
  FiRefreshCw,
  FiCreditCard,
  FiAlertTriangle,
  FiChevronDown,
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
        <p className="font-bold text-white text-[14px]">How our vetting works</p>
        <p>Before appearing on TugaTrades, tradespeople go through a basic vetting process.</p>
        <p>We review:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Identity</strong> – identity information and documents submitted.</li>
          <li><strong>Business details</strong> – business information, where applicable.</li>
          <li><strong>Trade information</strong> – basic details about their trade and services.</li>
          <li><strong>Insurance</strong> – documents supplied by the tradesperson are reviewed where provided.</li>
        </ul>
        <div className="pt-1 space-y-1.5">
          <p className="font-bold text-white text-[14px]">What &ldquo;Vetted&rdquo; Means</p>
          <p>A <strong>Vetted</strong> Trader means that key information has been reviewed based on the documents and information submitted to TugaTrades during registration.</p>
          <p className="font-semibold text-white/90">It does not guarantee the quality of work, reliability, qualifications, insurance coverage or ongoing compliance.</p>
          <p className="font-semibold text-white/90">We do not carry out criminal background checks or independently verify trade qualifications.</p>
        </div>
        <p className="pt-1">Customers should always review the information provided, and carry out their own due diligence before hiring.</p>
      </div>
    ),
    icon: <FiUserCheck className="text-[#6E9625]" size={22} />,
  },
  {
    title: "Profiles & badges explained",
    description: (
      <div className="space-y-3">
        <p className="font-bold text-white text-[14px]">Trader profile badges</p>
        <p>
          You may see badges on trader profiles showing information that has been reviewed by TugaTrades, such as <strong>Individual checks</strong>, <strong>Trade checks</strong> or <strong>Insurance documents</strong>.
        </p>
        <p>
          These badges are based on information provided by the trader and reviewed at a specific point in time. They help you understand the trader&apos;s profile and make a more informed choice.
        </p>
        <p>
          <strong>Badges are not guarantees, certifications or endorsements.</strong> We recommend asking the trader for up-to-date documents where appropriate before starting any work.
        </p>
      </div>
    ),
    icon: <LuShieldCheck className="text-[#6E9625]" size={22} />,
  },
  {
    title: "Trusted reviews",
    description: (
      <div className="space-y-3">
        <p>We take reviews seriously.</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Only verified customers can leave reviews</li>
          <li>Reviews must reflect real experiences</li>
          <li>We monitor for suspicious or fake activity</li>
        </ul>
        <p>Honest feedback helps you choose the right trader.</p>
        <p>Reviews are opinions, not guarantees.</p>
        <p>For more info click <span className="underline font-medium text-[#89b341]">here</span>.</p>
      </div>
    ),
    icon: <FiStar className="text-[#6E9625]" size={22} />,
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
    icon: <LuShieldAlert className="text-[#6E9625]" size={22} />,
  },
  {
    title: "Maintaining trader quality",
    description: (
      <div className="space-y-3">
        <p className="font-bold text-white text-[14px]">Maintaining trader quality</p>
        <p>
          We monitor activity on the platform to help maintain a safe, reliable and trustworthy experience for customers and tradespeople.
        </p>
        <p>We may review trader activity where concerns are raised, including:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Customer complaints</strong> or recurring concerns</li>
          <li><strong>Review patterns</strong> or repeated poor experiences</li>
          <li><strong>Expired or outdated documents</strong></li>
          <li><strong>Misleading or inaccurate profiles</strong></li>
          <li><strong>Inappropriate or unacceptable behaviour</strong></li>
          <li>Other activity that may affect the safety or trust of the platform</li>
        </ul>
        <p className="pt-1">Where necessary, we may take action, including:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Warning the trader</strong></li>
          <li><strong>Temporarily limiting account activity</strong></li>
          <li><strong>Suspending the account while we investigate</strong></li>
          <li><strong>Removing the trader from the platform in serious or repeated cases</strong></li>
        </ul>
        <p className="pt-1">
          Each case is considered individually, based on the nature of the concern, available evidence and overall trader activity.
        </p>
        <p>
          <strong>Our aim is to maintain a fair, transparent and trustworthy platform for everyone.</strong>
        </p>
      </div>
    ),
    icon: <FiRefreshCw className="text-[#6E9625]" size={22} />,
    hideLearnMore: true,
  },
  {
    title: "Payments",
    description: (
      <div className="space-y-3">
        <p className="font-bold text-white text-[14px]">Payments</p>
        <p>TugaTrades does not process payments between customers and tradespeople.</p>
        <p>You and the tradesperson agree the price, payment terms and schedule directly.</p>
        <p>Before work begins, make sure you understand:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>What work is included</li>
          <li>Total price or pricing method</li>
          <li>Payment schedule</li>
          <li>Materials and additional costs</li>
          <li>Expected completion date</li>
        </ul>
      </div>
    ),
    icon: <FiCreditCard className="text-[#6E9625]" size={22} />,
    hideLearnMore: true,
  },
  {
    title: "If issues arise",
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
        <p>For full details, see our <span className="underline font-medium text-[#89b341]">Dispute Resolution Policy</span>.</p>
      </div>
    ),
    icon: <FiAlertTriangle className="text-[#6E9625]" size={22} />,
  },
  {
    title: "Insurance & protection",
    description: (
      <div className="space-y-3">
        <p className="font-bold text-white text-[14px]">Insurance &amp; Protection</p>
        <p>
          Some traders may provide insurance details on their profile. Where provided, the documentation has been reviewed by TugaTrades.
        </p>
        <p>This <strong>does not guarantee</strong> that:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>The policy is still active</li>
          <li>The coverage is suitable or sufficient for your job</li>
          <li>The information remains current</li>
        </ul>
        <p className="pt-1 font-semibold text-white/90">
          TugaTrades does not provide insurance, payment protection or guarantees for work carried out by traders.
        </p>
        <p>
          Always confirm insurance directly with the trader and carry out your own checks before work begins.
        </p>
      </div>
    ),
    icon: <LuShieldCheck className="text-[#6E9625]" size={22} />,
    hideLearnMore: true,
  },
];

export default function SafetySection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVettingModalOpen, setIsVettingModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  return (
    <section className="w-full py-16 md:py-24 bg-white px-6 md:px-12 overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-14"
        >
          <h2 className="text-[40px] md:text-[56px] font-bold leading-[1.05] mb-5 tracking-tight">
            <span className="text-[#243A24]">
              Your <span className="text-[#6E9625]">safety</span>
            </span>{" "}
            <span className="text-[#243A24]">matters</span>
          </h2>

          <p className="max-w-[860px] text-[#6F736C] text-[16px] md:text-[17px] leading-[1.75] font-medium">
            TugaTrades is designed to help you find reliable tradespeople with
            confidence. While we connect you with independent professionals, we
            also put systems in place to make your experience safer, more
            transparent, and easier to manage.
          </p>
        </motion.div>

        {/* 8 COMPACT SAFETY FEATURE CARDS (4x2 GRID) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 items-start">
          {safetyFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              onClick={() => {
                if (
                  feature.title === "How we vet traders" ||
                  feature.title === "Profiles & badges explained"
                ) {
                  setIsVettingModalOpen(true);
                } else if (
                  feature.title === "Trusted reviews" ||
                  feature.title === "Reviews you can trust"
                ) {
                  setIsReviewModalOpen(true);
                } else if (feature.title === "Staying safe when hiring") {
                  setIsModalOpen(true);
                } else if (
                  feature.title === "If issues arise" ||
                  feature.title === "If something goes wrong"
                ) {
                  setIsDisputeModalOpen(true);
                }
              }}
              className="group relative overflow-hidden bg-white border border-[#E2E6DE] rounded-[14px] p-3.5 sm:p-4 hover:bg-[#243A24] hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#243A24]/10 transition-all duration-500 cursor-pointer flex flex-col justify-between"
            >
              {/* TOP CONTENT: ICON + TITLE */}
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-[10px] bg-[#EEF4E8] border border-[#E8ECE2]/60 flex items-center justify-center shrink-0 transition-all duration-500 group-hover:bg-[#89b341]/10 group-hover:border-[#89b341]/20 group-hover:scale-105">
                    {feature.icon}
                  </div>
                  <h4 className="text-[14.5px] sm:text-[15.5px] font-bold text-[#1C2C1C] transition-colors duration-500 group-hover:text-white leading-[1.25]">
                    {feature.title}
                  </h4>
                </div>

                {/* HOVER CONTENT */}
                <div className="opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-[1000px] transition-all duration-700">
                  <div className="text-[13px] leading-relaxed text-white/80 pt-3.5 mt-2 border-t border-white/10 pb-2">
                    {feature.description}
                  </div>
                </div>
              </div>

              {/* BOTTOM CENTER CHEVRON */}
              <div className="flex justify-center pt-2">
                <FiChevronDown className="w-4 h-4 text-[#7A8B74] transition-all duration-500 group-hover:text-white/80 group-hover:rotate-180" />
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