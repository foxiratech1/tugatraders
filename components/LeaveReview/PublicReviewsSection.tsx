"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FiStar } from "react-icons/fi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/utils/api";

interface ReviewItem {
  id: string;
  name: string;
  categoryName: string;
  companyName: string;
  stars: number;
  avatar: string;
  text: string;
}

const principles = [
  {
    title: "Customers",
    description: "Reviews should be connected to genuine customer experiences.",
  },
  {
    title: "Honest feedback",
    description: "Reviews should reflect the customer's actual experience.",
  },
  {
    title: "Fairness",
    description:
      "Reviews must not contain abusive, discriminatory, threatening or illegal content.",
  },
  {
    title: "Transparency",
    description: "Tradespeople can respond to reviews where appropriate.",
  },
  {
    title: "Moderation",
    description:
      "We may investigate and remove reviews that breach our review policy.",
  },
];

function getImageUrl(path: string | null | undefined): string | null {
  if (!path || path === "null" || path === "undefined") return null;
  if (path.startsWith("http")) return path;
  const baseUrl = (
    process.env.NEXT_PUBLIC_API_URL || "https://api.tugatraders.server24.in"
  ).replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${baseUrl}/${cleanPath}`;
}

const ReviewCard = ({ rev }: { rev: ReviewItem }) => {
  const [imgSrc, setImgSrc] = useState(rev.avatar);

  // Subtitle combining Category Name and Company Name (e.g. "ELECTRICIAN - JAY SANTOS LTD")
  const categoryAndCompany = [rev.categoryName, rev.companyName]
    .filter(Boolean)
    .join(" - ")
    .toUpperCase();

  return (
    <div className="bg-white rounded-[28px] sm:rounded-[32px] border border-[#243A241F] shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 sm:p-7 flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg w-full">
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Avatar */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
              <Image
                src={imgSrc}
                alt={rev.name}
                fill
                className="object-cover"
                unoptimized
                onError={() => setImgSrc("/avt.png")}
              />
            </div>

            {/* Middle Details */}
            <div className="min-w-0 pt-0.5">
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-1.5">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    size={14}
                    className={
                      i < rev.stars
                        ? "fill-[#6E9625] text-[#6E9625]"
                        : "fill-gray-200 text-gray-200"
                    }
                  />
                ))}
              </div>

              {/* Category Name & Company Name line (e.g. ELECTRICIAN - JAY SANTOS LTD) */}
              {categoryAndCompany ? (
                <p className="text-[10px] sm:text-[11px] font-bold text-[#6E9625] uppercase tracking-wider leading-tight mb-1">
                  {categoryAndCompany}
                </p>
              ) : null}

              {/* Trader Name */}
              <h4 className="text-[15px] sm:text-[17px] font-bold text-[#1E3A2B] leading-tight">
                {rev.name}
              </h4>

              {/* Company Name */}
              {rev.companyName && (
                <p className="text-[12px] sm:text-[12.5px] text-[#555E52] font-medium leading-tight mt-0.5">
                  {rev.companyName}
                </p>
              )}
            </div>
          </div>

          {/* Quote Icon */}
          <svg
            width="22"
            height="18"
            viewBox="0 0 24 20"
            fill="none"
            className="text-[#D3DED0] shrink-0 mt-0.5"
          >
            <path
              d="M9.6 0H4.8L0 9.6V20H9.6V9.6H4.8L9.6 0ZM24 0H19.2L14.4 9.6V20H24V9.6H19.2L24 0Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Review Text */}
        <p className="text-[#4A5548] text-[13px] sm:text-[13.5px] leading-relaxed italic font-normal mt-5 line-clamp-4">
          &ldquo;{rev.text}&rdquo;
        </p>
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 4;

const PublicReviewsSection = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `/api/reviews/all/public?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
        );
        const rawList =
          res?.data?.data ||
          res?.data?.reviews ||
          (Array.isArray(res?.data) ? res.data : []);

        const pagination = res?.data?.pagination;
        if (pagination && typeof pagination.totalPages === "number") {
          setTotalPages(Math.max(pagination.totalPages, 1));
        } else if (Array.isArray(rawList)) {
          setTotalPages(Math.max(Math.ceil(rawList.length / ITEMS_PER_PAGE), 1));
        }

        if (Array.isArray(rawList) && rawList.length > 0) {
          const formatted: ReviewItem[] = rawList.map(
            (item: any, idx: number) => {
              const rating = Number(
                item.rating || item.stars || item.score || 5
              );

              // Category Name extraction
              const categoryName =
                item.trader?.traderProfile?.tradeCategories?.[0]?.name ||
                item.trader?.tradeCategories?.[0]?.name ||
                (typeof item.trader?.tradeCategories?.[0] === "string"
                  ? item.trader?.tradeCategories?.[0]
                  : "") ||
                item.job?.category?.name ||
                item.category?.name ||
                "";

              // Company Name extraction
              const companyName =
                item.trader?.traderProfile?.companyName ||
                item.trader?.companyName ||
                item.trader?.traderProfile?.displayName ||
                item.trader?.displayName ||
                "";

              // Trader / Reviewer Name
              const name =
                item.trader?.fullName ||
                item.trader?.name ||
                item.customer?.fullName ||
                item.customer?.name ||
                item.user?.fullName ||
                item.user?.name ||
                item.customerName ||
                item.name ||
                `Reviewer ${idx + 1}`;

              // Review Text
              const rawText =
                item.review ||
                item.comment ||
                item.reviewText ||
                item.text ||
                item.title ||
                "";

              // Avatar
              const rawAvatar =
                item.trader?.profileImage ||
                item.trader?.logo ||
                item.customer?.profileImage ||
                item.customer?.avatar ||
                item.user?.profileImage ||
                item.user?.avatar ||
                null;

              return {
                id: item.id || item._id || String(idx),
                name,
                categoryName,
                companyName,
                stars: Math.min(Math.max(rating, 1), 5),
                text: rawText,
                avatar: getImageUrl(rawAvatar) || "/avt.png",
              };
            }
          );

          setReviews(formatted);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error("Failed to load public reviews:", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1 && !loading) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && !loading) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <section className="bg-[#F8F9F5] px-4 sm:px-6 lg:px-20 py-8 lg:py-12">
      <div className="max-w-[1200px] mx-auto w-full">
        {/* Review Principles Section */}
        <div className="mb-14 sm:mb-16">
          <h2
            className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-[#243A24] mb-6 sm:mb-8"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            Review Principles
          </h2>

          <div className="space-y-4 sm:space-y-5">
            {principles.map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <h3 className="text-[15px] sm:text-[16px] font-bold text-[#243A24] mb-1">
                  {item.title}
                </h3>
                <p className="text-[#555555] text-[13.5px] sm:text-[14.5px] leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div>
          <h2
            className="text-[26px] sm:text-[30px] md:text-[34px] font-bold text-[#243A24] leading-tight text-center mb-8 sm:mb-10"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            Customer
            <br />
            Reviews
          </h2>

          {loading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-[28px] sm:rounded-[32px] border border-[#243A241F] shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-6 sm:p-7 flex flex-col justify-between animate-pulse"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2.5 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200" />
                        <div>
                          <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
                          <div className="h-2.5 w-24 bg-gray-200 rounded mb-2" />
                          <div className="h-4 w-28 bg-gray-200 rounded" />
                        </div>
                      </div>
                      <div className="w-5 h-5 bg-gray-200 rounded" />
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-5/6" />
                      <div className="h-3 bg-gray-200 rounded w-4/6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white rounded-[28px] border border-[#243A241F] shadow-[0_10px_30px_rgba(0,0,0,0.02)] max-w-[480px] mx-auto">
              <div className="w-12 h-12 rounded-full bg-[#6E9625]/10 flex items-center justify-center text-[#6E9625] mb-3">
                <FiStar size={22} className="fill-[#6E9625]" />
              </div>
              <h3 className="text-[17px] font-bold text-[#243A24] mb-1">
                No reviews yet
              </h3>
              <p className="text-[13.5px] text-[#555555]">
                There are currently no public customer reviews to display.
              </p>
            </div>
          ) : (
            /* Reviews Grid */
            <>
              <div
                className={`grid gap-5 items-stretch ${reviews.length === 1
                  ? "grid-cols-1 max-w-[380px] mx-auto"
                  : reviews.length === 2
                    ? "grid-cols-1 sm:grid-cols-2 max-w-[760px] mx-auto"
                    : reviews.length === 3
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-[1040px] mx-auto"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                  }`}
              >
                {reviews.map((rev) => (
                  <ReviewCard key={rev.id} rev={rev} />
                ))}
              </div>

              {/* Automatic Pagination Controls when totalPages > 1 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8 sm:mt-10">
                  {/* Previous Arrow Button */}
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1 || loading}
                    aria-label="Previous page"
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-[#243A2426] bg-white text-[#243A24] flex items-center justify-center shadow-sm hover:bg-[#243A24] hover:text-white hover:border-[#243A24] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#243A24] disabled:hover:border-[#243A2426] cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {/* Indicator Pills / Dots */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          aria-label={`Go to page ${pageNum}`}
                          className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${pageNum === currentPage
                            ? "w-7 sm:w-8 bg-[#6E9625]"
                            : "w-2.5 bg-[#243A2426] hover:bg-[#243A2450]"
                            }`}
                        />
                      )
                    )}
                  </div>

                  {/* Next Arrow Button */}
                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages || loading}
                    aria-label="Next page"
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-[#243A2426] bg-white text-[#243A24] flex items-center justify-center shadow-sm hover:bg-[#243A24] hover:text-white hover:border-[#243A24] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#243A24] disabled:hover:border-[#243A2426] cursor-pointer"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default PublicReviewsSection;
