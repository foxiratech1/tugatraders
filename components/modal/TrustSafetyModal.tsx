"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListChecks, ShieldCheck, X, CheckCircle2 } from "lucide-react";
import { IoIosWarning } from "react-icons/io";
import { FaFileContract } from "react-icons/fa6";

interface TrustSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrustSafetyModal({ isOpen, onClose }: TrustSafetyModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Lock body scroll and forward backdrop wheel events to modal content
  useEffect(() => {
    const backdrop = backdropRef.current;
    if (!isOpen || !backdrop) return;

    document.body.style.overflow = "hidden";

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (scrollRef.current) {
        scrollRef.current.scrollTop += e.deltaY;
      }
    };

    backdrop.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      backdrop.removeEventListener("wheel", onWheel);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div ref={backdropRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 mt-6 backdrop-blur-sm overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-[900px] max-h-[95vh] flex flex-col bg-white rounded-[32px] overflow-hidden shadow-2xl m-auto"
          >
            {/* Header Image Area */}
            <div className="relative h-[240px] md:h-[300px] w-full shrink-0">
              <img src="/hiringimage.png" alt="Trustyman" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />

              <button
                onClick={onClose}
                className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 rounded-full text-white transition-colors z-10"
              >
                <X size={18} strokeWidth={2} />
              </button>

              <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white z-10 w-full">
                <h2 className="text-[26px] md:text-[32px] font-bold mb-1.5 tracking-tight text-white">Hiring safely</h2>
                <p className="text-white/80 max-w-[750px] text-[14px] md:text-[15px] leading-relaxed font-light">
                  TugaTrades helps you connect with independent tradespeople, but we always recommend taking a<br className="hidden md:block" />
                  few simple steps before hiring anyone. These tips help you make informed decisions and avoid<br className="hidden md:block" />
                  common issues.
                </p>
              </div>
            </div>

            {/* Content Area */}
            <div ref={scrollRef} className="p-5 md:p-8 bg-white overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">

                {/* Card 1 */}
                <div className="border border-gray-100 rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                  <div className="w-10 h-10 rounded-[14px] bg-[#f4f7f2] flex items-center justify-center text-[#89b341] mb-4">
                    <ListChecks size={20} />
                  </div>
                  <h3 className="text-[17px] font-semibold text-gray-800 mb-2">Tips before hiring a trader</h3>
                  <p className="text-[14px] text-gray-600 mb-4">Before choosing a tradesperson, we recommend:</p>
                  <ul className="space-y-3">
                    {[
                      "Get multiple quotes where possible",
                      "Compare profiles, reviews, and experience",
                      "Check photos of previous work",
                      "Ask questions about their experience with similar jobs",
                      "Confirm availability and timelines in advance"
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 size={16} className="text-[#89b341] flex-shrink-0 mt-0.5" fill="#89b341" color="white" />
                        <span className="text-gray-500 text-[14px]">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card 2 */}
                <div className="border border-gray-100 rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col">
                  <div className="w-10 h-10 rounded-[14px] bg-[#f4f7f2] flex items-center justify-center text-[#89b341] mb-4">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="text-[17px] font-semibold text-gray-800 mb-2">Insurance and qualifications</h3>
                  <p className="text-[14px] text-gray-600 mb-4">Depending on the type of work, you may wish to ask the trader for:</p>
                  <ul className="space-y-3 mb-4 flex-1">
                    {[
                      "Proof of insurance",
                      "Relevant qualifications or certifications",
                      "Business registration details (if applicable)"
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 size={16} className="text-[#89b341] flex-shrink-0 mt-0.5" fill="#89b341" color="white" />
                        <span className="text-gray-500 text-[14px]">{text}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-[#f4f7f2]/50 rounded-xl p-3 flex gap-2 mt-auto">
                    <CheckCircle2 size={14} className="text-[#89b341] flex-shrink-0 mt-0.5" fill="#89b341" color="white" />
                    <span className="text-[12px] text-gray-500 leading-[1.4]">
                      Some traders may display "insured" or "vetted" badges on their profile. These indicate information provided at a point in time and should always be confirmed directly with the trader.
                    </span>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="border border-gray-100 rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col">
                  <div className="w-10 h-10 rounded-[14px] bg-[#f4f7f2] flex items-center justify-center text-[#89b341] mb-4">
                    <FaFileContract size={20} />
                  </div>
                  <h3 className="text-[17px] font-semibold text-gray-800 mb-2">What to check before agreeing to work</h3>
                  <p className="text-[14px] text-gray-600 mb-4">Before any work begins, make sure you are clear on:</p>
                  <ul className="space-y-3 mb-4 flex-1">
                    {[
                      "The full scope of the job",
                      "Total price or how pricing will be calculated",
                      "Estimated start and completion dates",
                      "Materials included or required",
                      "Any deposits or payment terms agreed directly with the trader"
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 size={16} className="text-[#89b341] flex-shrink-0 mt-0.5" fill="#89b341" color="white" />
                        <span className="text-gray-500 text-[14px]">{text}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-[#f4f7f2]/50 rounded-xl p-3 flex gap-2 mt-auto">
                    <CheckCircle2 size={14} className="text-[#89b341] flex-shrink-0 mt-0.5" fill="#89b341" color="white" />
                    <span className="text-[12px] text-gray-500 leading-[1.4]">
                      We recommend confirming all details in writing (email or message) where possible.
                    </span>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="border border-gray-100 rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                  <div className="w-10 h-10 rounded-[14px] bg-[#f4f7f2] flex items-center justify-center text-[#89b341] mb-4">
                    <IoIosWarning size={20} />
                  </div>
                  <h3 className="text-[17px] font-semibold text-gray-800 mb-2">How to avoid common issues</h3>
                  <p className="text-[14px] text-gray-600 mb-4">To reduce the risk of misunderstandings:</p>
                  <ul className="space-y-3">
                    {[
                      "Avoid paying large upfront amounts where possible",
                      "Do not rely on verbal agreements alone",
                      "Be cautious of unusually low quotes compared to others",
                      "Keep all communication records",
                      "Ensure both parties clearly agree on expectations before work starts"
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 size={16} className="text-[#89b341] flex-shrink-0 mt-0.5" fill="#89b341" color="white" />
                        <span className="text-gray-500 text-[14px]">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Our Role */}
              <div className="mt-6 border border-gray-100 rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] bg-[#f4f7f2]/40">
                <h3 className="text-[17px] font-semibold text-gray-800 mb-2">Our role</h3>
                <p className="text-[14px] text-gray-600 leading-relaxed">
                  TugaTrades is a connection platform. We do not carry out the work, manage payments, or guarantee outcomes.
                  While we aim to provide useful information about traders, we always recommend carrying out your own checks before hiring.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
