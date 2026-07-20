"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authApi } from "@/app/api/authApi";
import { getAccessToken } from "@/utils/auth";
import {
  Star, MapPin, Phone, Briefcase, Wrench, ShieldCheck,
  Mail, ArrowLeft, CheckCircle, FileText, Check, Info, Image as ImageIcon, X
} from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.tugatraders.server24.in";
function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http")) return path;
  const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  let imagePath = path.startsWith('/') ? path : `/${path}`;
  imagePath = imagePath.replace(/\/\//g, '/');
  return `${baseUrl}${imagePath}`;
}

export default function PublicTraderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const traderId = params.id as string;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!traderId) return;

    async function loadProfile(lat: number, lng: number) {
      try {
        setLoading(true);
        const res = await authApi.getPublicTraderProfileById(traderId, lat, lng);

        // Handle nested data structures gracefully
        const data = res?.data || res;
        setProfile(data);
      } catch (error: any) {
        console.error("Failed to load trader profile", error);
        toast.error("Failed to load professional profile.");
      } finally {
        setLoading(false);
      }
    }

    const defaultLat = 22.5530;
    const defaultLng = 75.7569;

    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          loadProfile(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          loadProfile(defaultLat, defaultLng);
        },
        { timeout: 3000 }
      );
    } else {
      loadProfile(defaultLat, defaultLng);
    }
  }, [traderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#243A24]/20 border-t-[#243A24] rounded-full animate-spin" />
          <p className="text-[#243A24] font-semibold tracking-wide animate-pulse">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
          <ShieldCheck size={48} />
        </div>
        <h2 className="text-2xl font-bold text-[#1C2C1C]">Profile Not Found</h2>
        <p className="text-gray-500 text-center max-w-md">
          The professional you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => router.push("/directory-listing/search")}
          className="flex items-center gap-2 bg-[#243A24] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1C2C1C] transition-colors"
        >
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>
    );
  }

  // Extract variables carefully based on provided JSON structure
  const tp = profile?.profile || {};
  const metrics = profile?.metrics || {};

  const fullName = profile?.fullName || tp?.fullName || "Professional";
  const email = profile?.email;
  const phone = profile?.phone;
  const companyName = tp?.companyName;
  const avatarUrl = getImageUrl(profile?.profileImage || tp?.logo);
  const location = tp?.location || profile?.city || "Location not specified";
  const bio = tp?.about || tp?.bio || "No description provided.";
  const rating = metrics?.averageRating || 0;
  const reviewCount = metrics?.totalReviews || 0;

  const isVerified = tp?.verificationStatus === "APPROVED";
  const isInsured = tp?.insured || false;
  const portfolio = tp?.portfolio || [];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#6E9625]/20 selection:text-[#1C2C1C]">
      {/* ── Navbar Spacer ── */}
      <div className="h-16 lg:h-24" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <button
          onClick={() => router.push("/directory-listing/search")}
          className="flex items-center gap-2 text-gray-500 hover:text-[#243A24] font-medium transition-colors mb-6 lg:mb-10"
        >
          <ArrowLeft size={18} />
          Back to Search Results
        </button>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

          {/* ── Left Sidebar ── */}
          <div className="w-full lg:w-72 flex-shrink-0 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-40 h-40 rounded-full border border-gray-100 overflow-hidden mb-5 bg-gray-50 flex items-center justify-center">
              <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{fullName}</h1>

            {/* Verified Badge */}
            {isVerified && (
              <div className="flex items-center gap-1.5 text-[#243A24] font-semibold text-sm mb-4">
                <div className="w-5 h-5 rounded-full bg-white border border-[#243A24] flex items-center justify-center">
                  <Check size={12} className="text-[#243A24]" strokeWidth={3} />
                </div>
                Vetted Trader
              </div>
            )}

            {/* Rating */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center gap-1.5 text-[#F59E0B] font-bold mb-1">
                <Star size={18} className="fill-current" />
                <span className="text-gray-900">{rating || 'New'}</span>
              </div>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{reviewCount} REVIEWS</span>
            </div>

            {/* Contact info */}
            <div className="w-full text-left space-y-5 mb-10 pl-2">
              {email && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F2F6EC] flex items-center justify-center text-[#6E9625] flex-shrink-0">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-0.5">Email</p>
                    <a href={`mailto:${email}`} className="text-sm font-semibold text-[#6E9625] hover:underline break-all">{email}</a>
                  </div>
                </div>
              )}
              {phone && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F2F6EC] flex items-center justify-center text-[#6E9625] flex-shrink-0">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-0.5">Phone</p>
                    <a href={`tel:${phone}`} className="text-sm font-semibold text-[#6E9625] hover:underline">{phone}</a>
                  </div>
                </div>
              )}
            </div>

            {/* Stats List */}
            <div className="w-full space-y-5 pl-2 text-left">
              <div className="flex flex-col gap-1">
                <span className="text-gray-600 font-medium text-sm">Company:</span>
                <span className="font-semibold text-gray-900">{companyName || '-'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-600 font-medium text-sm">Location:</span>
                <span className="font-semibold text-gray-900">{location || '-'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-600 font-medium text-sm">Jobs Complete:</span>
                <span className="font-semibold text-gray-900">{metrics?.completedJobs || 0}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-600 font-medium text-sm">Response Rate:</span>
                <span className="font-semibold text-gray-900">{metrics?.responseRate ? `${Math.round(metrics.responseRate * 100)}%` : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* ── Right Content ── */}
          <div className="flex-1 flex flex-col pt-2 lg:pl-10">
            {/* Top Vetting Header */}
            <div className="flex flex-wrap items-start justify-between gap-6 mb-8 lg:mb-12 border-b border-gray-100 pb-8">
              <div className="flex flex-wrap items-start gap-8 lg:gap-16">
                {/* Individual Checks */}
                <div className="group relative cursor-pointer">
                  <div className="flex flex-col items-center">
                    {isVerified ? (
                      <Check size={28} className="text-black mb-2" strokeWidth={3} />
                    ) : (
                      <X size={28} className="text-gray-300 mb-2" strokeWidth={3} />
                    )}
                    <span className={`font-extrabold text-[15px] ${isVerified ? 'text-black' : 'text-gray-400'}`}>Individual Checks</span>
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-max max-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-xl rounded-lg p-3 text-sm text-gray-700 border border-gray-100 pointer-events-none z-10">
                    <ul className="list-disc pl-4 space-y-1">
                      <li>{isVerified ? 'Identification verified' : 'Identification pending'}</li>
                    </ul>
                  </div>
                </div>

                {/* Trade Checks */}
                <div className="group relative cursor-pointer">
                  <div className="flex flex-col items-center">
                    {isVerified ? (
                      <Check size={28} className="text-black mb-2" strokeWidth={3} />
                    ) : (
                      <X size={28} className="text-gray-300 mb-2" strokeWidth={3} />
                    )}
                    <span className={`font-extrabold text-[15px] ${isVerified ? 'text-black' : 'text-gray-400'}`}>Trade Checks</span>
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-max max-w-[250px] opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-xl rounded-lg p-3 text-sm text-gray-700 border border-gray-100 pointer-events-none z-10">
                    <ul className="list-disc pl-4 space-y-1">
                      <li>{isVerified ? 'Registered business verified' : 'Business registration pending'}</li>
                      <li>{isVerified ? 'Company trading history checked' : 'Trading history pending'}</li>
                      <li>{isVerified ? 'Customer reviews monitored' : 'Reviews pending'}</li>
                    </ul>
                  </div>
                </div>

                {/* Insured */}
                <div className="group relative cursor-pointer">
                  <div className="flex flex-col items-center">
                    {isInsured ? (
                      <Check size={28} className="text-black mb-2" strokeWidth={3} />
                    ) : (
                      <X size={28} className="text-gray-300 mb-2" strokeWidth={3} />
                    )}
                    <span className={`font-extrabold text-[15px] ${isInsured ? 'text-black' : 'text-gray-400'}`}>Insured</span>
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-max max-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-xl rounded-lg p-3 text-sm text-gray-700 border border-gray-100 pointer-events-none z-10">
                    <ul className="list-disc pl-4 space-y-1">
                      <li>{isInsured ? 'Public liability insurance verified' : 'Insurance pending or not verified'}</li>
                    </ul>
                  </div>
                </div>
              </div>

                <div className="flex items-center gap-2 text-sm text-gray-700 flex-shrink-0">
                   <Info size={20} className="text-gray-400 flex-shrink-0" />
                   <span className="whitespace-nowrap">Learn more about traders <a href="#" className="underline font-semibold">Vetting & badges.</a></span>
                </div>
            </div>

            {/* Light Background Area for Cards */}
            <div className="bg-[#F8F9F5] rounded-[32px] p-6 sm:p-10 flex flex-col gap-6 w-full">

              {/* Services & Expertise */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
                <h3 className="text-[17px] font-bold text-[#1C2C1C] mb-6 flex items-center gap-3">
                  <Wrench className="text-[#6E9625]" size={20} />
                  Services & Expertise
                </h3>

                <div className="flex flex-wrap gap-3">
                  {/* Render Categories */}
                  {tp?.tradeCategories?.map((cat: any, i: number) => (
                    <span key={`cat-${i}`} className="inline-flex items-center bg-[#243A24] text-white px-5 py-2.5 rounded-[10px] text-[13px] font-bold">
                      {typeof cat === 'object' ? cat.name : cat}
                    </span>
                  ))}

                  {/* Render Skills */}
                  {tp?.skillsServices?.map((skill: any, i: number) => (
                    <span key={`skill-${i}`} className="inline-flex items-center bg-[#F2F6EC] text-[#243A24] px-5 py-2.5 rounded-[10px] text-[13px] font-bold">
                      {typeof skill === 'object' ? skill.name : skill}
                    </span>
                  ))}

                  {/* Render Sub Categories */}
                  {tp?.subCategories?.map((sub: any, i: number) => (
                    <span key={`sub-${i}`} className="inline-flex items-center bg-[#F3F4F6] text-gray-700 px-5 py-2.5 rounded-[10px] text-[13px] font-bold">
                      {typeof sub === 'object' ? sub.name : sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* About */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
                <h3 className="text-[17px] font-bold text-[#1C2C1C] mb-6 flex items-center gap-3">
                  <FileText className="text-[#6E9625]" size={20} />
                  About {fullName.split(' ')[0]}
                </h3>
                <div className="text-gray-600 font-medium text-[15px] leading-relaxed whitespace-pre-wrap">
                  {bio}
                </div>
              </div>

              {/* Gallery */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
                <h3 className="text-[17px] font-bold text-[#1C2C1C] mb-6 flex items-center gap-3">
                  <ImageIcon className="text-[#6E9625]" size={20} />
                  Gallery
                </h3>
                {portfolio && portfolio.length > 0 ? (
                  <div className="flex flex-wrap gap-4">
                    {portfolio.map((img: any, i: number) => (
                      <div key={i} className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
                        <img src={getImageUrl(img.url || img)} alt="Gallery Image" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 font-medium text-sm">No image found</p>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

