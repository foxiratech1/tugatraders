"use client";

import React from "react";
import {
  X,
  Briefcase,
  DollarSign,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  FileText,
  User,
  ShieldCheck,
  Star,
} from "lucide-react";

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any | null;
  partner: any | null;
  isTraderView: boolean;
  isActualTrader: boolean;
  onConfirmCompletion?: () => void;
  isConfirming?: boolean;
}

export default function JobDetailsModal({
  isOpen,
  onClose,
  job,
  partner,
  isTraderView,
  isActualTrader,
  onConfirmCompletion,
  isConfirming = false,
}: JobDetailsModalProps) {
  if (!isOpen || !job) return null;

  const title = job.title || job.jobTitle || "Direct Job";
  const description = job.description || job.notes || job.scope || null;
  const status = (job.status || "IN_PROGRESS").toUpperCase();

  const price = job.agreedPrice ?? job.price ?? job.budget ?? null;
  const location = job.location || job.postcode || null;
  const startedAt = job.startedAt || job.createdAt || null;
  const completedAt = job.confirmedAt || job.completedAt || null;

  const traderInfo = job.trader || (!isActualTrader ? partner : null);
  const traderName =
    traderInfo?.traderProfile?.displayName ||
    traderInfo?.traderProfile?.companyName ||
    traderInfo?.fullName ||
    "Tradesperson";

  const getStatusBadge = () => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-[#EAF7EC] text-[#16A34A] border border-[#C6ECCB]">
            <CheckCircle size={13} />
            Completed
          </span>
        );
      case "AWAITING_CONFIRMATION":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            <Clock size={13} />
            Awaiting Confirmation
          </span>
        );
      case "IN_PROGRESS":
      case "STARTED":
      case "ASSIGNED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
            <Clock size={13} />
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateStr: any) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return String(dateStr);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-[#FAFAF9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6E9625]/10 text-[#6E9625] flex items-center justify-center shrink-0">
              <Briefcase size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] sm:text-[18px] font-bold text-[#1C2C1C]">
                  Job Details
                </h3>
                {getStatusBadge()}
              </div>
              <p className="text-[12px] text-gray-500 font-medium">
                Direct job agreed on TugaTrades
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-left">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Job Title
            </label>
            <h4 className="text-[18px] sm:text-[20px] font-extrabold text-[#1C2C1C] leading-snug">
              {title}
            </h4>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {price !== null && (
              <div className="bg-[#F8F9FA] border border-gray-150/70 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <DollarSign size={16} />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Agreed Price</p>
                  <p className="text-[15px] font-bold text-[#1C2C1C]">
                    €{Number(price).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {startedAt && (
              <div className="bg-[#F8F9FA] border border-gray-150/70 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Started Date</p>
                  <p className="text-[14px] font-bold text-[#1C2C1C]">
                    {formatDate(startedAt)}
                  </p>
                </div>
              </div>
            )}

            {location && (
              <div className="bg-[#F8F9FA] border border-gray-150/70 rounded-2xl p-3.5 flex items-start gap-3 col-span-2 sm:col-span-1">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#6E9625] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Location</p>
                  <p className="text-[13px] font-bold text-[#1C2C1C] truncate">
                    {location}
                  </p>
                </div>
              </div>
            )}

            {completedAt && (
              <div className="bg-[#F8F9FA] border border-gray-150/70 rounded-2xl p-3.5 flex items-start gap-3 col-span-2 sm:col-span-1">
                <div className="w-8 h-8 rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Completed Date</p>
                  <p className="text-[14px] font-bold text-[#1C2C1C]">
                    {formatDate(completedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description / Scope / Notes */}
          {description && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5">
                <FileText size={13} className="text-[#6E9625]" />
                Notes / Scope of Work
              </label>
              <div className="bg-[#F9FAFB] border border-gray-150 rounded-2xl p-3.5 text-[13px] sm:text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                {description}
              </div>
            </div>
          )}

          {/* Tradesperson Card */}
          <div className="border border-gray-150 rounded-2xl p-3.5 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#6E9625] font-bold overflow-hidden shrink-0">
                <User size={18} />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium">Tradesperson</p>
                <p className="text-[14px] font-bold text-[#1C2C1C]">{traderName}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#6E9625] bg-[#6E9625]/10 px-2.5 py-1 rounded-full">
              <ShieldCheck size={13} />
              <span>Verified Pro</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-[#FAFAF9] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-[13px] font-bold hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Close
          </button>

          {!isActualTrader && status === "AWAITING_CONFIRMATION" && onConfirmCompletion && (
            <button
              type="button"
              disabled={isConfirming}
              onClick={onConfirmCompletion}
              className="px-5 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[13px] font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle size={15} />
              {isConfirming ? "Confirming..." : "Confirm Completion"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
