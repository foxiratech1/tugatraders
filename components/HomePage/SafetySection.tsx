"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

const safetyFeatures = [
  {
    title: "How we vet traders",
    description:
      "Every trader goes through checks and profile verification before joining our platform.",
    icon: <FiUserCheck className="text-[#6E9625]" size={20} />,
  },
  {
    title: "Profiles & badges explained",
    description:
      "Understand trader profiles, badges, and trust indicators with complete clarity.",
    icon: <LuShieldCheck className="text-[#6E9625]" size={20} />,
  },
  {
    title: "Reviews you can trust",
    description:
      "Real customer feedback helps you make informed and confident hiring decisions.",
    icon: <FiStar className="text-[#6E9625]" size={20} />,
  },
  {
    title: "Staying safe when hiring",
    description:
      "Helpful guidance and recommendations to protect you during every stage of hiring.",
    icon: <LuShieldAlert className="text-[#6E9625]" size={20} />,
  },
  {
    title: "Maintaining trader quality",
    description:
      "We continuously monitor quality and platform standards to improve user experience.",
    icon: <FiRefreshCw className="text-[#6E9625]" size={20} />,
  },
  {
    title: "Payment",
    description:
      "Transparent communication and secure payment guidance for both customers and traders.",
    icon: <FiCreditCard className="text-[#6E9625]" size={20} />,
  },
  {
    title: "If something goes wrong",
    description:
      "Access support and reporting options if you encounter an issue with a trader.",
    icon: <FiAlertTriangle className="text-[#6E9625]" size={20} />,
  },
  {
    title: "Insurance & protection",
    description:
      "Learn more about insurance expectations and protections available on the platform.",
    icon: <LuShieldCheck className="text-[#6E9625]" size={20} />,
  },
];

export default function SafetySection() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVettingModalOpen, setIsVettingModalOpen] = useState(false);

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
                  router.push("/terms?tab=review");
                } else if (feature.title === "Staying safe when hiring") {
                  setIsModalOpen(true);
                }
              }}
              className="group relative overflow-hidden bg-[#F8F9F8] border border-[#D7DAD4] rounded-[30px] p-6 min-h-[220px] hover:bg-[#243A24] hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#243A24]/10 transition-all duration-500 cursor-pointer flex flex-col justify-between"
            >
              {/* TOP CONTENT */}
              <div>
                <div className="w-11 h-11 rounded-xl bg-white border border-[#E8ECE5] flex items-center justify-center mb-5 transition-all duration-500 group-hover:bg-[#89b341]/10 group-hover:border-[#89b341]/20 group-hover:scale-105">
                  {feature.icon}
                </div>

                <h4 className="text-[20px] md:text-[22px] leading-[1.2] font-bold text-[#243A24] transition-colors duration-500 group-hover:text-white">
                  {feature.title}
                </h4>
              </div>

              {/* HOVER CONTENT */}
              <div className="opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-[220px] transition-all duration-500">
                <p className="text-[14px] leading-relaxed text-white/75 mt-4">
                  {feature.description}
                </p>

                <div className="flex items-center gap-2 mt-5 text-[#89b341] text-[14px] font-semibold">
                  Learn more
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>

              {/* HOVER GLOW */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-[#89b341]/10 to-transparent pointer-events-none transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>

      <TrustSafetyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <VettingModal isOpen={isVettingModalOpen} onClose={() => setIsVettingModalOpen(false)} />
    </section>
  );
}