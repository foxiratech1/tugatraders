"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import DisputeContent from "@/components/Terms/DisputeContent";

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DisputeModal({ isOpen, onClose }: DisputeModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

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
        <div
          ref={backdropRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-[860px] max-h-[90vh] flex flex-col bg-white rounded-[32px] overflow-hidden shadow-2xl m-auto"
          >
            {/* Header */}
            <div className="relative shrink-0 bg-[#243A24] px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-[22px] md:text-[26px] font-bold text-white tracking-tight">If Something Goes Wrong</h2>
                <p className="text-white/70 text-[13px] mt-0.5">Dispute resolution & support on TugaTrades</p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center cursor-pointer bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors flex-shrink-0"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            {/* Content */}
            <div
              ref={scrollRef}
              className="overflow-y-auto p-6 md:p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] text-sm"
            >
              <DisputeContent />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
