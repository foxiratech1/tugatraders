"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ChevronDown, Hammer, Key } from "lucide-react";
import { FaScrewdriverWrench, FaLocationDot } from "react-icons/fa6";
import { authApi } from "@/app/api/authApi";
import PlacesAutocompleteInput from "@/components/common/PlacesAutocompleteInput";
import { useAuth } from "@/hooks/useAuth";

// Default fallback categories if API is loading or empty
const FALLBACK_CATEGORIES = [
  { id: "plumber", name: "Plumber" },
  { id: "electrician", name: "Electrician" },
  { id: "painter", name: "Painter & Decorator" },
  { id: "carpenter", name: "Carpenter" },
  { id: "builder", name: "Builder & Masonry" },
  { id: "hvac", name: "HVAC & Air Conditioning" },
  { id: "roofer", name: "Roofer" },
  { id: "handyman", name: "Handyman" },
  { id: "gardener", name: "Gardener & Landscaper" },
  { id: "cleaner", name: "Cleaning Services" },
];

const TrustCheckmark = () => (
  <svg
    className="w-5 h-5 text-[#183B22] shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M7.5 12L10.5 15L16.5 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Hero() {
  const router = useRouter();
  const { role } = useAuth();
  const isTrader = role === "trader";

  // Search state
  const [categories, setCategories] = useState<any[]>([]);
  const [skillServices, setSkillServices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  // Dropdown open states
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isServiceOpen, setIsServiceOpen] = useState(false);

  const categoryRef = useRef<HTMLDivElement>(null);
  const serviceRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (serviceRef.current && !serviceRef.current.contains(event.target as Node)) {
        setIsServiceOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await authApi.getCategories();
        const cats = Array.isArray(res) ? res : res?.data || res?.categories || [];
        if (cats.length > 0) {
          setCategories([...cats].sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "")));
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }
      } catch (err) {
        console.error("Failed to load categories in Hero", err);
        setCategories(FALLBACK_CATEGORIES);
      }
    };
    fetchCategories();
  }, []);

  // Fetch skills when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setSkillServices([]);
      setSelectedSkill("");
      return;
    }
    const fetchSkills = async () => {
      try {
        const res = await authApi.getSkillServices(selectedCategory);
        const skills = Array.isArray(res) ? res : res?.data || res?.services || [];
        setSkillServices([...skills].sort((a: any, b: any) => (a.name || "").localeCompare(b.name || "")));
        setSelectedSkill("");
      } catch (err) {
        console.error("Failed to load skills in Hero", err);
        setSkillServices([]);
      }
    };
    fetchSkills();
  }, [selectedCategory]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCategory) params.append("categoryId", selectedCategory);
    if (selectedSkill) params.append("skillService", selectedSkill);
    if (location.trim()) params.append("location", location.trim());

    const queryString = params.toString();
    router.push(`/directory-listing/search${queryString ? `?${queryString}` : ""}`);
  };

  const selectedCategoryObj = categories.find((c) => (c.id || c._id) === selectedCategory);
  const selectedSkillObj = skillServices.find((s) => (s.id || s._id) === selectedSkill);

  return (
    <section className="relative z-20 w-full min-h-screen bg-white flex flex-col justify-between pt-16 sm:pt-20 lg:pt-[76px] pb-0 overflow-x-clip">
      {/* TOP ROW: Content on Left & Image on Right */}
      <div className="w-full flex-1 flex items-start px-4 sm:px-6 lg:px-8 xl:px-12 pt-1 sm:pt-2 lg:pt-3 pb-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center w-full relative">

          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 xl:col-span-5 flex flex-col items-start text-left z-20 relative pt-1 sm:pt-2"
          >
            {/* HEADLINE */}
            <h1
              className="text-[32px] sm:text-[38px] md:text-[44px] lg:text-[46px] xl:text-[48px] 2xl:text-[54px] font-black text-[#143118] tracking-tight leading-[1.12] mb-2.5 sm:mb-3"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              <span className="inline-block sm:whitespace-nowrap">
                Find Trusted{" "}
                <span className="relative inline-block text-[#6E9625] px-2 py-0.5 rounded-lg bg-[#F0F5E6]">
                  Tradespeople
                </span>
              </span>
              <br />
              <span>Across Portugal</span>
            </h1>

            {/* SUBTITLE */}
            <p className={`text-[14.5px] sm:text-[15.5px] text-gray-700 font-medium leading-relaxed ${isTrader ? "mb-5" : "mb-4 sm:mb-5"} max-w-[460px]`}>
              Post your job, receive{" "}
              <span className="font-semibold">responses </span> and choose the professional that&apos;s right for you.
            </p>

            {/* CTA BUTTONS */}
            {!isTrader && (
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                <Link
                  href="/directory-listing/search"
                  className="inline-flex items-center justify-center rounded-[10px] bg-[#14341B] hover:bg-[#0E2613] px-6 sm:px-7 py-2.5 sm:py-3 text-[12.5px] sm:text-[13.5px] font-bold text-white uppercase tracking-wider transition-all shadow-xs hover:shadow cursor-pointer"
                >
                  FIND A TRADESPERSON
                </Link>
                <Link
                  href="/post-job"
                  className="inline-flex items-center justify-center rounded-[10px] bg-[#789E2D] hover:bg-[#668824] px-6 sm:px-7 py-2.5 sm:py-3 text-[12.5px] sm:text-[13.5px] font-bold text-white uppercase tracking-wider transition-all shadow-xs hover:shadow cursor-pointer"
                >
                  POST YOUR JOB - FREE
                </Link>
              </div>
            )}

            {/* TRUST BADGES */}
            <div className="flex flex-row items-center gap-3.5 sm:gap-5 whitespace-nowrap overflow-x-auto no-scrollbar mb-2 lg:mb-4 py-0.5">
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <TrustCheckmark />
                <span className="text-[12px] sm:text-[13px] font-bold text-[#183B22]">
                  Vetted Professionals
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <TrustCheckmark />
                <span className="text-[12px] sm:text-[13px] font-bold text-[#183B22]">
                  Local Tradespeople
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <TrustCheckmark />
                <span className="text-[12px] sm:text-[13px] font-bold text-[#183B22]">
                  Customer Reviews
                </span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT HERO IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-7 xl:col-span-7 relative w-full h-[240px] xs:h-[280px] sm:h-[340px] md:h-[400px] lg:h-[480px] xl:h-[520px] 2xl:h-[600px] max-h-[calc(100vh-230px)] z-10 flex items-start justify-center"
          >
            {/* Ambient soft blur feather glow around image matching the light green background color */}
            <div className="absolute -inset-4 sm:-inset-6 lg:-inset-8 -z-10 rounded-[40px] bg-[#F5F9F2] filter blur-xl sm:blur-2xl pointer-events-none opacity-90" />
            <div className="absolute -inset-2 sm:-inset-4 -z-10 rounded-3xl bg-white/70 filter blur-lg pointer-events-none" />

            {/* Image container with all-side radial mask and smooth directional fades */}
            <div
              className="relative w-full h-full overflow-hidden"
              style={{
                WebkitMaskImage:
                  "radial-gradient(ellipse 94% 90% at 55% 50%, black 55%, rgba(0,0,0,0.85) 75%, rgba(0,0,0,0.3) 90%, transparent 100%)",
                maskImage:
                  "radial-gradient(ellipse 94% 90% at 55% 50%, black 55%, rgba(0,0,0,0.85) 75%, rgba(0,0,0,0.3) 90%, transparent 100%)",
              }}
            >
              <Image
                src="/NewHomepage.png"
                alt="Tradespeople working across Portugal"
                fill
                priority
                unoptimized
                className="object-cover object-[center_20%] sm:object-[center_top]"
              />

              {/* All-side ambient blending gradients */}
              {/* Left edge blur fade */}
              <div className="absolute inset-y-0 left-0 w-16 sm:w-24 md:w-32 lg:w-44 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-20" />
              {/* Right edge blur fade */}
              <div className="absolute inset-y-0 right-0 w-10 sm:w-16 md:w-24 lg:w-32 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-20" />
              {/* Top edge blur fade */}
              <div className="absolute inset-x-0 top-0 h-8 sm:h-12 md:h-16 lg:h-20 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-20" />
              {/* Bottom edge blur fade into the light green background */}
              <div className="absolute inset-x-0 bottom-0 h-10 sm:h-16 md:h-20 lg:h-28 bg-gradient-to-t from-[#F5F9F2] via-[#F5F9F2]/70 to-transparent pointer-events-none z-20" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* BOTTOM: SEARCH SECTION WITH VERY LIGHT GREEN BG */}
      {!isTrader && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full bg-[#F5F9F2] pt-4 sm:pt-5 lg:pt-5 pb-5 sm:pb-6 lg:pb-6 px-4 sm:px-6 lg:px-8 xl:px-12 relative z-30 shadow-[0_-10px_24px_rgba(245,249,242,0.9)]"
        >
          {/* Subtle blurred feather gradient at the top boundary */}
          <div className="absolute -top-4 inset-x-0 h-5 bg-gradient-to-t from-[#F5F9F2] to-transparent pointer-events-none filter blur-[2px]" />

          <div className="w-full">
            {/* SEARCH HEADING */}
            <h2
              className="text-[18px] sm:text-[20px] lg:text-[21px] font-extrabold text-[#183B22] mb-2 sm:mb-2.5 text-left"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              What do you need help with?
            </h2>

            {/* SEARCH BAR CONTAINER */}
            <form
              onSubmit={handleSearch}
              className="w-full bg-white rounded-[20px] sm:rounded-[24px] border border-gray-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.08)] p-2 sm:p-2.5 transition-all relative z-30"
            >
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 lg:gap-0 relative">

                {/* CATEGORY DROPDOWN */}
                <div
                  ref={categoryRef}
                  className={`relative flex-1 flex items-center justify-start gap-3.5 px-4 lg:px-5 py-3 lg:py-3.5 cursor-pointer rounded-[14px] hover:bg-[#F9FAF8] transition-colors ${isCategoryOpen ? "z-50" : "z-20"
                    }`}
                  onClick={() => {
                    setIsCategoryOpen(!isCategoryOpen);
                    setIsServiceOpen(false);
                  }}
                >
                  <Hammer className="text-gray-600 shrink-0 w-5 h-5" />
                  <div className="text-left min-w-0 flex-1">
                    <span className="block text-[10px] lg:text-[11px] text-[#9CA3AF] uppercase font-bold tracking-wider mb-0.5">
                      CATEGORY
                    </span>
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="block w-full text-[14px] lg:text-[15px] font-bold text-[#183B22] truncate">
                        {selectedCategoryObj ? selectedCategoryObj.name : "All Trades"}
                      </span>
                      <ChevronDown
                        size={15}
                        className={`text-gray-400 transition-transform ${isCategoryOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>

                  {/* CATEGORY POPUP */}
                  {isCategoryOpen && (
                    <div className="absolute top-[calc(100%+8px)] left-0 right-0 lg:left-0 lg:right-auto lg:w-[320px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-gray-200 z-50 max-h-[340px] overflow-y-auto py-2 text-left [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                      <div
                        className={`px-5 py-3 hover:bg-[#F4F7F1] text-[14px] cursor-pointer transition-colors ${!selectedCategory ? "bg-[#F4F7F1] text-[#708A42] font-bold" : "text-gray-700 font-medium"
                          }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategory("");
                          setIsCategoryOpen(false);
                        }}
                      >
                        All Trades
                      </div>
                      {categories.map((cat: any) => {
                        const id = cat.id || cat._id;
                        const isSelected = selectedCategory === id;
                        return (
                          <div
                            key={id}
                            className={`px-5 py-3 hover:bg-[#F4F7F1] text-[14px] cursor-pointer transition-colors flex items-center justify-between ${isSelected ? "bg-[#F4F7F1] text-[#708A42] font-bold" : "text-gray-700 font-medium"
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCategory(id);
                              setIsCategoryOpen(false);
                            }}
                          >
                            <span className="truncate">{cat.name}</span>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-[#708A42] shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* VERTICAL DIVIDER */}
                <div className="hidden lg:block w-[1px] h-9 bg-gray-200" />

                {/* SERVICE DROPDOWN */}
                <div
                  ref={serviceRef}
                  className={`relative flex-1 flex items-center justify-start gap-3.5 px-4 lg:px-5 py-3 lg:py-3.5 cursor-pointer rounded-[14px] hover:bg-[#F9FAF8] transition-colors ${isServiceOpen ? "z-50" : "z-10"
                    }`}
                  onClick={() => {
                    setIsServiceOpen(!isServiceOpen);
                    setIsCategoryOpen(false);
                  }}
                >
                  <FaScrewdriverWrench className="text-gray-400 shrink-0 w-5 h-5" />
                  <div className="text-left min-w-0 flex-1">
                    <span className="block text-[10px] lg:text-[11px] text-[#9CA3AF] uppercase font-bold tracking-wider mb-0.5">
                      SERVICE
                    </span>
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        className={`block w-full text-[14px] lg:text-[15px] font-bold truncate ${selectedSkillObj ? "text-[#183B22]" : "text-gray-400"
                          }`}
                      >
                        {selectedSkillObj ? selectedSkillObj.name : "Select Service"}
                      </span>
                      <ChevronDown
                        size={15}
                        className={`text-gray-400 transition-transform ${isServiceOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>

                  {/* SERVICE POPUP */}
                  {isServiceOpen && (
                    <div className="absolute top-[calc(100%+8px)] left-0 right-0 lg:left-0 lg:right-auto lg:w-[320px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-gray-200 z-50 max-h-[340px] overflow-y-auto py-2 text-left [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                      <div
                        className={`px-5 py-3 hover:bg-[#F4F7F1] text-[14px] cursor-pointer transition-colors ${!selectedSkill ? "bg-[#F4F7F1] text-[#708A42] font-bold" : "text-gray-700 font-medium"
                          }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSkill("");
                          setIsServiceOpen(false);
                        }}
                      >
                        Select Service (All)
                      </div>
                      {skillServices.length > 0 ? (
                        skillServices.map((svc: any) => {
                          const id = svc.id || svc._id;
                          const isSelected = selectedSkill === id;
                          return (
                            <div
                              key={id}
                              className={`px-5 py-3 hover:bg-[#F4F7F1] text-[14px] cursor-pointer transition-colors flex items-center justify-between ${isSelected ? "bg-[#F4F7F1] text-[#708A42] font-bold" : "text-gray-700 font-medium"
                                }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSkill(id);
                                setIsServiceOpen(false);
                              }}
                            >
                              <span className="truncate">{svc.name}</span>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-[#708A42] shrink-0" />}
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-5 py-4 text-xs text-gray-500 font-medium text-center">
                          {selectedCategory
                            ? "No specific sub-services found"
                            : "Select a Category first to view services"}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* VERTICAL DIVIDER */}
                <div className="hidden lg:block w-[1px] h-9 bg-gray-200" />

                {/* LOCATION INPUT */}
                <div className="flex-1 flex items-center justify-start gap-3.5 px-4 lg:px-5 py-3 lg:py-3.5 min-w-0">
                  <FaLocationDot className="text-gray-700 shrink-0 w-5 h-5" />
                  <div className="text-left min-w-0 flex-1">
                    <label
                      htmlFor="hero-location-input"
                      className="block text-[10px] lg:text-[11px] text-[#9CA3AF] uppercase font-bold tracking-wider mb-0.5 cursor-pointer"
                    >
                      LOCATION
                    </label>
                    <PlacesAutocompleteInput
                      id="hero-location-input"
                      placeholder="Postcode/City"
                      value={location}
                      onChange={setLocation}
                      onPlaceSelect={(place) => {
                        if (place?.formattedAddress) {
                          setLocation(place.formattedAddress);
                        }
                      }}
                      className="w-full"
                      inputClassName="block w-full text-[14px] lg:text-[15px] font-bold text-[#183B22] placeholder:text-gray-400 placeholder:font-bold bg-transparent outline-none truncate"
                    />
                  </div>
                </div>

                {/* SEARCH TRADER BUTTON */}
                <button
                  type="submit"
                  className="bg-[#183B22] hover:bg-[#112918] text-white px-7 sm:px-9 py-3.5 sm:py-4 rounded-[16px] sm:rounded-[18px] flex items-center justify-center gap-2.5 font-bold text-[14px] sm:text-[15px] transition-all cursor-pointer shrink-0 shadow-sm hover:shadow mt-2 lg:mt-0"
                >
                  <Search className="w-4.5 h-4.5 shrink-0 text-white" />
                  <span className="truncate">Search Trader</span>
                </button>

              </div>
            </form>
          </div>
        </motion.div>
      )}
    </section>
  );
}
