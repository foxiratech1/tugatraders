"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  FiPlusCircle,
  FiArrowRight,
  FiCheckCircle,
  FiChevronRight,
} from "react-icons/fi";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/app/api/authApi";

const getImageUrl = (path?: string) => {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http")) return path;

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const baseUrl = API_URL.endsWith("/")
    ? API_URL.slice(0, -1)
    : API_URL;

  const imagePath = path.startsWith("/")
    ? path
    : `/${path}`;

  return `${baseUrl}${imagePath}`;
};

interface Category {
  id?: string;
  _id?: string;
  name: string;
  image?: string;
  isActive?: boolean;
}

const features = [
  "Easy to compare local tradespeople",
  "Transparent profiles and reviews",
  "No commissions or hidden fees",
  "Direct communication with traders",
];

const MapSearchSection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    authApi
      .getCategories()
      .then((res) => {
        const rawData = Array.isArray(res) ? res : res?.data ?? [];
        const data = Array.isArray(rawData) ? rawData : rawData?.data ?? [];
        setCategories(data);
      })
      .catch(() => setCategories([]));
  }, []);

  const midpoint = Math.ceil(categories.length / 2);
  const leftCategories = categories.slice(0, midpoint);
  const rightCategories = categories.slice(midpoint);

  const handleCategoryClick = (id?: string) => {
    if (!id) return;
    router.push(`/directory-listing/search?categoryId=${id}`);
  };

  return (
    <section className="w-full overflow-hidden bg-[#FAFAF5] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1400px] px-4 text-center sm:px-6 lg:px-8 xl:px-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mx-auto max-w-[1000px] text-[28px] font-bold leading-[1.2] tracking-tight text-[#243A24] sm:text-[34px] md:text-[40px] lg:text-[42px] xl:text-[46px]">
            Search for Trades or Post Your Job,
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Compare Quotes, and Hire with Confidence
          </h2>

          <p className="mt-4 mb-10 text-[15px] font-medium text-[#6E9625] sm:mb-12 sm:text-[17px] lg:mb-16 lg:text-[18px]">
            All in One Place, Completely Free.
          </p>
        </motion.div>

        {/* Map + Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="relative flex w-full items-center justify-center gap-6 lg:gap-8 xl:gap-10"
        >

          {/* Left Categories */}
          <div className="hidden shrink-0 flex-col gap-3 md:flex md:w-[280px] lg:w-[300px] xl:w-[320px]">
            {leftCategories.map((cat, i) => (
              <motion.div
                key={cat.id || cat._id || i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                onClick={() => handleCategoryClick(cat.id || cat._id)}
                className="group flex min-h-[50px] w-full cursor-pointer items-center justify-between overflow-hidden rounded-xl border border-[#F3F4F6] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all hover:shadow-md"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                  <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center bg-[#314828]">
                    {cat.image ? (
                      <Image
                        src={getImageUrl(cat.image)}
                        alt={cat.name}
                        width={24}
                        height={24}
                        className="object-contain brightness-0 invert"
                        unoptimized
                      />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>

                  <span className="min-w-0 flex-1 text-left text-[13px] font-medium leading-snug text-[#243A24] sm:text-[14px]">
                    {cat.name}
                  </span>
                </div>

                <div className="shrink-0 pr-3 text-gray-400 transition-colors group-hover:text-[#6E9625] sm:pr-4">
                  <FiChevronRight size={18} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Center Map */}
          <div className="relative w-full max-w-[280px] shrink-0 sm:max-w-[320px] md:max-w-[340px] lg:max-w-[360px] xl:max-w-[380px]">
            <Image
              src="/maplogo.jfif"
              alt="Portugal Map with Trades"
              width={380}
              height={500}
              unoptimized
              priority
              className="h-auto w-full object-contain"
            />
          </div>

          {/* Right Categories */}
          <div className="hidden shrink-0 flex-col gap-3 md:flex md:w-[280px] lg:w-[300px] xl:w-[320px]">
            {rightCategories.map((cat, i) => (
              <motion.div
                key={cat.id || cat._id || i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                onClick={() => handleCategoryClick(cat.id || cat._id)}
                className="group flex min-h-[50px] w-full cursor-pointer items-center justify-between overflow-hidden rounded-xl border border-[#F3F4F6] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all hover:shadow-md"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                  <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center bg-[#314828]">
                    {cat.image ? (
                      <Image
                        src={getImageUrl(cat.image)}
                        alt={cat.name}
                        width={24}
                        height={24}
                        className="object-contain brightness-0 invert"
                        unoptimized
                      />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>

                  <span className="min-w-0 flex-1 text-left text-[13px] font-medium leading-snug text-[#243A24] sm:text-[14px]">
                    {cat.name}
                  </span>
                </div>

                <div className="shrink-0 pr-3 text-gray-400 transition-colors group-hover:text-[#6E9625] sm:pr-4">
                  <FiChevronRight size={18} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mobile Categories */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 md:hidden">
          {categories.map((cat, i) => (
            <button
              key={cat.id || cat._id || i}
              type="button"
              onClick={() => handleCategoryClick(cat.id || cat._id)}
              className="flex max-w-full items-center gap-2 rounded-full border border-[#E8EDE8] bg-white px-3 py-2 text-left shadow-sm transition-all hover:shadow-md sm:px-4 sm:py-2.5"
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#6E9625]" />

              <span className="max-w-[220px] truncate text-[12px] font-medium text-[#243A24] sm:max-w-[280px] sm:text-[13px]">
                {cat.name}
              </span>
            </button>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mt-12 flex flex-col items-center sm:mt-14 lg:mt-16"
        >
          <Link
            href="/post-job"
            className="flex w-full max-w-[280px] items-center justify-center gap-2 rounded-[14px] bg-[#243A24] px-5 py-3.5 text-[15px] font-bold text-white shadow-xl shadow-[#243A24]/20 transition-all hover:bg-[#1a2e1a] sm:max-w-[300px] sm:gap-3 sm:px-7 sm:py-4 sm:text-[17px]"
          >
            <FiPlusCircle size={22} className="shrink-0 text-white" />
            <span>Post a Job</span>
            <FiArrowRight size={20} className="ml-1 shrink-0 text-white" />
          </Link>

          <h3 className="mt-4 text-center text-[28px] font-bold leading-[1.2] tracking-tight text-[#243A24] sm:text-[36px] md:text-[42px] lg:text-[48px]">
            Let the <span className="text-[#6E9625]">right</span> tradespeople
            <br />
            come to you.
          </h3>
        </motion.div>

        {/* Bottom Feature Box */}
        <div className="mx-auto mt-12 w-full max-w-[1352px] rounded-[24px] border border-[#6E96251A] bg-[#F1F7E8] p-5 sm:mt-16 sm:rounded-[32px] sm:p-7 md:p-9 lg:mt-20 lg:rounded-[56px] lg:p-12">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-7 lg:grid-cols-4 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center gap-3 text-left sm:gap-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm sm:h-9 sm:w-9">
                  <FiCheckCircle className="text-[#84cc16]" size={18} />
                </div>

                <p className="text-[14px] font-bold leading-snug text-[#243A24] sm:text-[16px] lg:text-[17px] xl:text-[18px]">
                  {feature}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default MapSearchSection;