"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiChevronRight, FiArrowRight, FiUserPlus } from "react-icons/fi";
import {
  FaFaucetDrip,
  FaPlug,
  FaTrowelBricks,
  FaHammer,
  FaWrench,
  FaPaintRoller,
  FaWind,
} from "react-icons/fa6";
import { motion } from "framer-motion";
import { authApi } from "@/app/api/authApi";

const defaultCategories = [
  { name: "PLUMBER" },
  { name: "ELECTRICIAN" },
  { name: "BUILDER" },
  { name: "CARPENTER" },
  { name: "PAINTER" },
  { name: "HANDYMAN" },
  { name: "HVAC" },
  { name: "ROOFER" },
];

const getCategoryIcon = (name: string) => {
  const upper = name?.toUpperCase() || "";
  if (upper.includes("PLUMB") || upper.includes("WATER") || upper.includes("PIPE")) return FaFaucetDrip;
  if (upper.includes("ELECTRIC") || upper.includes("WIRE") || upper.includes("POWER")) return FaPlug;
  if (upper.includes("BUILD") || upper.includes("BRICK") || upper.includes("MASON")) return FaTrowelBricks;
  if (upper.includes("CARPENTER") || upper.includes("WOOD")) return FaHammer;
  if (upper.includes("PAINT")) return FaPaintRoller;
  if (upper.includes("HVAC") || upper.includes("AIR") || upper.includes("HEAT")) return FaWind;
  if (upper.includes("ROOF")) return FaHammer;
  return FaWrench;
};

const CategoryCard = ({ cat }: { cat: any }) => {
  const Icon = getCategoryIcon(cat.name || "");
  const name = cat.name || "Trade Service";

  const targetUrl = cat.id || cat._id
    ? `/directory-listing/search?categoryId=${cat.id || cat._id}`
    : `/directory-listing/search?categoryName=${encodeURIComponent(name)}`;

  return (
    <Link
      href={targetUrl}
      className="group flex items-center justify-between rounded-[18px] bg-white px-5 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-md transition-all duration-300 w-[220px] md:w-[240px] shrink-0"
    >
      {/* Icon & Name */}
      <div className="flex items-center gap-3">
        <div className="text-[#1E3A2B] flex items-center justify-center shrink-0">
          {cat.image ? (
            <img
              src={
                cat.image.startsWith("http")
                  ? cat.image
                  : `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")}${cat.image.startsWith("/") ? cat.image : `/${cat.image}`}`
              }
              alt={name}
              className="w-5 h-5 object-contain"
              crossOrigin="anonymous"
            />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </div>
        <span className="text-[13px] md:text-[14px] font-bold tracking-[1.5px] text-[#1E3A2B] uppercase">
          {name}
        </span>
      </div>

      {/* Simple Arrow */}
      <div className="text-gray-400 group-hover:text-[#1E3A2B] group-hover:translate-x-0.5 transition-all">
        <FiArrowRight size={15} />
      </div>
    </Link>
  );
};

export default function CategorySection() {
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await authApi.getCategories();
        const list = Array.isArray(res) ? res : res?.data || [];
        if (list.length > 0) {
          const existingNames = new Set(list.map((c: any) => c.name?.toUpperCase()));
          const extra = defaultCategories.filter((c) => !existingNames.has(c.name));
          setCategoriesList([...list, ...extra]);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCats();
  }, []);

  const activeCats = categoriesList.length > 0 ? categoriesList : defaultCategories;

  return (
    <section className="w-full pt-2 md:pt-4 pb-14 md:pb-20 bg-[#FBFBFB] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold text-[#1E3A2B] tracking-tight">
            Explore Our <span className="text-[#6F9824]">Trades</span>
          </h2>

          <Link
            href="/directory-listing"
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200/90 bg-white px-4 py-1.5 text-[12px] sm:text-[13px] font-semibold text-[#1E3A2B] hover:bg-gray-50 transition-all shadow-sm"
          >
            <span>View all</span>
            <FiChevronRight size={14} className="text-gray-500" />
          </Link>
        </div>

        {/* SINGLE ROW SMOOTH MARQUEE */}
        <div className="w-full overflow-hidden relative py-1">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 32 }}
            className="flex gap-4 pr-4 w-max shrink-0"
          >
            {[...activeCats, ...activeCats].map((cat, index) => (
              <CategoryCard key={`cat-${index}`} cat={cat} />
            ))}
          </motion.div>
        </div>

        {/* PROMO BANNER CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12 pb-4">

          {/* CARD 1: Need work done? */}
          <div className="relative overflow-hidden rounded-[18px] bg-white shadow-sm h-[265px]">
            {/* Full height image on left */}
            <div className="absolute left-0 top-0 bottom-0 w-[47%]">
              <Image
                src="/Need work done.jpg"
                alt="Need work done"
                fill
                className="object-cover object-left"
                priority
              />
              {/* Fade gradient from left to right */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white" />
            </div>

            {/* Text on upper right */}
            <div className="absolute top-5 right-5 left-[48%] flex flex-col justify-start z-10">
              <p className="text-[#1E3A2B] font-bold text-[14px] leading-tight mb-1">Need work done?</p>
              <h3 className="text-[#1E3A2B] font-extrabold text-[24px] sm:text-[26px] leading-tight mb-2">
                Find a <br /> Tradesperson
              </h3>
              <p className="text-[#4A5548] font-medium text-[12.5px] leading-snug max-w-[230px]">
                Post your job for free or browse local professionals.
              </p>
            </div>

            {/* Bottom Buttons Row: Left button sits over photo, right button under text */}
            <div className="absolute bottom-4 left-4 right-4 flex gap-2.5 z-20">
              <Link
                href="/directory-listing"
                className="flex-1 bg-[#122C17] hover:bg-[#0a1c0d] text-white text-[11px] sm:text-[11.5px] font-extrabold py-2.5 px-2 rounded-[6px] transition-colors uppercase tracking-wider text-center shadow-sm flex items-center justify-center whitespace-nowrap"
              >
                Find a Tradesperson
              </Link>
              <Link
                href="/post-job"
                className="flex-1 bg-[#6F9824] hover:bg-[#5f831e] text-white text-[11px] sm:text-[11.5px] font-extrabold py-2.5 px-2 rounded-[6px] transition-colors uppercase tracking-wider text-center shadow-sm flex items-center justify-center whitespace-nowrap"
              >
                Post your job - Free
              </Link>
            </div>
          </div>

          {/* CARD 2: Want more work? */}
          <div className="flex flex-col">
            <div className="relative overflow-hidden rounded-[18px] bg-white shadow-sm h-[265px]">

              {/* Content Left */}
              <div className="absolute top-5 left-5 bottom-4 w-[48%] flex flex-col justify-between z-20">
                <div>
                  <p className="text-[#1E3A2B] font-bold text-[14px] leading-tight mb-1">Want more work?</p>
                  <h3 className="text-[#1E3A2B] font-extrabold text-[24px] sm:text-[26px] leading-tight mb-2">
                    Join TugaTrades
                  </h3>
                  <p className="text-[#4A5548] font-medium text-[12.5px] leading-snug max-w-[220px]">
                    Create your personal profile, get discovered by local customers and grow your business.
                  </p>
                </div>

                <div>
                  <Link
                    href="/trader-signup"
                    className="inline-flex items-center gap-1.5 bg-[#BA1515] hover:bg-[#991111] text-white text-[11px] sm:text-[11.5px] font-extrabold py-2.5 px-3.5 rounded-[6px] transition-colors uppercase tracking-wider text-center shadow-sm whitespace-nowrap"
                  >
                    <FiUserPlus size={15} />
                    <span>Join as a Tradesperson</span>
                  </Link>
                </div>
              </div>

              {/* Image Right: Phone mockup + Plumber */}
              <div className="absolute right-0 top-0 bottom-0 w-[54%] z-10 pointer-events-none">
                <Image
                  src="/Want more work.png"
                  alt="Want more work"
                  fill
                  className="object-cover object-left"
                  priority
                />
              </div>
            </div>

            {/* Sub-text: FIRST 3 MONTHS FREE!* */}
            <div className="text-right mt-1.5 pr-1">
              <span className="text-[#6F9824] font-extrabold text-[11px] uppercase tracking-wider">
                FIRST 3 MONTHS FREE!*
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}