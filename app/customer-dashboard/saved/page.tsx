"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { authApi } from "@/app/api/authApi";
import { Star, MapPin, Wrench, Search, ChevronDown, HeartOff, Heart, X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.tugatraders.server24.in";

function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/avt.png";
  if (path.startsWith("http")) return path;

  const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  let imagePath = path.startsWith('/') ? path : `/${path}`;
  imagePath = imagePath.replace(/\/\//g, '/'); // remove any double slashes inside the path

  return `${baseUrl}${imagePath}`;
}

type SavedTrader = {
  id: string;
  fullName: string;
  companyName: string;
  profileImage: string | null;
  logo: string | null;
  ratingAvg: number;
  reviewCount: number;
  workRadius: number;
  isVerified: boolean;
  subscriptionTier: string;
  location?: string;
  skills?: string[];
  tradeCategories?: string[];
  tradeCategoryDetails?: { name: string; image: string | null }[];
  skillServices?: string[];
  subCategories?: string[];
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 flex-shrink-0">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          className={
            i <= Math.round(rating) ? "text-[#F59E0B] fill-[#F59E0B]" : "text-gray-200 fill-gray-200"
          }
        />
      ))}
    </div>
  );
}

function TraderCard({ trader, onRemove }: { trader: SavedTrader; onRemove: (id: string) => void }) {
  const [imgError, setImgError] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const src = imgError ? "/logo.png" : getImageUrl(trader.profileImage || trader.logo);

  const allSkills = [
    ...(trader.tradeCategories || []),
    ...(trader.skillServices || []),
    ...(trader.subCategories || [])
  ].filter(Boolean);

  const handleToggleSave = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await authApi.toggleSaveTrader(trader.id);
      onRemove(trader.id);
    } catch (err) {
      console.error("Failed to toggle save", err);
      setIsToggling(false);
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-[#F0EDE8] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col p-4 relative gap-3">
      <button
        onClick={handleToggleSave}
        disabled={isToggling}
        aria-label="Remove from saved"
        className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-10 hover:opacity-70 transition-opacity disabled:opacity-50 cursor-pointer p-1"
      >
        <Heart size={20} className="text-[#374151] fill-[#374151]" />
      </button>

      {/* Top Row: Avatar + Name/Rating */}
      <div className="flex items-center gap-3 pr-8 min-w-0">
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-[2px] border-gray-100">
          <Image
            src={src}
            alt={trader.fullName || trader.companyName || "Trader profile image"}
            fill
            className={imgError ? "object-contain p-2 opacity-60" : "object-cover"}
            unoptimized
            onError={() => setImgError(true)}
          />
        </div>

        <div className="flex flex-col justify-center min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="text-[14px] sm:text-[15px] font-bold text-[#1C2C1C] truncate">
              {trader.companyName || trader.fullName}
            </h3>
            {trader.isVerified && (
              <svg className="w-3.5 h-3.5 text-[#6E9625] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <StarRating rating={trader.ratingAvg ?? 0} />
            <span className="text-[12px] font-bold text-[#1C2C1C]">{(trader.ratingAvg ?? 0).toFixed(1)}</span>
            <span className="text-[11px] sm:text-[12px] text-[#1C2C1C]/50">({trader.reviewCount ?? 0} reviews)</span>
          </div>
        </div>
      </div>

      {/* Info Rows */}
      <div className="flex flex-col gap-1.5 mt-1 min-w-0">
        {trader.location && (
          <div className="flex items-center gap-1.5 text-[12px] text-[#1C2C1C]/60 min-w-0">
            <MapPin size={13} className="text-[#1C2C1C]/40 flex-shrink-0" />
            <span className="truncate">{trader.location}</span>
          </div>
        )}

        {allSkills.length > 0 && (
          <div className="flex items-center gap-1.5 text-[12px] text-[#1C2C1C]/60 min-w-0">
            <Wrench size={13} className="text-[#1C2C1C]/40 flex-shrink-0" />
            <span className="truncate">{allSkills.join(", ")}</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-auto pt-1">
        <Link
          href={`/customer-dashboard/trader-profile/${trader.id}`}
          className="block w-full text-center py-2.5 rounded-lg sm:rounded-xl bg-[#1C2C1C] text-white text-[13px] font-bold hover:bg-[#121E12] transition-colors cursor-pointer shadow-sm"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

export default function SavedTradersPage() {
  const [traders, setTraders] = useState<SavedTrader[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "rating" | "reviews">("recent");
  const [showSort, setShowSort] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await authApi.getSavedTraders();
        const rawList = Array.isArray(res) ? res : res?.data || [];

        const list: SavedTrader[] = rawList.map((item: any) => {
          const t = item.trader || item;
          const profile = t.traderProfile || item.traderProfile || {};
          const extractNames = (arr: any[]) => Array.isArray(arr) ? arr.map(a => a.name) : [];

          return {
            id: t.id,
            fullName: t.fullName || "",
            companyName: t.companyName || profile.companyName || "",
            profileImage: t.profileImage || profile.profileImage || t.user?.profileImage || t.image || null,
            logo: t.logo || profile.logo || t.user?.logo || t.image || null,
            ratingAvg: t.traderMetrics?.averageRating ?? t.ratingAvg ?? 0,
            reviewCount: t.traderMetrics?.totalReviews ?? t.reviewCount ?? 0,
            workRadius: t.workRadius ?? 0,
            isVerified: t.isVerified ?? false,
            subscriptionTier: t.subscriptionTier ?? "",
            location: profile.location ?? t.location ?? "",
            skills: t.skills ?? [],
            tradeCategories: extractNames(profile.tradeCategoryDetails),
            tradeCategoryDetails: profile.tradeCategoryDetails || [],
            skillServices: extractNames(profile.skillServiceDetails),
            subCategories: extractNames(profile.subCategoryDetails),
          };
        });
        setTraders(list);
      } catch (err) {
        console.error("Failed to fetch saved traders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSort(false);
      }
    }
    if (showSort) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSort]);

  const handleRemoveTrader = (id: string) => {
    setTraders((prev) => prev.filter((t) => t.id !== id));
  };

  const sortLabel = {
    recent: "Recently Added",
    rating: "Highest Rated",
    reviews: "Most Reviews",
  }[sort];

  const filtered = useMemo(() => {
    let list = [...traders];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => {
        const searchableFields = [
          t.fullName,
          t.companyName,
          t.location,
          ...(t.tradeCategories || []),
          ...(t.skillServices || []),
          ...(t.subCategories || []),
          ...(t.skills || [])
        ];
        return searchableFields.some(field => field?.toLowerCase().includes(q));
      });
    }
    if (sort === "rating") list.sort((a, b) => b.ratingAvg - a.ratingAvg);
    else if (sort === "reviews") list.sort((a, b) => b.reviewCount - a.reviewCount);
    return list;
  }, [traders, search, sort]);

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, { traders: SavedTrader[]; image: string | null }> = {};

    filtered.forEach((trader) => {
      const categories = trader.tradeCategoryDetails?.filter(Boolean) || [];

      if (categories.length === 0) {
        if (!groups["Other"]) {
          groups["Other"] = { traders: [], image: null };
        }

        groups["Other"].traders.push(trader);
        return;
      }

      categories.forEach((cat) => {
        if (!groups[cat.name]) {
          groups[cat.name] = { traders: [], image: cat.image || null };
        }

        groups[cat.name].traders.push(trader);
      });
    });

    return Object.entries(groups);
  }, [filtered]);

  return (
    <main className="min-h-screen bg-[#F8F9F5]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">

        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#1C2C1C] mb-1" style={{ fontFamily: "var(--font-bricolage), sans-serif" }}>
            Saved Traders
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[#1C2C1C]/50 font-medium">
            Manage and contact your favorite service providers.
          </p>
        </div>

        {/* Search & Sort bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 sm:mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-[#1C2C1C]/40" />
            <input
              type="text"
              placeholder="Search saved traders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-9 sm:pr-4 py-2.5 sm:py-3 rounded-xl border border-[#E5E5E5] bg-white text-[13px] sm:text-[14px] text-[#1C2C1C] outline-none focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625] transition-all shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setShowSort((s) => !s)}
              className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-[#E5E5E5] bg-white text-[13px] sm:text-[14px] font-semibold text-[#1C2C1C] hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer shadow-sm"
            >
              <span>Sort by: {sortLabel}</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${showSort ? "rotate-180" : ""}`} />
            </button>
            {showSort && (
              <div className="absolute left-0 right-0 sm:left-auto sm:right-0 top-full mt-2 sm:w-52 bg-white border border-[#E5E5E5] rounded-xl shadow-lg py-1.5 z-20">
                {(["recent", "rating", "reviews"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setSort(opt); setShowSort(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[13px] font-semibold hover:bg-gray-50 transition-colors cursor-pointer ${sort === opt ? "text-[#6E9625]" : "text-[#1C2C1C]"}`}
                  >
                    {opt === "recent" ? "Recently Added" : opt === "rating" ? "Highest Rated" : "Most Reviews"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl sm:rounded-2xl border border-[#F0EDE8] h-56 sm:h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 gap-3 sm:gap-4 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F0EDE8] flex items-center justify-center">
              <HeartOff size={32} className="text-[#1C2C1C]/30 sm:w-9 sm:h-9" />
            </div>
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1C2C1C]">
              {search ? "No traders found" : "No saved traders yet"}
            </h2>
            <p className="text-[13px] sm:text-[14px] text-[#1C2C1C]/50 text-center max-w-sm">
              {search
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Browse the directory and click the heart icon to save traders you like."}
            </p>
            {!search && (
              <Link
                href="/customer-dashboard"
                className="mt-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#1C2C1C] text-white rounded-xl font-bold text-[13px] sm:text-[14px] hover:bg-[#121E12] transition-colors cursor-pointer shadow-sm"
              >
                Back To Dashboard
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-8 sm:gap-10">
            {groupedByCategory.map(([category, data]) => (
              <section key={category}>
                <div className="flex items-center gap-2.5 sm:gap-3 mb-3.5 sm:mb-5">
                  <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#E9F3DC] overflow-hidden flex items-center justify-center flex-shrink-0 border border-emerald-100">
                    {data.image ? (
                      <Image
                        src={getImageUrl(data.image)}
                        alt={category}
                        fill
                        className="object-cover p-1.5"
                        unoptimized
                      />
                    ) : (
                      <Wrench size={18} className="text-[#6E9625]" />
                    )}
                  </div>

                  <div>
                    <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1C2C1C] leading-tight">
                      {category}
                    </h2>

                    <p className="text-[11px] sm:text-[12px] text-[#1C2C1C]/50 mt-0.5">
                      {data.traders.length}{" "}
                      {data.traders.length === 1 ? "trader" : "traders"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
                  {data.traders.map((trader) => (
                    <TraderCard
                      key={`${category}-${trader.id}`}
                      trader={trader}
                      onRemove={handleRemoveTrader}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

