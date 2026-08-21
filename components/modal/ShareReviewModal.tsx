"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, CheckCircle2, ArrowRight } from "lucide-react";

interface SelectedTrader {
  id?: string;
  fullName?: string;
  email?: string;
  profileImage?: string | null;
  traderProfile?: {
    companyName?: string | null;
  } | null;
  traderMetrics?: {
    averageRating?: number;
    totalReviews?: number;
  } | null;
}

interface ShareReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeaveReview: () => void;
  job: {
    id: string;
    title: string;
    category?: {
      name?: string;
    };
    selectedTrader?: SelectedTrader;
  } | null;
  trader?: SelectedTrader | null;
}

export default function ShareReviewModal({
  isOpen,
  onClose,
  onLeaveReview,
  job,
  trader: propTrader,
}: ShareReviewModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!job) return null;

  const trader = propTrader || job.selectedTrader;
  const traderName =
    trader?.traderProfile?.companyName ||
    trader?.fullName ||
    "your tradesperson";
  const traderInitial =
    (trader?.fullName?.[0] || trader?.traderProfile?.companyName?.[0] || "T").toUpperCase();

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={backdropRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-hidden"
          onClick={(e) => {
            if (e.target === backdropRef.current) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-[520px] bg-white rounded-[28px] overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
          >
            {/* Top decorative accent bar */}
            <div className="h-2 w-full bg-gradient-to-r from-[#6E9625] via-[#89B341] to-[#6E9625]" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors z-10"
              title="Maybe Later"
            >
              <X size={16} strokeWidth={2.5} />
            </button>

            <div className="p-6 sm:p-8">
              {/* Header Icon + Title */}
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F0F7E8] text-[#6E9625] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#E1EFD2]">
                  <Star size={24} className="fill-[#6E9625]" />
                </div>
                <div>
                  <h2 className="text-[22px] font-extrabold text-[#1C2C1C] leading-tight">
                    Share Your Review
                  </h2>
                  <div className="flex items-center gap-1 text-[12px] font-semibold text-[#2E7D32] mt-0.5">
                    <CheckCircle2 size={13} className="text-[#2E7D32]" />
                    Job marked as completed
                  </div>
                </div>
              </div>

              {/* Subtitle description */}
              <p className="text-[14px] text-gray-600 leading-relaxed mb-5">
                How did your job go? Sharing your honest experience helps maintain trust on TugaTrades and helps other homeowners choose the right professional.
              </p>

              {/* Job & Trader Summary Card */}
              <div className="bg-[#F8F9F5] border border-[#E8EDE0] rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#4CAF50] text-white flex items-center justify-center text-[15px] font-bold flex-shrink-0 shadow-sm">
                    {traderInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[#1C2C1C] truncate">
                      {traderName}
                    </p>
                    <p className="text-[12px] text-gray-500 truncate mt-0.5">
                      {job.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={onLeaveReview}
                  className="w-full sm:flex-1 py-3.5 px-6 bg-[#1C2C1C] hover:bg-[#2C3E2C] text-white rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  <Star size={16} className="fill-[#89B341] text-[#89B341]" />
                  <span>Leave a Review</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-xl text-[14px] font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer text-center"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
