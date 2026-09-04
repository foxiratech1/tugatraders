"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/app/api/authApi";
import {
  Star,
  MessageSquare,
  Calendar,
  Briefcase,
  MapPin,
  Clock,
  Edit2,
  CheckCircle,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

interface Review {
  id: string;
  traderId?: string;
  jobId?: string;
  rating: number;
  title?: string;
  review?: string;
  traderReply?: string;
  reply?: string;
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

interface UnreviewedJob {
  id: string;
  title: string;
  description?: string;
  status: string;
  postcode?: string;
  budgetRange?: string;
  createdAt?: string;
  completedAt?: string;
  updatedAt?: string;
  category?: {
    id?: string;
    name?: string;
  };
  categories?: {
    id?: string;
    name?: string;
  }[];
  skillService?: {
    id?: string;
    name?: string;
  };
  skillServices?: {
    id?: string;
    name?: string;
  }[];
  subCategory?: {
    id?: string;
    name?: string;
  };
  subCategories?: {
    id?: string;
    name?: string;
  }[];
  selectedTrader?: {
    id?: string;
    fullName?: string;
    email?: string;
    profileImage?: string | null;
    avatar?: string | null;
    logo?: string | null;
    traderProfile?: {
      companyName?: string | null;
      logo?: string | null;
    } | null;
    traderMetrics?: {
      averageRating?: number;
      totalReviews?: number;
    } | null;
  } | null;
  trader?: {
    id?: string;
    fullName?: string;
    email?: string;
    profileImage?: string | null;
    avatar?: string | null;
    logo?: string | null;
    traderProfile?: {
      companyName?: string | null;
      logo?: string | null;
    } | null;
    traderMetrics?: {
      averageRating?: number;
      totalReviews?: number;
    } | null;
  } | null;
  selectedTraderId?: string;
  traderId?: string;
}

function TraderAvatar({ trader }: { trader: any }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    trader?.traderProfile?.logo || trader?.logo || trader?.avatar || trader?.profileImage || null
  );

  useEffect(() => {
    if (avatarUrl || !trader?.id) return;

    const fetchProfile = async () => {
      try {
        const res = await authApi.getTraderProfileById(trader.id);
        const profile = res?.data || res;
        const fetchedAvatar =
          profile?.traderProfile?.logo || profile?.logo || profile?.avatar || profile?.profileImage;
        if (fetchedAvatar) {
          setAvatarUrl(fetchedAvatar);
        }
      } catch (err) {
        console.error("Failed to fetch trader profile for avatar", err);
      }
    };

    fetchProfile();
  }, [trader?.id, avatarUrl]);

  const src = avatarUrl
    ? avatarUrl.startsWith("http")
      ? avatarUrl
      : `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")}${
          avatarUrl.startsWith("/") ? avatarUrl : `/${avatarUrl}`
        }`
    : "/avt.png";

  return (
    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#E9F3DC] flex items-center justify-center flex-shrink-0">
      <img
        src={src}
        alt={trader?.fullName || trader?.companyName || "Trader"}
        className="w-full h-full object-cover"
        crossOrigin="anonymous"
      />
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  const ratingLabels: Record<number, string> = {
    1: "Very Poor",
    2: "Poor",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={
              star <= rating ? "text-[#FACC15] fill-[#FACC15]" : "text-gray-300 fill-gray-100"
            }
            strokeWidth={1.5}
          />
        ))}
      </div>

      {rating >= 1 && rating <= 5 && (
        <span className="text-[11px] font-semibold text-[#1C2C1C]">
          {rating} — {ratingLabels[rating]}
        </span>
      )}
    </div>
  );
}

const REASON_MAP: Record<string, string> = {
  TRADER_DIDNT_RESPOND: "Trader didn't respond",
  TRADER_DECLINED_JOB: "Trader declined the job",
  TRADER_MISSED_APPOINTMENT: "Missed appointment",
  QUOTE_OVER_BUDGET: "Quote over budget",
  WANTED_QUOTE_ONLY: "Wanted a quote",
  JOB_NO_LONGER_NEEDED: "No longer needed/changed my mind",
  BETTER_PRICE_ELSEWHERE: "Hired elsewhere",
  OTHER: "Other reason",
};

export default function CustomerReviews() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"pending" | "submitted">(
    tabParam === "submitted" ? "submitted" : "pending"
  );

  const [reviews, setReviews] = useState<Review[]>([]);
  const [unreviewedJobs, setUnreviewedJobs] = useState<UnreviewedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isEditable = (createdAt: string) => {
    const diff = new Date().getTime() - new Date(createdAt).getTime();
    return diff <= 48 * 60 * 60 * 1000;
  };

  const handleEditClick = (r: Review) => {
    const params = new URLSearchParams();
    params.set("editReviewId", r.id);
    const traderIdVal =
      r.traderId ||
      (r as any).trader_id ||
      (r as any).traderProfileId ||
      r.trader?.id ||
      (r.trader as any)?._id;
    const jobIdVal = r.jobId || (r as any).job_id || r.job?.id || (r.job as any)?._id;
    if (traderIdVal) params.set("traderId", traderIdVal);
    if (jobIdVal) params.set("jobId", jobIdVal);
    if (r.rating) params.set("rating", r.rating.toString());
    if (r.title) params.set("title", r.title);
    if (r.review) params.set("review", r.review);
    if (r.wouldRecommendTrader !== undefined)
      params.set("recommend", r.wouldRecommendTrader.toString());
    if (r.interactionSource) params.set("interactionSource", r.interactionSource);
    if (r.workCompletedDate) params.set("completionDate", r.workCompletedDate.split("T")[0]);
    if (r.workCarriedOut !== undefined) params.set("workCarriedOut", r.workCarriedOut.toString());
    if (r.noWorkReason) params.set("noWorkReason", r.noWorkReason);
    if (r.reviewType) params.set("reviewType", r.reviewType);
    if (r.createdAt) params.set("createdAt", r.createdAt);

    router.push(`/customer-dashboard/leave-review?${params.toString()}`);
  };

  const handleGiveReview = (job: UnreviewedJob) => {
    const traderObj = job.selectedTrader || job.trader || {};
    const traderId =
      traderObj.id ||
      (traderObj as any).traderId ||
      (traderObj as any).userId ||
      job.selectedTraderId ||
      job.traderId ||
      "";
    const params = new URLSearchParams();
    if (job.id) params.set("jobId", job.id);
    if (traderId) params.set("traderId", traderId);
    params.set("reviewType", "JOB");
    params.set("workCarriedOut", "true");

    router.push(`/customer-dashboard/leave-review?${params.toString()}`);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  useEffect(() => {
    if (tabParam === "submitted") {
      setActiveTab("submitted");
    } else if (tabParam === "pending") {
      setActiveTab("pending");
    }
  }, [tabParam]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [reviewsRes, unreviewedRes] = await Promise.all([
          authApi.getMyReviews().catch((err) => {
            console.error("Failed to load submitted reviews:", err);
            return [];
          }),
          authApi.getUnreviewedCompletedJobs().catch((err) => {
            console.error("Failed to load unreviewed completed jobs:", err);
            return [];
          }),
        ]);

        const parsedReviews = Array.isArray(reviewsRes)
          ? reviewsRes
          : reviewsRes?.data || [];
        setReviews(parsedReviews);

        const parsedUnreviewed: UnreviewedJob[] = Array.isArray(unreviewedRes)
          ? unreviewedRes
          : Array.isArray(unreviewedRes?.data)
          ? unreviewedRes.data
          : Array.isArray(unreviewedRes?.jobs)
          ? unreviewedRes.jobs
          : Array.isArray(unreviewedRes?.data?.jobs)
          ? unreviewedRes.data.jobs
          : Array.isArray(unreviewedRes?.unreviewedJobs)
          ? unreviewedRes.unreviewedJobs
          : Array.isArray(unreviewedRes?.data?.unreviewedJobs)
          ? unreviewedRes.data.unreviewedJobs
          : [];
        setUnreviewedJobs(parsedUnreviewed);

        // If no explicit tab query param, smart default based on whether pending reviews exist
        if (!tabParam) {
          if (parsedUnreviewed.length > 0) {
            setActiveTab("pending");
          } else if (parsedReviews.length > 0) {
            setActiveTab("submitted");
          }
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [tabParam]);

  return (
    <div className="min-h-screen bg-[#F8F9F5]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-[#1C2C1C]">Job Reviews</h1>
          <p className="text-gray-500 text-[14px] mt-1">
            Manage your submitted reviews and complete pending reviews for your completed jobs.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 border-b border-gray-200 mb-8">
          <button
            onClick={() => {
              setActiveTab("pending");
              router.replace("/customer-dashboard/reviews?tab=pending");
            }}
            className={`pb-3.5 px-1 text-[15px] font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
              activeTab === "pending"
                ? "text-[#6E9625] border-b-2 border-[#6E9625]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Clock size={17} />
            Pending Reviews
            {unreviewedJobs.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#6E9625] text-white">
                {unreviewedJobs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("submitted");
              router.replace("/customer-dashboard/reviews?tab=submitted");
            }}
            className={`pb-3.5 px-1 text-[15px] font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
              activeTab === "submitted"
                ? "text-[#6E9625] border-b-2 border-[#6E9625]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <CheckCircle size={17} />
            Submitted Reviews
            {reviews.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-gray-200 text-gray-700">
                {reviews.length}
              </span>
            )}
          </button>
        </div>

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-2xl p-6 text-[14px] mb-6 flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse"
              >
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

        {/* ── TAB 1: PENDING REVIEWS ─────────────────────────────────── */}
        {!loading && activeTab === "pending" && (
          <div>
            {unreviewedJobs.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-[#F0F9F1] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={28} className="text-[#6E9625]" />
                </div>
                <h3 className="text-[18px] font-bold text-[#1C2C1C] mb-2">No Pending Reviews</h3>
                <p className="text-gray-500 text-[14px] max-w-md mx-auto mb-6">
                  You have no completed jobs awaiting review at this time. Once a job is completed, you
                  can share your rating and review here!
                </p>
                {reviews.length > 0 && (
                  <button
                    onClick={() => {
                      setActiveTab("submitted");
                      router.replace("/customer-dashboard/reviews?tab=submitted");
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-[13px] font-bold text-[#1C2C1C] hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                  >
                    View Submitted Reviews <ArrowRight size={14} />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {unreviewedJobs.map((job) => {
                  const trader = job.selectedTrader || job.trader;
                  const traderName =
                    trader?.fullName || trader?.traderProfile?.companyName || "Assigned Trader";
                  const companyName = trader?.traderProfile?.companyName;
                  const categoryName =
                    job.category?.name ||
                    job.categories?.[0]?.name ||
                    job.skillService?.name ||
                    job.skillServices?.[0]?.name;
                  const jobDate = job.completedAt || job.updatedAt || job.createdAt;
                  const rating = trader?.traderMetrics?.averageRating;
                  const totalReviews = trader?.traderMetrics?.totalReviews;

                  return (
                    <div
                      key={job.id}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <TraderAvatar trader={trader} />

                        <div className="min-w-0 flex-1">
                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="inline-block bg-[#EAF3DE] text-[#557A18] font-bold text-[10px] px-2.5 py-0.5 rounded-full tracking-wide">
                              JOB-{job.id?.substring(0, 8).toUpperCase()}
                            </span>
                            <span className="inline-block bg-green-50 text-green-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                              COMPLETED
                            </span>
                            {categoryName && (
                              <span className="text-[11px] font-semibold text-gray-500">
                                • {categoryName}
                              </span>
                            )}
                          </div>

                          {/* Job Title */}
                          <h3 className="text-[17px] font-extrabold text-[#1C2C1C] leading-snug mb-1">
                            {job.title}
                          </h3>

                          {/* Trader Info */}
                          <div className="flex flex-wrap items-center gap-2 text-[13px] text-gray-600 font-medium mb-2.5">
                            <span>
                              Trader: <span className="font-bold text-[#1C2C1C]">{traderName}</span>
                            </span>
                            {companyName && traderName !== companyName && (
                              <span className="text-gray-400 text-[12px]">({companyName})</span>
                            )}
                            {rating !== undefined && rating > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-[#6E9625] font-bold bg-[#F2F7EB] px-2 py-0.5 rounded-full ml-1">
                                <Star size={11} className="fill-current text-[#FACC15]" />
                                {rating.toFixed(1)}
                                {totalReviews ? ` (${totalReviews})` : ""}
                              </span>
                            )}
                          </div>

                          {/* Description snippet */}
                          {job.description && (
                            <p className="text-[13px] text-gray-500 line-clamp-2 mb-3">
                              {job.description}
                            </p>
                          )}

                          {/* Meta items */}
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-gray-400">
                            {jobDate && (
                              <span className="flex items-center gap-1">
                                <Calendar size={13} /> Completed {formatDate(jobDate)}
                              </span>
                            )}
                            {job.postcode && (
                              <span className="flex items-center gap-1">
                                <MapPin size={13} /> {job.postcode}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Action: Give a Review */}
                      <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                        <button
                          onClick={() => handleGiveReview(job)}
                          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#6E9625] text-white text-[13px] font-bold hover:bg-[#58791C] shadow-sm hover:shadow transition-all cursor-pointer"
                        >
                          <Star size={15} className="fill-current" />
                          Give a Review
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: SUBMITTED REVIEWS ──────────────────────────────── */}
        {!loading && activeTab === "submitted" && (
          <div>
            {reviews.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-[#F0F9F1] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={28} className="text-[#6E9625]" />
                </div>
                <h3 className="text-[18px] font-bold text-[#1C2C1C] mb-2">No Reviews Submitted Yet</h3>
                <p className="text-gray-500 text-[14px]">
                  You haven&apos;t submitted any reviews yet. Complete a job and share your experience!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        {/* Trader avatar */}
                        <TraderAvatar trader={r.trader} />

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
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                            r.reviewType === "JOB"
                              ? "bg-[#E9F3DC] text-[#4A7C10]"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {r.reviewType === "JOB" ? "Job Review" : "Directory Review"}
                        </span>
                        {r.rating > 0 && <StarRating rating={r.rating} />}
                      </div>
                    </div>

                    {/* Review title */}
                    {r.title && (
                      <p className="text-[14px] font-semibold text-[#1C2C1C] mb-1 break-words">
                        {r.title}
                      </p>
                    )}

                    {/* Review body */}
                    {r.review && (
                      <p className="text-[14px] text-gray-600 leading-relaxed mb-4 break-words">
                        &ldquo;{r.review}&rdquo;
                      </p>
                    )}

                    {/* Trader Reply */}
                    {(r.traderReply || r.reply) && (
                      <div className="mt-4 mb-4 bg-[#F2F7EB] border-l-4 border-[#6E9625] rounded-r-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare size={14} className="text-[#6E9625]" />
                          <span className="text-[12px] font-bold text-[#1C2C1C]">Trader Reply</span>
                        </div>

                        <p className="text-[13px] text-gray-600 leading-relaxed break-words">
                          &ldquo;{r.traderReply || r.reply}&rdquo;
                        </p>
                      </div>
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
                          <Calendar size={12} />{" "}
                          {new Date(r.workCompletedDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                      {r.wouldRecommendTrader !== undefined && (
                        <span
                          className={`text-[12px] font-medium flex items-center gap-1 ${
                            r.wouldRecommendTrader ? "text-[#6E9625]" : "text-red-500"
                          }`}
                        >
                          {r.wouldRecommendTrader ? "✓ Would recommend" : "✗ Would not recommend"}
                        </span>
                      )}
                      <span className="text-[12px] text-gray-400 flex items-center gap-1 ml-auto">
                        <Clock size={11} />{" "}
                        {new Date(r.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {isEditable(r.createdAt) && (
                        <button
                          onClick={() => handleEditClick(r)}
                          className="flex items-center gap-1 text-[12px] font-medium text-[#6E9625] hover:text-[#5a7a1e] ml-4 bg-[#F0F9F1] px-2 py-1 rounded transition-colors cursor-pointer"
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
        )}
      </div>
    </div>
  );
}
