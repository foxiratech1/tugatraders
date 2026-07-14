"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ListChecks, ShieldCheck, X, CheckCircle2 } from "lucide-react";
import { IoIosWarning } from "react-icons/io";
import { FaFileContract } from "react-icons/fa6";

interface TrustSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrustSafetyModal({ isOpen, onClose }: TrustSafetyModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 mt-6 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-[900px] max-h-[95vh] flex flex-col bg-white rounded-[32px] overflow-hidden shadow-2xl m-auto"
          >
            {/* Header Image Area */}
            <div className="relative h-[240px] md:h-[300px] w-full shrink-0">
              <img src="/trustyman.png" alt="Trustyman" className="absolute inset-0 w-full h-full object-cover" />
              <div className="" />

              <button
                onClick={onClose}
                className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 rounded-full text-white transition-colors z-10"
              >
                <X size={18} strokeWidth={2} />
              </button>

              <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white z-10 w-full">
                <h2 className="text-[28px] md:text-[36px] font-normal mb-3">Hiring safely</h2>
                <p className="text-[#FFFFFF] max-w-[750px] text-[14px] md:text-[14px] leading-relaxed font-light">
                  TugaTrades helps you connect with independent tradespeople, but we recommend taking<br /> a
                  few simple steps before hiring. These tips help you make informed decisions and avoid<br />
                  common issues.
                </p>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-5 md:p-8 bg-white overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">

                {/* Card 1 */}
                <div className="border border-gray-100 rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                  <div className="w-10 h-10 rounded-[14px] bg-[#f4f7f2] flex items-center justify-center text-[#89b341] mb-4">
                    <ListChecks size={20} />
                  </div>
                  <h3 className="text-[17px] font-semibold text-gray-800 mb-4">Tips before hiring a trader</h3>
                  <ul className="space-y-3">
                    {[
                      "Get multiple quotes for comparison",
                      "Compare profiles and read reviews",
                      "Check previous work photos",
                      "Ask about specific experience",
                      "Confirm availability and timelines"
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 size={16} className="text-[#89b341] flex-shrink-0 mt-0.5" fill="#89b341" color="white" />
                        <span className="text-gray-500 text-[14px]">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card 2 */}
                <div className="border border-gray-100 rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                  <div className="w-10 h-10 rounded-[14px] bg-[#f4f7f2] flex items-center justify-center text-[#89b341] mb-4">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="text-[17px] font-semibold text-gray-800 mb-4">Insurance and qualifications</h3>
                  <ul className="space-y-3 mb-4">
                    {[
                      "Request proof of public liability insurance",
                      "Verify trade-specific certifications",
                      "Confirm business registration details"
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 size={16} className="text-[#89b341] flex-shrink-0 mt-0.5" fill="#89b341" color="white" />
                        <span className="text-gray-500 text-[14px]">{text}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-[#f4f7f2]/50 rounded-xl p-3 flex gap-2">
                    <CheckCircle2 size={14} className="text-[#89b341] flex-shrink-0 mt-0.5" fill="#89b341" color="white" />
                    <span className="text-[12px] text-gray-500 leading-[1.4]">
                      Verification badges on TugaTrades are based on info provided by the trader.
                    </span>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="border border-gray-100 rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                  <div className="w-10 h-10 rounded-[14px] bg-[#f4f7f2] flex items-center justify-center text-[#89b341] mb-4">
                    <FaFileContract size={20} />
                  </div>
                  <h3 className="text-[17px] font-semibold text-gray-800 mb-4">Before agreeing to work</h3>
                  <ul className="space-y-3">
                    {[
                      "Define full scope of the project",
                      "Agree on a fixed total price"
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 size={16} className="text-[#89b341] flex-shrink-0 mt-0.5" fill="#89b341" color="white" />
                        <span className="text-gray-500 text-[14px]">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card 4 */}
                <div className="border border-gray-100 rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                  <div className="w-10 h-10 rounded-[14px] bg-[#f4f7f2] flex items-center justify-center text-[#89b341] mb-4">
                    <IoIosWarning size={20} />
                  </div>
                  <h3 className="text-[17px] font-semibold text-gray-800 mb-4">How to avoid common issues</h3>
                  <ul className="space-y-3">
                    {[
                      "Avoid large upfront payments",
                      "Don't rely on verbal-only agreements"
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 size={16} className="text-[#89b341] flex-shrink-0 mt-0.5" fill="#89b341" color="white" />
                        <span className="text-gray-500 text-[14px]">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
