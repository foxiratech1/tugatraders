"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FiStar, FiChevronLeft, FiChevronRight, FiCheckCircle, FiUser } from "react-icons/fi";
import { FaQuoteRight } from "react-icons/fa";
import { motion } from "framer-motion";
import { slideFromLeft, slideFromRight, staggerContainer } from "./animationVariants";
import Link from "next/link";
import { authApi } from "@/app/api/authApi";



const topFeatures = [
  "Verified reviews only",
  "Professionals can respond to feedback",
  "Honest, transparent ratings",
];

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);

  // Fetch Public Approved Reviews API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await authApi.getPublicReviews(1, 10);

        console.log("Public Reviews Response:", res);

        // Extract reviews list safely from various API response wrappers
        const rawList =
          res?.data?.reviews ||
          res?.reviews ||
          res?.data ||
          (Array.isArray(res) ? res : []);

        if (Array.isArray(rawList) && rawList.length > 0) {
          const formatted = rawList.map((item: any, idx: number) => {
            const rating = Number(item.rating || item.stars || item.score || 5);

            const name =
              item.trader?.fullName ||
              item.trader?.name ||
              item.traderProfile?.companyName ||
              item.traderName ||
              "Verified Trader";

            const extractCategoryName = (cat: any): string => {
              if (!cat) return "";
              if (typeof cat === "string") return cat;
              if (typeof cat === "object") return cat.name || cat.title || cat.label || "";
              return "";
            };

            const company =
              item.trader?.traderProfile?.companyName ||
              item.trader?.companyName ||
              item.companyName ||
              "";

            const category =
              extractCategoryName(item.trader?.traderProfile?.tradeCategories?.[0]) ||
              extractCategoryName(item.traderProfile?.tradeCategories?.[0]) ||
              extractCategoryName(item.trader?.tradeCategories?.[0]) ||
              extractCategoryName(item.traderCategory) ||
              extractCategoryName(item.tradeCategory) ||
              extractCategoryName(item.traderProfile?.tradeCategory) ||
              extractCategoryName(item.category) ||
              "";

            const location =
              item.trader?.city ||
              item.trader?.location ||
              item.location ||
              "";

            let role = "VERIFIED TRADER";
            if (category && location) {
              role = `${category} - ${location}`.toUpperCase();
            } else if (category && company) {
              role = `${category} • ${company}`.toUpperCase();
            } else if (category) {
              role = category.toUpperCase();
            } else if (company) {
              role = company.toUpperCase();
            }

            const rawText =
              item.review ||
              item.comment ||
              item.reviewText ||
              item.text ||
              item.title ||
              "";

            const text = rawText
              ? rawText.startsWith('"') ? rawText : `"${rawText}"`
              : '"Great service and quality work!"';

            const rawAvatar =
              item.trader?.traderProfile?.logo ||
              item.trader?.traderProfile?.profileImage ||
              item.traderProfile?.logo ||
              item.traderProfile?.profileImage ||
              item.traderProfile?.avatar ||
              item.trader?.logo ||
              item.trader?.avatar ||
              item.trader?.profileImage ||
              item.traderAvatar ||
              item.traderLogo ||
              null;

            const avatar = getImageUrl(rawAvatar);

            return {
              id: item.id || item._id || String(idx),
              name,
              role,
              stars: rating,
              text,
              avatar,
            };
          });

          setReviews(formatted);
        }
      } catch (error) {
        console.error("Failed to load public reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      let cards = 3;
      if (window.innerWidth < 640) {
        cards = 1;
      } else if (window.innerWidth < 1024) {
        cards = 2;
      }
      setVisibleCards(cards);
      setCurrentIndex((prev) => Math.min(prev, Math.max(0, reviews.length - cards)));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [reviews.length]);

  const maxIndex = Math.max(0, reviews.length - visibleCards);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={slideFromLeft}
      className="relative bg-[#FBFCF8] py-12 sm:py-16 md:py-24 overflow-hidden"
    >
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#6E9625]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-50/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="mx-auto max-w-[1300px] px-4 sm:px-6">
        {/* Main CTA Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-[800px] bg-white rounded-[32px] sm:rounded-[48px] md:rounded-[48px] p-6 sm:p-8 md:p-10 text-center shadow-[0_30px_100px_rgba(0,0,0,0.03)] border border-[#C9CBC7] mb-12 sm:mb-16 md:mb-20 overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-[32px] sm:text-[40px] md:text-[56px] font-bold text-[#243A24] tracking-tight leading-tight mb-3 sm:mb-4 md:mb-5">
              Your Review <span className="text-[#6E9625]">Matters.</span>
            </h2>
            <p className="mx-auto max-w-[700px] text-[15px] sm:text-[16px] md:text-[18px] leading-relaxed text-[#6F736C] font-medium mb-5 sm:mb-6 md:mb-8">
              Your feedback plays an important role in helping us uphold the high standards
              of our traders. It also supports their reputation and helps other potential
              customers make informed decisions based on your experience.
            </p>
            <Link href="/review">
              <button className="bg-[#6E9625] text-white px-6 sm:px-10 py-3 sm:py-4 rounded-[12px] text-[15px] sm:text-[17px] font-bold shadow-lg shadow-[#6E9625]/20 hover:bg-[#5a7b1e] transition-all cursor-pointer">
                Leave a Review
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Review Cards Slider Wrapper */}
        <div className="relative mb-12 sm:mb-16 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-16 text-gray-400 font-medium animate-pulse text-base">
              Loading approved reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex justify-center items-center py-16 text-gray-400 font-medium text-base">
              No review found
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
              }}
            >
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  variants={slideFromLeft}
                  className="flex-shrink-0 px-4"
                  style={{ width: `${100 / visibleCards}%` }}
                >
                  <div className="relative bg-white rounded-[24px] sm:rounded-[36px] md:rounded-[45px] p-6 sm:p-8 md:p-10 h-full shadow-[0_15px_50px_rgba(0,0,0,0.02)] border border-[#C9CBC7] flex flex-col transition-transform hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-6 sm:mb-8">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#6E96251A] flex-shrink-0 bg-gray-100 flex items-center justify-center text-gray-400">
                          {review.avatar ? (
                            <Image
                              src={review.avatar}
                              alt={review.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <FiUser className="w-6 h-6 sm:w-8 sm:h-8" />
                          )}
                        </div>
                        <div>
                          <div className="flex gap-0.5 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                size={14}
                                className={i < review.stars ? "fill-[#6E9625] text-[#6E9625]" : "text-gray-200"}
                              />
                            ))}
                          </div>
                          <p className="text-[10px] font-bold text-[#6E9625] tracking-widest uppercase">
                            {review.role}
                          </p>
                          <h4 className="text-[18px] sm:text-[20px] font-bold text-[#243A24]">
                            {review.name}
                          </h4>
                        </div>
                      </div>
                      <FaQuoteRight className="text-gray-200 mt-2 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                    </div>

                    <p className="text-[14px] sm:text-[16px] leading-relaxed text-[#6F736C] font-medium italic">
                      {review.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Navigation Buttons */}
        {reviews.length > visibleCards && (
          <div className="flex justify-center gap-4 mb-12 sm:mb-16 md:mb-24">
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-full border border-[#243A24] flex items-center justify-center text-[#243A24] hover:bg-white hover:border-[#6E9625] hover:text-[#6E9625] transition-all shadow-sm active:scale-95 cursor-pointer"
              aria-label="Previous review"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full border border-[#243A24] flex items-center justify-center text-[#243A24] hover:bg-white hover:border-[#6E9625] hover:text-[#6E9625] transition-all shadow-sm active:scale-95 cursor-pointer"
              aria-label="Next review"
            >
              <FiChevronRight size={24} />
            </button>
          </div>
        )}

        {/* Features Row */}
        <div className="pt-10 sm:pt-16 border-t border-gray-100">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-4"
          >
            {topFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={slideFromRight}
                className="flex items-center gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#EBF1E4] flex items-center justify-center">
                  <FiCheckCircle className="text-[#6E9625]" size={20} />
                </div>
                <p className="text-[16px] sm:text-[18px] font-bold text-[#243A24]">
                  {feature}
                </p>
              </motion.div>
            ))}
          </motion.div>
          <p className="text-[12px] text-gray-300 mt-8 text-center italic">
            *Vetted - based on submitted documents and does not guarantee quality or reliability.
          </p>
        </div>

      </div>
    </motion.section>
  );
}
