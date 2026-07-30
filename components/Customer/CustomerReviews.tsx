"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/app/api/authApi";
import { Star, MessageSquare, Calendar, Briefcase, MapPin, Clock, Edit2 } from "lucide-react";

interface Review {
  id: string;
  traderId?: string;
  jobId?: string;
  rating: number;
  title?: string;
  review?: string;
  reviewType: "JOB" | "DIRECTORY";
  workCarriedOut: boolean;
  workCompletedDate?: string;
  interactionSource?: string;
  wouldRecommendTrader?: boolean;
  noWorkReason?: string;
  createdAt: string;
  trader?: {
    id?: string;
    fullName?: string;
    profileImage?: string;
    tradeCategories?: string[];
  };
  job?: {
    id?: string;
    title?: string;
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={star <= rating ? "text-[#FACC15] fill-[#FACC15]" : "text-gray-300 fill-gray-100"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

const REASON_MAP: Record<string, string> = {
  'TRADER_DIDNT_RESPOND': "Trader didn't respond",
  'TRADER_DECLINED_JOB': "Trader declined the job",
  'TRADER_MISSED_APPOINTMENT': "Missed appointment",
  'QUOTE_OVER_BUDGET': "Quote over budget",
  'WANTED_QUOTE_ONLY': "Wanted a quote",
  'JOB_NO_LONGER_NEEDED': "No longer needed/changed my mind",
  'BETTER_PRICE_ELSEWHERE': "Hired elsewhere",
  'OTHER': "Other reason"
};

export default function CustomerReviews() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isEditable = (createdAt: string) => {
    const diff = new Date().getTime() - new Date(createdAt).getTime();
    return diff <= 48 * 60 * 60 * 1000;
  };

  const handleEditClick = (r: Review) => {
    const params = new URLSearchParams();
    params.set('editReviewId', r.id);
    const traderIdVal = r.traderId || (r as any).trader_id || (r as any).traderProfileId || r.trader?.id || (r.trader as any)?._id;
    const jobIdVal = r.jobId || (r as any).job_id || r.job?.id || (r.job as any)?._id;
    if (traderIdVal) params.set('traderId', traderIdVal);
    if (jobIdVal) params.set('jobId', jobIdVal);
    if (r.rating) params.set('rating', r.rating.toString());
    if (r.title) params.set('title', r.title);
    if (r.review) params.set('review', r.review);
    if (r.wouldRecommendTrader !== undefined) params.set('recommend', r.wouldRecommendTrader.toString());
    if (r.interactionSource) params.set('interactionSource', r.interactionSource);
    if (r.workCompletedDate) params.set('completionDate', r.workCompletedDate.split('T')[0]);
    if (r.workCarriedOut !== undefined) params.set('workCarriedOut', r.workCarriedOut.toString());
    if (r.noWorkReason) params.set('noWorkReason', r.noWorkReason);
    if (r.reviewType) params.set('reviewType', r.reviewType);
    if (r.createdAt) params.set('createdAt', r.createdAt);

    router.push(`/customer-dashboard/leave-review?${params.toString()}`);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await authApi.getMyReviews();
        setReviews(Array.isArray(res) ? res : res?.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9F5] p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-[#1C2C1C]">My Reviews</h1>
          <p className="text-gray-500 text-[14px] mt-1">Reviews you have submitted for traders and jobs.</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-2xl p-6 text-[14px]">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && reviews.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-[#F0F9F1] rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={28} className="text-[#6E9625]" />
            </div>
            <h3 className="text-[18px] font-bold text-[#1C2C1C] mb-2">No Reviews Yet</h3>
            <p className="text-gray-500 text-[14px]">You haven&apos;t submitted any reviews yet. Complete a job and share your experience!</p>
          </div>
        )}

        {/* Reviews list */}
        {!loading && !error && reviews.length > 0 && (
          <div className="flex flex-col gap-5">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                {/* Top row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    {/* Trader avatar */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#E9F3DC] flex items-center justify-center flex-shrink-0">
                      {r.trader?.profileImage ? (
                        <img
                          src={r.trader.profileImage.startsWith("http") ? r.trader.profileImage : `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")}${r.trader.profileImage.startsWith("/") ? r.trader.profileImage : `/${r.trader.profileImage}`}`}
                          alt={r.trader.fullName || "Trader"}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <img
                          src="/avt.png"
                          alt={r.trader?.fullName || "Trader"}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[15px] font-bold text-[#1C2C1C] break-words">
                        {r.trader?.fullName || "Trader"}
                      </p>
                      {r.job?.title && (
                        <p className="text-[12px] text-gray-500 flex items-center gap-1 mt-0.5 break-words">
                          <Briefcase size={11} /> {r.job.title}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Badge + Rating */}
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${r.reviewType === "JOB"
                        ? "bg-[#E9F3DC] text-[#4A7C10]"
                        : "bg-blue-50 text-blue-600"
                      }`}>
                      {r.reviewType === "JOB" ? "Job Review" : "Directory Review"}
                    </span>
                    {r.rating > 0 && <StarRating rating={r.rating} />}
                  </div>
                </div>

                {/* Review title */}
                {r.title && (
                  <p className="text-[14px] font-semibold text-[#1C2C1C] mb-1 break-words">{r.title}</p>
                )}

                {/* Review body */}
                {r.review && (
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-4 break-words">
                    &ldquo;{r.review}&rdquo;
                  </p>
                )}

                {/* Reason (if no work carried out) */}
                {!r.workCarriedOut && r.noWorkReason && (
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-4 break-words">
                    <span className="font-semibold text-[#1C2C1C]">Reason: </span>
                    {REASON_MAP[r.noWorkReason] || r.noWorkReason}
                  </p>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pt-3 border-t border-gray-100">
                  {r.workCompletedDate && (
                    <span className="text-[12px] text-gray-500 flex items-center gap-1">
                      <Calendar size={12} /> {new Date(r.workCompletedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  )}
                  {r.wouldRecommendTrader !== undefined && (
                    <span className={`text-[12px] font-medium flex items-center gap-1 ${r.wouldRecommendTrader ? "text-[#6E9625]" : "text-red-500"}`}>
                      {r.wouldRecommendTrader ? "✓ Would recommend" : "✗ Would not recommend"}
                    </span>
                  )}
                  <span className="text-[12px] text-gray-400 flex items-center gap-1 ml-auto">
                    <Clock size={11} /> {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {isEditable(r.createdAt) && (
                    <button
                      onClick={() => handleEditClick(r)}
                      className="flex items-center gap-1 text-[12px] font-medium text-[#6E9625] hover:text-[#5a7a1e] ml-4 bg-[#F0F9F1] px-2 py-1 rounded transition-colors"
                    >
                      <Edit2 size={11} /> Edit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
