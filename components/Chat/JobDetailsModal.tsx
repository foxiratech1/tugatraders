"use client";

import React from "react";
import {
  X,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  User,
  Check,
} from "lucide-react";

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any | null;
  partner: any | null;
  trader?: any | null;
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
  trader,
  isTraderView,
  isActualTrader,
  onConfirmCompletion,
  isConfirming = false,
}: JobDetailsModalProps) {
  if (!isOpen || !job) return null;

  const title = job.title || job.jobTitle || "Bathroom sink replacement";
  const description =
    job.description ||
    job.notes ||
    job.scope ||
    "Staring job today for one week.\nMaterials and labor included in price.";
  const status = (job.status || "AWAITING_CONFIRMATION").toUpperCase();

  const price = job.agreedPrice ?? job.price ?? job.budget ?? 350;
  const startedAt = job.startedAt || job.createdAt || null;
  const completedAt = job.confirmedAt || job.completedAt || null;

  // Derive tradesperson info
  const traderInfo =
    trader ||
    job.trader ||
    (isTraderView ? partner : null) ||
    partner;

  const traderName =
    traderInfo?.fullName ||
    traderInfo?.traderProfile?.displayName ||
    traderInfo?.traderProfile?.companyName ||
    "Jay Santos";

  const traderImage =
    traderInfo?.profileImage ||
    traderInfo?.traderProfile?.profileImage ||
    partner?.profileImage;

  const getImageUrl = (path?: string | null): string => {
    if (!path) return "/avt.png";
    if (path.startsWith("http")) return path;
    const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(/\/+$/, "");
    const cleanPath = path.replace(/^\/+/, "");
    return `${base}/${cleanPath}`;
  };

  const getStatusBadge = () => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[12px] font-bold bg-[#EAF7EC] text-[#16A34A] border border-[#C6ECCB]">
            <CheckCircle size={13} />
            Completed
          </span>
        );
      case "AWAITING_CONFIRMATION":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[12px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            <Clock size={13} className="text-[#3B82F6]" />
            Awaiting Confirmation
          </span>
        );
      case "IN_PROGRESS":
      case "STARTED":
      case "ASSIGNED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[12px] font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
            <Clock size={13} />
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[12px] font-bold bg-[#EFDB4B]/20 text-[#8A5C05] border border-[#E0CC3B]/40">
            {status === "OPEN" || status === "POSTED" ? "Job Posted" : status}
          </span>
        );
    }
  };

  const formatDate = (dateStr: any) => {
    if (!dateStr) return "15 Oct 2026";
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
        className="bg-white rounded-3xl w-full max-w-[550px] shadow-2xl p-6 sm:p-7 border border-gray-150 flex flex-col gap-5 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF5EA] text-[#588022] flex items-center justify-center shrink-0">
              <Briefcase size={22} className="text-[#588022]" />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-[21px] font-bold text-[#111827]">Job Details</h3>
              {getStatusBadge()}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Job Title */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            JOB TITLE
          </p>
          <h4 className="text-[19px] sm:text-[20px] font-bold text-[#1C2C1C] leading-snug">
            {title}
          </h4>
        </div>

        {/* 3-Col Quick Metrics */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Tradesperson Card */}
          <div className="bg-[#F9FAFB] rounded-xl p-3 flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 border border-gray-200 shrink-0 flex items-center justify-center">
              {traderImage ? (
                <img
                  src={getImageUrl(traderImage)}
                  alt={traderName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <User size={16} className="text-gray-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">
                Tradesperson
              </p>
              <p className="text-[13px] font-bold text-[#1C2C1C] leading-tight whitespace-nowrap">
                {traderName}
              </p>
            </div>
          </div>

          {/* Agreed Price Card */}
          <div className="bg-[#F9FAFB] rounded-xl p-3 flex flex-col justify-center min-w-0">
            <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">
              Agreed Price
            </p>
            <p className="text-[15px] font-bold text-[#1C2C1C] leading-tight whitespace-nowrap">
              €{price !== null && price !== undefined ? Number(price).toLocaleString() : "350"}
            </p>
          </div>

          {/* Started Date Card */}
          <div className="bg-[#F9FAFB] rounded-xl p-3 flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center shrink-0">
              <Calendar size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-400 font-medium leading-none mb-1">
                Started Date
              </p>
              <p className="text-[13px] font-bold text-[#1C2C1C] leading-tight whitespace-nowrap">
                {startedAt ? formatDate(startedAt) : (completedAt ? formatDate(completedAt) : "15 Oct 2026")}
              </p>
            </div>
          </div>
        </div>

        {/* Notes / Scope of Work */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5">
            <FileText size={13} className="text-[#6E9625]" />
            NOTES / SCOPE OF WORK
          </label>
          <div className="border border-gray-200 rounded-2xl p-3.5 bg-white">
            <div className="bg-[#F9FAFB] rounded-xl p-3 text-[13px] text-gray-600 leading-relaxed font-normal whitespace-pre-wrap">
              {description}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-[13px] hover:bg-gray-50 shadow-2xs transition-colors cursor-pointer"
          >
            Close
          </button>

          {(status === "AWAITING_CONFIRMATION" || Boolean(onConfirmCompletion)) && (
            <button
              type="button"
              disabled={isConfirming}
              onClick={onConfirmCompletion || onClose}
              className="px-6 py-2.5 rounded-xl bg-[#1B431D] hover:bg-[#153617] text-white font-bold text-[13px] flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <Check size={16} strokeWidth={3} className="text-white" />
              <span>{isConfirming ? "Confirming..." : "Confirm Completion"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
