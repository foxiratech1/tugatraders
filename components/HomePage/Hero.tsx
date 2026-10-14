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
    <section className="relative z-20 w-full bg-white pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1360px] mx-auto">
        {/* TOP ROW: Content on Left & Image on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 xl:col-span-5 flex flex-col items-start text-left z-20 relative"
          >
            {/* HEADLINE */}
            <h1
              className="text-[28px] sm:text-[34px] md:text-[38px] lg:text-[42px] xl:text-[46px] font-black text-[#143118] tracking-tight leading-[1.12] mb-3 sm:mb-4"
              style={{ fontFamily: "var(--font-bricolage)" }}
            >
              <span className="inline-block sm:whitespace-nowrap">
                Find Trusted <span className="text-[#6E9625]">Tradespeople</span>
              </span>
              <br />
              <span>Across Portugal</span>
            </h1>

            {/* SUBTITLE */}
            <p className="text-[14px] sm:text-[15px] text-gray-700 font-medium leading-relaxed mb-4 sm:mb-5 max-w-[460px]">
              Post your job, receive{" "}

              <span className=" font-semibold">responses </span> and choose the professional that&apos;s right for you.
            </p>

            {/* CTA BUTTONS */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 mb-4 sm:mb-6">
              <Link
                href="/directory-listing/search"
                className="inline-flex items-center justify-center rounded-[8px] bg-[#14341B] hover:bg-[#0E2613] px-5 sm:px-6 py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wider transition-all shadow-xs hover:shadow cursor-pointer"
              >
                FIND A TRADESPERSON
              </Link>
              <Link
                href="/post-job"
                className="inline-flex items-center justify-center rounded-[8px] bg-[#789E2D] hover:bg-[#668824] px-5 sm:px-6 py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wider transition-all shadow-xs hover:shadow cursor-pointer"
              >
                POST YOUR JOB - FREE
              </Link>
            </div>

            {/* TRUST BADGES */}
            <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 whitespace-nowrap">
              <div className="flex items-center gap-1.5 shrink-0">
                <TrustCheckmark />
                <span className="text-[12px] sm:text-[13px] font-bold text-[#183B22]">
                  Vetted Professionals
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <TrustCheckmark />
                <span className="text-[12px] sm:text-[13px] font-bold text-[#183B22]">
                  Local Tradespeople
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
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
            className="lg:col-span-7 xl:col-span-7 relative w-full h-[360px] sm:h-[420px] lg:h-[460px] xl:h-[490px] lg:-ml-8 xl:-ml-12 z-10 flex items-center justify-center"
          >
            {/* Organic curved shape with soft perimeter blend */}
            <div
              className="relative w-full h-full"
              style={{
                WebkitMaskImage:
                  "radial-gradient(ellipse 92% 88% at 60% 50%, black 52%, transparent 96%)",
                maskImage:
                  "radial-gradient(ellipse 92% 88% at 60% 50%, black 52%, transparent 96%)",
              }}
            >
              <Image
                src="/NewHomepage.png"
                alt="Tradespeople working across Portugal"
                fill
                priority
                unoptimized
                className="object-cover object-center"
              />

              {/* Ambient blending gradients to eliminate all square cut-offs */}
              <div className="absolute inset-y-0 left-0 w-20 sm:w-32 bg-gradient-to-r from-white via-white/50 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-14 sm:h-20 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-10 sm:h-14 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-12 sm:w-16 bg-gradient-to-l from-white/40 to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>

        {/* BOTTOM: SEARCH SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 sm:mt-8 lg:mt-10 w-full relative z-30"
        >
          {/* SEARCH HEADING */}
          <h2
            className="text-[17px] sm:text-[19px] lg:text-[20px] font-extrabold text-[#183B22] mb-2 sm:mb-2.5 text-left"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            What do you need help with?
          </h2>

          {/* SEARCH BAR CONTAINER */}
          <form
            onSubmit={handleSearch}
            className="w-full bg-white rounded-[16px] sm:rounded-[20px] border border-gray-300 shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-1.5 sm:p-2 transition-all relative z-30"
          >
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-1.5 lg:gap-0 relative">

              {/* CATEGORY DROPDOWN */}
              <div
                ref={categoryRef}
                className={`relative flex-1 flex items-center justify-start gap-3 px-3.5 lg:px-4 py-2 sm:py-2.5 cursor-pointer rounded-[12px] hover:bg-[#F9FAF8] transition-colors ${isCategoryOpen ? "z-50" : "z-20"
                  }`}
                onClick={() => {
                  setIsCategoryOpen(!isCategoryOpen);
                  setIsServiceOpen(false);
                }}
              >
                <Key className="text-gray-600 shrink-0 w-4.5 h-4.5 rotate-[-45deg]" />
                <div className="text-left min-w-0 flex-1">
                  <span className="block text-[9.5px] lg:text-[10px] text-[#9CA3AF] uppercase font-bold tracking-wider mb-0.5">
                    CATEGORY
                  </span>
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="block w-full text-[13px] lg:text-[14px] font-bold text-[#183B22] truncate">
                      {selectedCategoryObj ? selectedCategoryObj.name : "All Trades"}
                    </span>
                    <ChevronDown
                      size={14}
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
              <div className="hidden lg:block w-[1px] h-7 bg-gray-200" />

              {/* SERVICE DROPDOWN */}
              <div
                ref={serviceRef}
                className={`relative flex-1 flex items-center justify-start gap-3 px-3.5 lg:px-4 py-2 sm:py-2.5 cursor-pointer rounded-[12px] hover:bg-[#F9FAF8] transition-colors ${isServiceOpen ? "z-50" : "z-10"
                  }`}
                onClick={() => {
                  setIsServiceOpen(!isServiceOpen);
                  setIsCategoryOpen(false);
                }}
              >
                <FaScrewdriverWrench className="text-gray-400 shrink-0 w-4.5 h-4.5" />
                <div className="text-left min-w-0 flex-1">
                  <span className="block text-[9.5px] lg:text-[10px] text-[#9CA3AF] uppercase font-bold tracking-wider mb-0.5">
                    SERVICE
                  </span>
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`block w-full text-[13px] lg:text-[14px] font-bold truncate ${selectedSkillObj ? "text-[#183B22]" : "text-gray-400"
                        }`}
                    >
                      {selectedSkillObj ? selectedSkillObj.name : "Select Service"}
                    </span>
                    <ChevronDown
                      size={14}
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
              <div className="hidden lg:block w-[1px] h-7 bg-gray-200" />

              {/* LOCATION INPUT */}
              <div className="flex-1 flex items-center justify-start gap-3 px-3.5 lg:px-4 py-2 sm:py-2.5 min-w-0">
                <FaLocationDot className="text-gray-700 shrink-0 w-4.5 h-4.5" />
                <div className="text-left min-w-0 flex-1">
                  <label
                    htmlFor="hero-location-input"
                    className="block text-[9.5px] lg:text-[10px] text-[#9CA3AF] uppercase font-bold tracking-wider mb-0.5 cursor-pointer"
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
                    inputClassName="block w-full text-[13px] lg:text-[14px] font-bold text-[#183B22] placeholder:text-gray-400 placeholder:font-bold bg-transparent outline-none truncate"
                  />
                </div>
              </div>

              {/* SEARCH TRADER BUTTON */}
              <button
                type="submit"
                className="bg-[#183B22] hover:bg-[#112918] text-white px-5 sm:px-7 py-2.5 sm:py-3 rounded-[12px] sm:rounded-[14px] flex items-center justify-center gap-2 font-bold text-[13px] sm:text-[14px] transition-all cursor-pointer shrink-0 shadow-xs hover:shadow mt-1.5 lg:mt-0"
              >
                <Search className="w-4 h-4 shrink-0 text-white" />
                <span className="truncate">Search Trader</span>
              </button>

            </div>
          </form>
        </motion.div>

      </div>
    </section>
  );
}
