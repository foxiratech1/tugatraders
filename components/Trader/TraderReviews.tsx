"use client";

import React, { useEffect, useState } from "react";
import { authApi } from "@/app/api/authApi";
import { Star, MessageSquare, Award, CornerUpLeft } from "lucide-react";
import Image from "next/image";

interface Review {
  id: string;
  rating: number;
  title?: string;
  review?: string;
  reviewType: "JOB" | "DIRECTORY";
  workCarriedOut: boolean;
  workCompletedDate?: string;
  interactionSource?: string;
  wouldRecommendTrader?: boolean;
  createdAt: string;
  customer?: {
    fullName?: string;
    profileImage?: string;
  };
  user?: {
    fullName?: string;
    profileImage?: string;
  };
  job?: {
    title?: string;
  };
  traderReply?: any; // in case we need to display it later
  reply?: any;
}

interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  recommendationRate?: number;
  breakdown?: {
    [key: number]: number;
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? "text-[#FACC15] fill-[#FACC15]" : "text-gray-300 fill-gray-100"}
          strokeWidth={1}
        />
      ))}
    </div>
  );
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} days ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} months ago`;
  return `${Math.floor(diffInMonths / 12)} years ago`;
}

function getImageUrl(path: string | undefined) {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${base}/${cleanPath}`;
}

export default function TraderReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) return;
    try {
      setSubmittingReply(true);
      await authApi.replyToReview(reviewId, replyText.trim());
      setReplyText("");
      setReplyingTo(null);
      setRefreshTrigger((prev) => prev + 1); // refresh reviews
    } catch (err: any) {
      console.error("Failed to reply", err);
      alert(err?.response?.data?.message || "Failed to submit reply.");
    } finally {
      setSubmittingReply(false);
    }
  };

  useEffect(() => {
    const fetchReviewsAndSummary = async () => {
      try {
        setLoading(true);
        const profileRes = await authApi.getMyProfile();
        // The API may wrap the actual profile inside a "data" field
        const rawProfile = profileRes?.data?.data || profileRes?.data || profileRes;

        // Determine traderId from profile response with prioritized fields
        const traderIdCandidates = [
          rawProfile?.traderProfile?.traderId,
          rawProfile?.traderProfile?.id,
          rawProfile?.trader?.id,
          rawProfile?.traderId,
          rawProfile?.id,
        ];
        const traderId = traderIdCandidates.find((id) => typeof id === 'string' && id.length > 0);

        if (!traderId) {
          throw new Error('Could not identify trader account from profile response.');
        }

        const [reviewsRes, summaryRes] = await Promise.all([
          authApi.getOwnReviews(page, 10).catch((e: any) => {
            console.error('[TraderReviews] getOwnReviews error:', e?.response?.data || e.message);
            return { data: [] };
          }),
          authApi.getTraderReviewSummary(traderId).catch((e: any) => {
            console.error('[TraderReviews] getTraderReviewSummary error:', e?.response?.data || e.message);
            return null;
          })
        ]);

        // Handle different response shapes
        const reviewsData = reviewsRes?.data || reviewsRes;
        const reviewsList = Array.isArray(reviewsData)
          ? reviewsData
          : reviewsData?.reviews || reviewsData?.data || [];
        setReviews(reviewsList);

        if (reviewsData?.pagination?.totalPages) {
          setTotalPages(reviewsData.pagination.totalPages);
        } else if (reviewsData?.totalPages) {
          setTotalPages(reviewsData.totalPages);
        }

        const sumData = summaryRes?.data || summaryRes;
        if (sumData) {
          setSummary(sumData);
        }

      } catch (err: any) {
        console.error("[TraderReviews] Fatal error:", err);
        setError(err?.response?.data?.message || err.message || "Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };
    fetchReviewsAndSummary();
  }, [page, refreshTrigger]);

  return (
    <div className="min-h-screen bg-[#F8F9F5] p-6 md:p-10 font-sans mt-[60px]">
      <div className="max-w-[1100px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[#1C2C1C]">Reviews Dashboard</h1>
            <p className="text-gray-500 text-[14px] mt-1">Track your reputation and respond to customer feedback.</p>
          </div>
          <div className="flex items-center gap-1.5 bg-[#E9F3DC] text-[#6E9625] px-4 py-2 rounded-lg font-semibold text-[13px]">
            Top Rated Seller <Award size={16} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* LEFT COLUMN: Summary Cards */}
          <div className="w-full md:w-[320px] flex flex-col gap-6 flex-shrink-0">
            {/* Average Rating Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <h2 className="text-[14px] font-medium text-gray-400 mb-2">Average Rating</h2>
              <div className="text-[64px] font-extrabold text-[#1C2C1C] leading-none mb-4 tracking-tight">
                {summary?.averageRating ? Number(summary.averageRating).toFixed(1) : "0.0"}
              </div>
              <StarRating rating={summary?.averageRating ? Math.round(summary.averageRating) : 0} />
              <p className="text-[12px] text-gray-400 mt-4 font-medium">
                Based on {summary?.totalReviews || reviews.length} total reviews
              </p>
            </div>

            {/* Rating Breakdown Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-[12px] font-medium text-gray-500 text-center mb-6">Rating Breakdown</h2>
              <div className="flex flex-col gap-4">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = summary?.breakdown?.[star] || 0;
                  const total = summary?.totalReviews || reviews.length || 1;
                  const percentage = Math.round((count / total) * 100) || 0;
                  
                  // Visual fallback for 0 total reviews
                  const width = summary?.totalReviews === 0 && reviews.length === 0 
                    ? '0%' 
                    : (count > 0 ? `${percentage}%` : `${[80, 60, 40, 20, 10][5 - star]}%`); // mock pattern if no data

                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-[12px] font-bold text-gray-500 flex items-center w-6 justify-between">
                        {star} <Star size={10} className="fill-gray-500 text-gray-500" />
                      </span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#6E9625] rounded-full transition-all duration-500" style={{ width }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Reviews List */}
          <div className="flex-1 flex flex-col gap-5 w-full">
            {/* Loading */}
            {loading && (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-pulse h-40" />
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
              <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-[#F0F9F1] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={28} className="text-[#6E9625]" />
                </div>
                <h3 className="text-[18px] font-bold text-[#1C2C1C] mb-2">No Reviews Yet</h3>
                <p className="text-gray-500 text-[14px]">You haven&apos;t received any reviews yet. Great work brings great feedback!</p>
              </div>
            )}

            {/* Reviews */}
            {!loading && !error && reviews.length > 0 && reviews.map((r) => {
              const customerName = r.customer?.fullName || r.user?.fullName || "Anonymous Customer";
              const customerAvatar = r.customer?.profileImage || r.user?.profileImage;
              const title = r.job?.title ? ` • ${r.job.title}` : "";

              return (
                <div key={r.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 transition-shadow hover:shadow-md">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {/* Customer avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {customerAvatar ? (
                          <img src={getImageUrl(customerAvatar)} alt={customerName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-400 font-bold text-[14px]">
                            {customerName.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-[14px] font-bold text-[#1C2C1C]">{customerName}</p>
                        <p className="text-[12px] text-gray-400 mt-0.5">
                          {timeAgo(r.createdAt)}{title}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={r.rating} />
                  </div>

                  <p className="text-[14px] text-gray-500 leading-relaxed">
                    &ldquo;{r.review || r.title}&rdquo;
                  </p>

                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={() => {
                        setReplyingTo(replyingTo === r.id ? null : r.id);
                        setReplyText("");
                      }}
                      className="flex items-center gap-1.5 bg-[#F4F6F0] text-[#1C2C1C] px-4 py-2 rounded-lg text-[12px] font-bold hover:bg-[#E9EBE4] transition-colors"
                    >
                      <CornerUpLeft size={14} /> Reply
                    </button>
                    <button className="text-[12px] text-gray-400 font-medium hover:text-gray-600 transition-colors">
                      Report
                    </button>
                  </div>

                  {/* Reply Input Area */}
                  {replyingTo === r.id && (
                    <div className="mt-2 bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col gap-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply here..."
                        className="w-full bg-white border border-gray-200 rounded-lg p-3 text-[13px] outline-none focus:border-[#6E9625] transition-colors resize-none"
                        rows={3}
                        disabled={submittingReply}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="px-4 py-2 text-[12px] font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          disabled={submittingReply}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReplySubmit(r.id)}
                          disabled={!replyText.trim() || submittingReply}
                          className="px-4 py-2 text-[12px] font-bold bg-[#6E9625] text-white rounded-lg hover:bg-[#5a7a1e] transition-colors disabled:opacity-50"
                        >
                          {submittingReply ? "Submitting..." : "Submit Reply"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Display existing reply if any */}
                  {r.traderReply && (
                    <div className="mt-2 bg-[#F4F6F0] rounded-xl p-4 border border-[#E9EBE4]">
                      <div className="flex items-center gap-2 mb-2">
                        <CornerUpLeft size={14} className="text-[#6E9625]" />
                        <span className="text-[13px] font-bold text-[#1C2C1C]">Your Reply</span>
                      </div>
                      <p className="text-[13px] text-gray-600 leading-relaxed">
                        {typeof r.traderReply === 'string' ? r.traderReply : r.traderReply.reply || r.traderReply.message || r.traderReply.text}
                      </p>
                    </div>
                  )}
                  {r.reply && !r.traderReply && (
                    <div className="mt-2 bg-[#F4F6F0] rounded-xl p-4 border border-[#E9EBE4]">
                      <div className="flex items-center gap-2 mb-2">
                        <CornerUpLeft size={14} className="text-[#6E9625]" />
                        <span className="text-[13px] font-bold text-[#1C2C1C]">Your Reply</span>
                      </div>
                      <p className="text-[13px] text-gray-600 leading-relaxed">
                        {typeof r.reply === 'string' ? r.reply : r.reply.message || r.reply.text}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination Controls */}
            {!loading && !error && totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 text-[13px] font-medium bg-white hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="text-[13px] text-gray-600 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 text-[13px] font-medium bg-white hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
