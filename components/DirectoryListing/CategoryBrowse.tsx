"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { authApi } from "@/app/api/authApi";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  image: string;
}


const CategoryBrowse = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await authApi.getCategories();
        setCategories(Array.isArray(res) ? res : res.data || []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    }
    fetchCategories();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;

      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="relative w-full min-h-[420px] sm:h-[430px] flex items-center overflow-hidden bg-[#243A24] py-8 sm:py-0">
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/group.jpg"
          alt="Tradespeople group"
          fill
          className="object-cover object-[center_35%] opacity-40"
        />

        <div className="absolute inset-0 bg-[#243A24]/70" />
      </div>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 h-full flex flex-col justify-center pt-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div className="flex flex-col gap-2">
            <h2
              className="text-[30px] sm:text-[40px] md:text-[52px] font-bold text-white leading-[1.05]"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              Browse categories
            </h2>

            <p className="text-white/70 text-[15px] sm:text-[17px] font-medium">
              Discover specialists for every aspect of your project.
            </p>
          </div>

          {/* NAVIGATION */}
          <div className="flex gap-3 mt-2 sm:mt-4">
            <button
              onClick={() => scroll("left")}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all duration-300 cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={() => scroll("right")}
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#243A24] shadow-lg hover:bg-white/90 transition-all duration-300 cursor-pointer"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* INTERACTIVE CATEGORY ROW */}
        <div
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto pb-8 scrollbar-hide no-scrollbar scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {categories.map((cat, index) => (
            <div
              key={index}
              className="group relative min-w-[250px] h-[220px] bg-white rounded-[34px] p-7 overflow-hidden flex-shrink-0 shadow-2xl cursor-pointer transition-all duration-500 hover:bg-[#F5F8F2] hover:-translate-y-1"
            >
              {/* CONTENT */}
              <div className="relative z-10 h-full flex flex-col justify-between">

                {/* TOP */}
                <div className="transition-all duration-500 group-hover:-translate-x-2">
                  <div className="w-14 h-14 rounded-2xl bg-[#F4F7F1] flex items-center justify-center overflow-hidden mb-5 transition-all duration-500 group-hover:bg-[#6E9625]/10 group-hover:scale-105">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <LayoutGrid className="text-[#064E3B]" size={24} />
                    )}
                  </div>

                  <h3 className="text-[#064E3B] font-bold text-[24px] leading-tight">
                    {cat.name}
                  </h3>
                </div>

                {/* HOVER CONTENT */}
                <div className="opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  <p className="text-[#4B5563] text-[14px] leading-relaxed mb-5">
                    Find the best {cat.name.toLowerCase()}s for your project.
                  </p>

                  <div className="flex items-center gap-2 text-[#6E9625] font-semibold text-[14px]">
                    View trades
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </div>
              </div>

              {/* HOVER BACKGROUND EFFECT */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-[#6E9625]/5 to-transparent transition-opacity duration-500" />
            </div>
          ))}
        </div>

        {/* BOTTOM LINE */}
        <div className="w-full h-[1px] bg-white/20 mt-auto mb-4" />
      </div>
    </section>
  );
};

export default CategoryBrowse;