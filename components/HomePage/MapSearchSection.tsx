"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FiPlusCircle, FiArrowRight, FiCheckCircle, FiCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/app/api/authApi";

interface Category {
  id: string;
  name: string;
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
    authApi.getCategories().then((res) => {
      const data = Array.isArray(res) ? res : res?.data ?? [];
      setCategories(data);
    }).catch(() => setCategories([]));
  }, []);

  // Split categories into left (first half) and right (second half), max 10 total (5 each side)
  const maxShow = 10;
  const capped = categories.slice(0, maxShow);
  const midpoint = Math.ceil(capped.length / 2);
  const leftCategories = capped.slice(0, midpoint);
  const rightCategories = capped.slice(midpoint);

  return (
    <section className="bg-[#FAFAF5] py-20 overflow-hidden">
      <div className="mx-auto max-w-[1300px] px-6 text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mx-auto max-w-[900px] text-[36px] md:text-[42px] font-bold leading-[1.2] text-[#243A24] tracking-tight mb-4">
            Search for Trades or Post Your Job,
            <br />
            Compare Quotes, and Hire with Confidence
          </h2>
          <p className="text-[18px] font-medium text-[#6E9625] mb-16">
            All in One Place, Completely Free.
          </p>
        </motion.div>

        {/* Map + Categories Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="relative flex items-center justify-center gap-6"
        >
          {/* Left Categories */}
          <div className="hidden md:flex flex-col gap-3 min-w-[190px]">
            {leftCategories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                onClick={() => router.push(`/directory-listing/search?categoryId=${cat.id}`)}
                className="flex items-center gap-2.5 bg-white border border-[#E8EDE8] rounded-full px-4 py-2.5 shadow-sm hover:shadow-md hover:border-[#6E9625]/40 transition-all cursor-pointer group"
              >
                <span className="w-2 h-2 rounded-full bg-[#6E9625] flex-shrink-0 group-hover:scale-125 transition-transform" />
                <span className="text-[14px] font-medium text-[#243A24] whitespace-nowrap">{cat.name}</span>
              </motion.div>
            ))}
          </div>

          {/* Center Map */}
          <div className="relative flex-shrink-0 w-full max-w-[320px] md:max-w-[380px]">
            <Image
              src="/mapimage.jpg"
              alt="Portugal Map with Trades"
              width={380}
              height={500}
              unoptimized
              className="object-contain w-full"
              priority
            />
          </div>

          {/* Right Categories */}
          <div className="hidden md:flex flex-col gap-3 min-w-[190px]">
            {rightCategories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                onClick={() => router.push(`/directory-listing/search?categoryId=${cat.id}`)}
                className="flex items-center gap-2.5 bg-white border border-[#E8EDE8] rounded-full px-4 py-2.5 shadow-sm hover:shadow-md hover:border-[#6E9625]/40 transition-all cursor-pointer group"
              >
                <span className="w-2 h-2 rounded-full bg-[#6E9625] flex-shrink-0 group-hover:scale-125 transition-transform" />
                <span className="text-[14px] font-medium text-[#243A24] whitespace-nowrap">{cat.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mobile categories (shown below map on small screens) */}
        <div className="flex md:hidden flex-wrap justify-center gap-2 mt-6">
          {capped.map((cat) => (
            <div
              key={cat.id}
              onClick={() => router.push(`/directory-listing/search?categoryId=${cat.id}`)}
              className="flex items-center gap-2 bg-white border border-[#E8EDE8] rounded-full px-3 py-2 shadow-sm cursor-pointer hover:shadow-md transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-[#6E9625] flex-shrink-0" />
              <span className="text-[13px] font-medium text-[#243A24]">{cat.name}</span>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mt-16 flex flex-col items-center"
        >
          <Link href="/post-job" className="flex items-center gap-3 bg-[#243A24] text-white px-8 py-4 rounded-[14px] text-[17px] font-bold shadow-xl shadow-[#243A24]/20 hover:bg-[#1a2e1a] transition-all mb-10">
            <FiPlusCircle size={22} className="text-[#FFFFFF]" />
            Post a Job
            <FiArrowRight size={20} className="ml-2 text-[#FFFFFF]" />
          </Link>

          <h3 className="text-[36px] md:text-[48px] font-bold text-[#243A24] tracking-tight">
            Let the <span className="text-[#6E9625]">right</span> tradespeople<br />come to you.
          </h3>
        </motion.div>

        {/* Bottom Feature Box */}
        <div className="mt-20 mx-auto max-w-[1352px] bg-[#F1F7E8] rounded-[56px] p-8 md:p-12 border border-[#6E96251A]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center gap-4 text-left"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <FiCheckCircle className="text-[#84cc16]" size={18} />
                </div>
                <p className="text-[18px] font-bold text-[#243A24] leading-tight">
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
