"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info } from "lucide-react";

interface VettingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VettingModal({ isOpen, onClose }: VettingModalProps) {
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
            className="relative w-full max-w-[800px] max-h-[95vh] flex flex-col bg-white rounded-[32px] overflow-hidden shadow-2xl m-auto"
          >
            {/* Header Image Area */}
            <div className="relative h-[200px] md:h-[240px] w-full shrink-0">
              <img src="/vettingimage.png" alt="Vetting" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1b2b1b]/95 via-[#1b2b1b]/85 to-[#1b2b1b]/70" />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors z-10"
              >
                <X size={16} strokeWidth={3} />
              </button>

              <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white z-10 w-full">
                <h2 className="text-[26px] md:text-[32px] font-bold mb-1.5 tracking-tight">Vetting & badges explained</h2>
                <p className="text-white/80 text-[14px] md:text-[15px] font-light">
                  Our commitment to trust and quality
                </p>
              </div>
            </div>

            {/* Content Area */}
            <div ref={scrollRef} className="p-6 md:p-8 bg-white overflow-y-auto flex flex-col gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

              <section>
                <h3 className="text-[18px] font-bold text-gray-900 mb-1">Customer Vetting & Trust Statement</h3>
                <p className="text-[14px] text-gray-500 mb-4">Our commitment to trust and quality</p>

                <div className="space-y-3 text-[14px] text-gray-600 leading-relaxed">
                  <p>
                    We take steps to verify the tradespeople on our platform, which may include checks on identity, business
                    information, relevant qualifications, insurance, and customer feedback where available.
                  </p>
                  <p>
                    These checks are designed to promote a higher standard of professionalism and help you make informed
                    decisions when choosing a tradesperson.
                  </p>
                  <p>
                    However, while we aim to provide a trusted community of professionals, we do not guarantee or warrant the
                    quality, safety, or outcome of any work carried out.
                  </p>
                  <p>
                    All work is carried out directly between you and the tradesperson you choose. It is your responsibility to carry
                    out your own due diligence, including confirming suitability, qualifications, and agreeing terms before work
                    begins.
                  </p>
                  <p>
                    We are not a party to any agreement between customers and tradespeople and accept no liability for the
                    services provided.
                  </p>
                </div>
              </section>

              <section className="bg-[#f8f9fa] border border-gray-100 rounded-[20px] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded-full bg-[#89b341] flex items-center justify-center text-white">
                    <span className="font-serif italic font-bold text-[14px]">i</span>
                  </div>
                  <h4 className="text-[18px] font-bold text-gray-900">Badge Disclaimer</h4>
                </div>

                <div className="space-y-3 text-[14px] text-gray-600 leading-relaxed mb-5">
                  <p>
                    Badges displayed on Trader profiles (including "Insured", "Vetted", or similar indicators) are based on
                    information provided by the Trader and reviewed at a specific point in time.
                  </p>
                  <p>
                    These badges are for informational purposes only and do not constitute endorsement, certification,
                    or a guarantee of:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Quality of work</li>
                    <li>Reliability or performance</li>
                    <li>Ongoing validity of insurance or credentials</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-[13px] text-gray-600">
                  <span className="text-red-500 font-medium">Important:</span> Customers should carry out their own checks and request up-to-date documentation directly
                  from the Trader before proceeding with any work.
                </div>
              </section>



            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
