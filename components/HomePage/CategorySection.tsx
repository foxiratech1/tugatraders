"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiChevronRight,
  FiArrowRight,
} from "react-icons/fi";
import { Hammer, Wrench, Paintbrush, Wind, Bug, Droplet, Zap, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { authApi } from "@/app/api/authApi";

const defaultCategories = [
  { name: "CARPENTER" },
  { name: "HANDYMAN" },
  { name: "PAINTER" },
  { name: "HVAC" },
  { name: "PEST CONTROL" },
  { name: "PLUMBING" },
];

const getCategoryIcon = (name: string) => {
  const upper = name?.toUpperCase() || "";
  if (upper.includes("BUILD") || upper.includes("BRICK") || upper.includes("MASON")) return Hammer;
  if (upper.includes("PLUMB") || upper.includes("WATER") || upper.includes("PIPE")) return Wrench;
  if (upper.includes("CARPENTER") || upper.includes("WOOD")) return Hammer;
  if (upper.includes("ELECTRIC") || upper.includes("WIRE")) return Zap;
  if (upper.includes("GARDEN") || upper.includes("LANDSCAPE") || upper.includes("TREE")) return Leaf;
  if (upper.includes("PAINT")) return Paintbrush;
  if (upper.includes("HVAC") || upper.includes("AIR") || upper.includes("HEAT")) return Wind;
  if (upper.includes("PEST") || upper.includes("BUG")) return Bug;
  if (upper.includes("HANDYMAN")) return Hammer;
  return Wrench;
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
      className="group relative overflow-hidden flex items-center justify-between rounded-[32px] border border-[#D7DAD4] bg-[#F8F9F8] px-6 py-6 hover:bg-[#243A24] transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#243A24]/10 w-[300px] md:w-[380px] shrink-0"
    >
      {/* LEFT CONTENT */}
      <div className="flex items-center gap-5 transition-all duration-500 group-hover:-translate-x-2">
        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#243A24] group-hover:bg-[#89b341]/20 group-hover:text-[#89b341] transition-all duration-500">
          <Icon size={28} strokeWidth={1.7} />
        </div>

        <div className="flex flex-col">
          <span className="text-[14px] md:text-[15px] font-[800] tracking-[1.5px] text-[#243A24] group-hover:text-white transition-colors duration-500 uppercase">
            {name}
          </span>

          {/* SHOWS ON HOVER */}
          <span className="text-[13px] text-white/70 mt-1 opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-10 transition-all duration-500 overflow-hidden">
            Explore trusted {name.toLowerCase()} services
          </span>
        </div>
      </div>

      {/* RIGHT ARROW */}
      <div className="flex items-center justify-center w-11 h-11 rounded-full bg-white/80 text-[#243A24] group-hover:bg-[#89b341] group-hover:text-white transition-all duration-500 group-hover:translate-x-1">
        <FiArrowRight size={18} />
      </div>

      {/* HOVER GLOW */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-[#89b341]/10 to-transparent transition-opacity duration-500 pointer-events-none" />
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
        setCategoriesList(list);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCats();
  }, []);

  const activeCats = categoriesList.length > 0 ? categoriesList : defaultCategories;
  const half = Math.max(1, Math.ceil(activeCats.length / 2));
  const row1Base = activeCats.slice(0, half);
  const row2Base = activeCats.slice(half).length > 0 ? activeCats.slice(half) : row1Base;

  const repeatCount = Math.max(2, Math.ceil(12 / row1Base.length));
  const row1Items = Array(repeatCount).fill(row1Base).flat();
  const row2Items = Array(repeatCount).fill(row2Base).flat();

  return (
    // WHOLE SECTION MOVED HIGHER, added overflow-hidden to contain the marquee width
    <section className="w-full pt-2 md:pt-4 pb-16 md:pb-24 bg-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
        >
          <div className="max-w-[760px]">
            <h2 className="text-[30px] sm:text-[34px] md:text-[52px] font-bold text-[#243A24] leading-tight mb-3 md:mb-4">
              Explore Our <br className="max-sm:hidden" />
              <span className="text-[#89b341]">Trade Services</span>
            </h2>

            {/* ALL TEXT IN ONE LINE */}
            <p className="text-[15px] md:text-[16px] text-[#6F736C] font-medium leading-relaxed whitespace-nowrap">
              Find the right specialist for your specific needs from our network of vetted professionals.
            </p>
          </div>

          <Link
            href="/directory-listing"
            className="inline-flex self-start md:self-auto items-center gap-2 rounded-full border border-[#243A24]/20 px-6 sm:px-8 py-3 md:py-3.5 text-[13px] md:text-[14px] font-bold text-[#243A24] hover:bg-[#243A24] hover:text-white transition-all shadow-sm whitespace-nowrap"
          >
            View all categories
            <FiChevronRight size={18} />
          </Link>
        </motion.div>

        {/* INTERACTIVE CATEGORIES MARQUEE */}
        <div className="w-full flex flex-col gap-6">

          {/* TOP ROW: Left to Right Marquee */}
          <div className="flex overflow-hidden w-full relative">
            <motion.div
              animate={{ x: ["-100%", "0%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 120 }}
              className="flex gap-6 pr-6 w-max shrink-0"
            >
              {row1Items.map((cat, index) => (
                <CategoryCard key={`r1a-${index}`} cat={cat} />
              ))}
            </motion.div>
            <motion.div
              animate={{ x: ["-100%", "0%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 120 }}
              className="flex gap-6 pr-6 w-max shrink-0"
            >
              {row1Items.map((cat, index) => (
                <CategoryCard key={`r1b-${index}`} cat={cat} />
              ))}
            </motion.div>
          </div>

          {/* BOTTOM ROW: Right to Left Marquee */}
          <div className="flex overflow-hidden w-full relative">
            <motion.div
              animate={{ x: ["0%", "-100%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 120 }}
              className="flex gap-6 pr-6 w-max shrink-0"
            >
              {row2Items.map((cat, index) => (
                <CategoryCard key={`r2a-${index}`} cat={cat} />
              ))}
            </motion.div>
            <motion.div
              animate={{ x: ["0%", "-100%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 120 }}
              className="flex gap-6 pr-6 w-max shrink-0"
            >
              {row2Items.map((cat, index) => (
                <CategoryCard key={`r2b-${index}`} cat={cat} />
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}