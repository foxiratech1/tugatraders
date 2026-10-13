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
              <img src="/vetting.jfif" alt="Vetting" className="absolute inset-0 w-full h-full object-cover" />


              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center cursor-pointer bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors z-10"
              >
                <X size={16} strokeWidth={3} />
              </button>

              <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white z-10 w-full">
                <h2 className="text-[26px] md:text-[32px] font-bold mb-1.5 tracking-tight">Customer Vetting & Trust</h2>
                <p className="text-white/80 text-[14px] md:text-[15px] font-light">
                  Our Commitment to Trust and Quality
                </p>
              </div>
            </div>

            {/* Content Area */}
            <div ref={scrollRef} className="p-6 md:p-8 bg-white overflow-y-auto flex flex-col gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

              <section>
                <h3 className="text-[18px] font-bold text-gray-900 mb-1">Our Commitment to Trust and Quality</h3>

                <div className="space-y-3 text-[14px] text-gray-600 leading-relaxed mt-3">
                  <p>
                    TugaTrades takes steps to review information provided by tradespeople, which may include identity, business details, qualifications, insurance and customer feedback, where available.
                  </p>
                  <p>
                    These checks aim to promote professionalism and help customers make informed decisions. However, they do not guarantee the quality, safety or outcome of any work.
                  </p>
                  <p>
                    Customers are responsible for carrying out their own checks, confirming qualifications and insurance, and agreeing on terms directly with their chosen tradesperson before work begins.
                  </p>
                  <p>
                    TugaTrades acts as a connection platform and is not a party to agreements between customers and tradespeople.
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
                    Badges displayed on trader profiles, including &ldquo;Vetted&rdquo;, &ldquo;Insurance Documents&rdquo; or similar indicators, are intended to help customers understand the information reviewed or provided in relation to a trader.
                  </p>
                  <p>
                    These badges reflect information supplied by the trader and/or reviewed by TugaTrades at a particular point in time, as applicable. They should not be interpreted as an endorsement, certification or guarantee of:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>The quality or standard of work.</li>
                    <li>The trader&apos;s reliability, conduct or performance.</li>
                    <li>The current validity of insurance, qualifications or other credentials.</li>
                    <li>The safety, suitability or successful completion of any project.</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-[13px] text-gray-600 leading-relaxed">
                  <strong>Before proceeding with any work, customers should carry out their own checks and request current supporting documentation directly from the trader.</strong> The presence of a badge does not replace these checks or remove the need to make an informed decision.
                </div>
              </section>



            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
