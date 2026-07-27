"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { authApi } from "@/app/api/authApi";
import { Star, MapPin, Wrench, Search, ChevronDown, BookmarkX, Bookmark } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.tugatraders.server24.in";

function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/logo.png";
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
  skillServices?: string[];
  subCategories?: string[];
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
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

function TraderCard({ trader }: { trader: SavedTrader }) {
  const [imgError, setImgError] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
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
      setIsSaved(!isSaved);
    } catch (err) {
      console.error("Failed to toggle save", err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#F0EDE8] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col relative">
      <button
        onClick={handleToggleSave}
        disabled={isToggling}
        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-[10px] bg-[#F8F9F5] flex items-center justify-center hover:bg-[#F0EDE8] transition-colors disabled:opacity-50"
      >
        <Bookmark size={18} className={isSaved ? "text-[#1C2C1C] fill-[#1C2C1C]" : "text-[#1C2C1C]"} />
      </button>

      {/* Avatar */}
      <div className="relative w-14 h-14 mx-6 mt-6 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-[#F0EDE8]">
        <Image
          src={src}
          alt={trader.fullName || trader.companyName || "Trader profile image"}
          fill
          className={imgError ? "object-contain p-2 opacity-60" : "object-cover"}
          unoptimized
          onError={() => setImgError(true)}
        />
      </div>

      <div className="px-6 py-4 flex flex-col gap-2 flex-1">
        {/* Name & verified */}
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-bold text-[#1C2C1C] truncate">{trader.companyName || trader.fullName}</h3>
          {trader.isVerified && (
            <svg className="w-4 h-4 text-[#6E9625] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <StarRating rating={trader.ratingAvg ?? 0} />
          <span className="text-[12px] font-bold text-[#1C2C1C]">{(trader.ratingAvg ?? 0).toFixed(1)}</span>
          <span className="text-[12px] text-[#1C2C1C]/50">({trader.reviewCount ?? 0} reviews)</span>
        </div>

        {/* Location */}
        {trader.location && (
          <div className="flex items-center gap-1.5 text-[12px] text-[#1C2C1C]/60">
            <MapPin size={13} className="text-[#1C2C1C]/40 flex-shrink-0" />
            <span className="truncate">{trader.location}</span>
          </div>
        )}

        {/* All Skills / Categories */}
        {allSkills.length > 0 && (
          <div className="flex items-center gap-1.5 text-[12px] text-[#1C2C1C]/60">
            <Wrench size={13} className="text-[#1C2C1C]/40 flex-shrink-0" />
            <span className="truncate">{allSkills.join(", ")}</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-6 pb-6">
        <Link
          href={`/customer-dashboard/trader-profile/${trader.id}`}
          className="block w-full text-center py-2.5 rounded-xl bg-[#1C2C1C] text-white text-[13px] font-bold hover:bg-[#121E12] transition-colors"
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

  const sortLabel = {
    recent: "Recently Added",
    rating: "Highest Rated",
    reviews: "Most Reviews",
  }[sort];

  const filtered = useMemo(() => {
    let list = [...traders];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.fullName?.toLowerCase().includes(q) ||
          t.companyName?.toLowerCase().includes(q)
      );
    }
    if (sort === "rating") list.sort((a, b) => b.ratingAvg - a.ratingAvg);
    else if (sort === "reviews") list.sort((a, b) => b.reviewCount - a.reviewCount);
    return list;
  }, [traders, search, sort]);

  return (
    <main className="min-h-screen bg-[#F8F9F5] px-4 sm:px-8 lg:px-12 py-10">
      <div className="max-w-[1200px] mx-auto">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-[#1C2C1C] mb-1" style={{ fontFamily: "var(--font-bricolage), sans-serif" }}>
            Saved Traders
          </h1>
          <p className="text-[14px] text-[#1C2C1C]/50 font-medium">
            Manage and contact your favorite service providers.
          </p>
        </div>

        {/* Search & Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1C2C1C]/40" />
            <input
              type="text"
              placeholder="Search saved traders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5E5E5] bg-white text-[14px] outline-none focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625] transition-all"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSort((s) => !s)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#E5E5E5] bg-white text-[14px] font-semibold text-[#1C2C1C] hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Sort by: {sortLabel}
              <ChevronDown size={16} className={`transition-transform ${showSort ? "rotate-180" : ""}`} />
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[#E5E5E5] rounded-xl shadow-lg py-2 z-20">
                {(["recent", "rating", "reviews"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setSort(opt); setShowSort(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[13px] font-semibold hover:bg-gray-50 transition-colors ${sort === opt ? "text-[#6E9625]" : "text-[#1C2C1C]"}`}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#F0EDE8] h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-full bg-[#F0EDE8] flex items-center justify-center">
              <BookmarkX size={36} className="text-[#1C2C1C]/30" />
            </div>
            <h2 className="text-[20px] font-bold text-[#1C2C1C]">
              {search ? "No traders found" : "No saved traders yet"}
            </h2>
            <p className="text-[14px] text-[#1C2C1C]/50 text-center max-w-sm">
              {search
                ? "Try a different search term."
                : "Browse the directory and click the bookmark icon to save traders you like."}
            </p>
            {!search && (
              <Link
                href="/"
                className="mt-2 px-6 py-3 bg-[#1C2C1C] text-white rounded-xl font-bold text-[14px] hover:bg-[#121E12] transition-colors"
              >
                Back To Dashboard
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((trader) => (
              <TraderCard key={trader.id} trader={trader} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
