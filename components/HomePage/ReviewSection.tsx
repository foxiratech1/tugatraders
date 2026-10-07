"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiStar } from "react-icons/fi";
import { FaQuoteRight } from "react-icons/fa";
import { motion } from "framer-motion";
import { authApi } from "@/app/api/authApi";

function getImageUrl(path: string | null | undefined): string | null {
  if (!path || path === "null" || path === "undefined") return null;
  if (path.startsWith("http")) return path;
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${baseUrl}/${cleanPath}`;
}

export default function ReviewSection() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await authApi.getPublicReviews(1, 10);
        const rawList =
          res?.data?.reviews ||
          res?.reviews ||
          res?.data ||
          (Array.isArray(res) ? res : []);

        if (Array.isArray(rawList) && rawList.length > 0) {
          const formatted = rawList.map((item: any, idx: number) => {
            const rating = Number(item.rating || item.stars || item.score || 5);
            const name =
              item.customer?.fullName ||
              item.customer?.name ||
              item.customerName ||
              item.user?.name ||
              item.trader?.fullName ||
              item.traderName ||
              `Customer ${idx + 1}`;

            const rawText =
              item.review ||
              item.comment ||
              item.reviewText ||
              item.text ||
              item.title ||
              "";

            const rawAvatar =
              item.customer?.avatar ||
              item.customer?.profileImage ||
              item.user?.avatar ||
              item.trader?.profileImage ||
              item.trader?.logo ||
              null;

            return {
              id: item.id || item._id || String(idx),
              name,
              stars: rating,
              text: rawText ? (rawText.startsWith('"') ? rawText : `"${rawText}"`) : '""',
              avatar: getImageUrl(rawAvatar) || (idx % 2 === 0 ? "/avt.png" : "/combo.png"),
            };
          });

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
  }, []);

  const ReviewCard = ({ review }: { review: any }) => (
    <div className="bg-white rounded-[18px] p-3.5 sm:p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#E6EDE2] w-full max-w-[250px] sm:max-w-[265px] transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2.5 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
            <Image
              src={review.avatar || "/avt.png"}
              alt={review.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            {/* Stars */}
            <div className="flex items-center gap-0.5 mb-0.5">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  size={11}
                  className={
                    i < review.stars
                      ? "fill-[#6E9625] text-[#6E9625]"
                      : "text-gray-200"
                  }
                />
              ))}
            </div>
            {/* Name */}
            <p className="text-[12px] font-bold text-[#1E3A2B] leading-tight">
              {review.name}
            </p>
          </div>
        </div>

        {/* Quote mark icon */}
        <FaQuoteRight className="text-[#6E9625]/20 text-[13px] shrink-0 mt-0.5" />
      </div>

      {/* Review Text */}
      <p className="text-[12px] text-[#555E52] leading-relaxed line-clamp-3 italic">
        {review.text}
      </p>
    </div>
  );

  return (
    <section className="w-full py-16 md:py-24 bg-white px-4 sm:px-6 overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* LEFT: Heading, Description & Button */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex flex-col items-start justify-center"
          >
            <h2 className="text-[30px] sm:text-[36px] md:text-[40px] font-bold text-[#1E3A2B] leading-[1.15] mb-3.5 tracking-tight">
              Your <span className="text-[#6E9625]">Review</span>
              <br />
              Matters
            </h2>

            <p className="text-[#4A5548] text-[14px] sm:text-[15px] leading-[1.55] font-normal mb-6 max-w-[480px]">
              Your feedback plays an important role in helping us uphold the high<br className="hidden sm:inline" />
              standards of our traders. It also supports their reputation and helps<br className="hidden sm:inline" />
              other potential customers make informed decisions based on your<br className="hidden sm:inline" />
              experience.
            </p>

            <Link
              href="/review"
              className="inline-flex items-center justify-center bg-[#132E1A] hover:bg-[#1C3E24] text-white px-6 sm:px-7 py-2.5 sm:py-3 rounded-[10px] font-bold text-[13px] sm:text-[14px] transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
            >
              Leave a Review
            </Link>
          </motion.div>

          {/* RIGHT: Overlapping Review Cluster or Empty State */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-7 flex justify-center items-center w-full min-h-[300px]"
          >
            {loading ? (
              <div className="flex justify-center items-center py-16 text-gray-400 font-medium text-base animate-pulse">
                Loading approved reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center bg-[#F9FAF8] rounded-[24px] border border-dashed border-[#D2D8CF] w-full max-w-[440px]">
                <div className="w-12 h-12 rounded-full bg-[#6E9625]/10 flex items-center justify-center text-[#6E9625] mb-3">
                  <FiStar size={22} className="fill-[#6E9625]" />
                </div>
                <p className="text-[17px] font-bold text-[#1E3A2B] mb-1">
                  No review found
                </p>
                <p className="text-[13px] text-[#6F736C]">
                  There are currently no public approved reviews to display.
                </p>
              </div>
            ) : (
              /* Overlapping diamond/hexagon review cards cluster */
              <div className="grid grid-cols-2 gap-3 sm:gap-3.5 w-full max-w-[540px]">
                {/* Row 1: Top Card (Centered) */}
                {reviews[0] && (
                  <div className="col-span-2 flex justify-center z-20 -mb-4 sm:-mb-6">
                    <ReviewCard review={reviews[0]} />
                  </div>
                )}

                {/* Row 2: Upper-Left & Upper-Right Cards */}
                {reviews[1] && (
                  <div className="flex justify-end z-10">
                    <ReviewCard review={reviews[1]} />
                  </div>
                )}
                {reviews[2] && (
                  <div className="flex justify-start z-10">
                    <ReviewCard review={reviews[2]} />
                  </div>
                )}

                {/* Row 3: Lower-Left & Lower-Right Cards */}
                {reviews[3] && (
                  <div className="flex justify-end z-10 -mt-2">
                    <ReviewCard review={reviews[3]} />
                  </div>
                )}
                {reviews[4] && (
                  <div className="flex justify-start z-10 -mt-2">
                    <ReviewCard review={reviews[4]} />
                  </div>
                )}

                {/* Row 4: Bottom Card (Centered) */}
                {reviews[5] && (
                  <div className="col-span-2 flex justify-center z-20 -mt-4 sm:-mt-6">
                    <ReviewCard review={reviews[5]} />
                  </div>
                )}
              </div>
            )}
          </motion.div>

        </div>

        {/* Bottom Disclaimer */}
        <p className="text-[12px] sm:text-[13px] text-[#717A6E] mt-14 sm:mt-18 text-center italic">
          *Vetted - based on submitted documents and does not guarantee quality or reliability.
        </p>
      </div>
    </section>
  );
}
