"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authApi } from "@/app/api/authApi";
import {
  Star, MapPin, Phone, Briefcase, Wrench, ShieldCheck,
  Mail, ArrowLeft, CheckCircle, FileText
} from "lucide-react";
import toast from "react-hot-toast";
import AuthGuard from "@/components/Guards/AuthGuard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.tugatraders.server24.in";
function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http")) return path;
  const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  let imagePath = path.startsWith('/') ? path : `/${path}`;
  imagePath = imagePath.replace(/\/\//g, '/');
  return `${baseUrl}${imagePath}`;
}

export default function CustomerTraderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const traderId = params.id as string;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!traderId) return;

    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await authApi.getTraderProfileById(traderId);

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

    fetchProfile();
  }, [traderId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#F8F9F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#243A24]/20 border-t-[#243A24] rounded-full animate-spin" />
          <p className="text-[#243A24] font-semibold tracking-wide animate-pulse">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[70vh] bg-[#F8F9F5] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
          <ShieldCheck size={48} />
        </div>
        <h2 className="text-2xl font-bold text-[#1C2C1C]">Profile Not Found</h2>
        <p className="text-gray-500 text-center max-w-md">
          The professional you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => router.push("/customer-dashboard/jobs")}
          className="flex items-center gap-2 bg-[#243A24] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1C2C1C] transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Jobs
        </button>
      </div>
    );
  }

  // Extract variables defensively
  const tp = profile?.profile || profile?.traderProfile || profile;
  const user = profile?.user || profile;
  const metrics = profile?.metrics || {};

  const fullName = user?.fullName || tp?.fullName || "Professional";
  const title = tp?.professionalTitle || tp?.title || "Specialist";
  const companyName = tp?.companyName || tp?.businessName;
  const avatarUrl = getImageUrl(user?.profileImage || tp?.logo || tp?.profileImage);
  const location = tp?.location || tp?.workLocation || user?.city || "Location not specified";
  const bio = tp?.about || tp?.bio || tp?.description || "No description provided.";
  const rating = metrics?.averageRating || tp?.ratingAvg || user?.ratingAvg || 0;
  const reviewCount = metrics?.totalReviews || tp?.reviewCount || user?.reviewCount || 0;

  const isVerified = (tp?.verificationStatus === "APPROVED") || tp?.isVerified || user?.isVerified || false;
  const workRadius = tp?.workRadius ? `${tp.workRadius} miles` : null;

  return (
    <div className="bg-[#F8F9F5] font-sans selection:bg-[#6E9625]/20 selection:text-[#1C2C1C] min-h-[calc(100vh-96px)] py-8">
      <main className="max-w-[1320px] mx-auto px-6">

        {/* Back Button */}
        <button
          onClick={() => router.push("/customer-dashboard/jobs")}
          className="flex items-center gap-2 text-gray-500 hover:text-[#243A24] font-medium transition-colors mb-6 lg:mb-8"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Left Sidebar (Overview) ── */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_40px_rgba(36,58,36,0.04)] border border-[#243A240A] flex flex-col items-center text-center relative overflow-hidden">
              {/* Decorative top shape */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#6E9625]/10 to-transparent pointer-events-none" />

              {/* Avatar */}
              <div className="relative w-36 h-36 rounded-full border-4 border-white shadow-lg overflow-hidden mb-5 bg-gray-100 z-10 flex items-center justify-center text-gray-400">
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              </div>

              <h1 className="text-2xl font-extrabold text-[#1C2C1C] tracking-tight mb-1" style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
                {fullName}
              </h1>

              <p className="text-[#6E9625] font-bold text-sm tracking-wide uppercase mb-4">
                {title}
              </p>

              {isVerified && (
                <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-[12px] font-bold tracking-wide uppercase mb-6">
                  <ShieldCheck size={14} className="stroke-[2.5]" />
                  Verified Professional
                </div>
              )}

              {/* Stats Row */}
              <div className="flex items-center justify-center gap-6 w-full pt-6 border-t border-gray-100">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-[#F59E0B]">
                    <Star size={16} className="fill-current" />
                    <span className="font-bold text-[#1C2C1C]">{rating || 'New'}</span>
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mt-1">
                    {reviewCount} Reviews
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-gray-200" />
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-[#6E9625]">
                    <MapPin size={16} />
                    <span className="font-bold text-[#1C2C1C] truncate max-w-[100px]">{location.split(',')[0]}</span>
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mt-1">
                    Location
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Contact & Info */}
            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_40px_rgba(36,58,36,0.04)] border border-[#243A240A]">
              <h3 className="text-[13px] font-extrabold text-[#1C2C1C] tracking-widest uppercase mb-5">At a Glance</h3>
              <div className="flex flex-col gap-4">

                {companyName && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#6E9625]/10 flex items-center justify-center text-[#6E9625] flex-shrink-0">
                      <Briefcase size={14} />
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500 font-medium">Company</p>
                      <p className="text-[14px] font-semibold text-[#1C2C1C]">{companyName}</p>
                      {tp?.companyType && <p className="text-[12px] text-gray-500">{tp.companyType}</p>}
                      {tp?.registrationNumber && <p className="text-[12px] text-gray-400">Reg: {tp.registrationNumber}</p>}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#6E9625]/10 flex items-center justify-center text-[#6E9625] flex-shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-500 font-medium">Service Area</p>
                    <p className="text-[14px] font-semibold text-[#1C2C1C]">
                      {location} {workRadius && <span className="text-gray-400">({workRadius} radius)</span>}
                    </p>
                  </div>
                </div>

                {user?.email && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#6E9625]/10 flex items-center justify-center text-[#6E9625] flex-shrink-0">
                      <Mail size={14} />
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500 font-medium">Email</p>
                      <a href={`mailto:${user.email}`} className="text-[14px] font-semibold text-[#6E9625] hover:underline">
                        {user.email}
                      </a>
                    </div>
                  </div>
                )}

                {user?.phone && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#6E9625]/10 flex items-center justify-center text-[#6E9625] flex-shrink-0">
                      <Phone size={14} />
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500 font-medium">Phone</p>
                      <a href={`tel:${user.phone}`} className="text-[14px] font-semibold text-[#6E9625] hover:underline">
                        {user.phone}
                      </a>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* ── Right Content (Details) ── */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_40px_rgba(36,58,36,0.04)] border border-[#243A240A] flex flex-col items-center text-center">
                <span className="text-3xl font-black text-[#1C2C1C] mb-1">{metrics?.completedJobs || 0}</span>
                <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Completed Jobs</span>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_40px_rgba(36,58,36,0.04)] border border-[#243A240A] flex flex-col items-center text-center">
                <span className="text-3xl font-black text-[#1C2C1C] mb-1">{metrics?.responseRate ? `${Math.round(metrics.responseRate * 100)}%` : 'N/A'}</span>
                <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Response Rate</span>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_40px_rgba(36,58,36,0.04)] border border-[#243A240A] flex flex-col items-center text-center">
                <span className="text-3xl font-black text-[#1C2C1C] mb-1">{metrics?.totalMatchedJobs || 0}</span>
                <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Matched Jobs</span>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_40px_rgba(36,58,36,0.04)] border border-[#243A240A] flex flex-col items-center text-center">
                <span className="text-3xl font-black text-[#6E9625] mb-1">{tp?.insured ? 'Yes' : 'No'}</span>
                <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Fully Insured</span>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-[0_8px_40px_rgba(36,58,36,0.04)] border border-[#243A240A]">
              <h3 className="text-xl font-bold text-[#1C2C1C] mb-6 flex items-center gap-3">
                <FileText className="text-[#6E9625]" size={24} />
                About {fullName.split(' ')[0]}
              </h3>
              <div className="prose prose-sm sm:prose-base prose-green max-w-none text-[#1C2C1C]/70 font-medium leading-relaxed">
                {bio.split('\n').map((paragraph: string, idx: number) => (
                  <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Skills & Services */}
            {((tp?.tradeCategories && tp.tradeCategories.length > 0) || (tp?.skillsServices && tp.skillsServices.length > 0)) && (
              <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-[0_8px_40px_rgba(36,58,36,0.04)] border border-[#243A240A]">
                <h3 className="text-xl font-bold text-[#1C2C1C] mb-6 flex items-center gap-3">
                  <Wrench className="text-[#6E9625]" size={24} />
                  Services & Expertise
                </h3>

                <div className="flex flex-wrap gap-2.5">
                  {/* Render Categories */}
                  {tp?.tradeCategories?.map((cat: any, i: number) => (
                    <span key={`cat-${i}`} className="inline-flex items-center gap-1.5 bg-[#243A24] text-white px-4 py-2 rounded-xl text-[13px] font-bold tracking-wide">
                      {typeof cat === 'object' ? cat.name : cat}
                    </span>
                  ))}

                  {/* Render Skills */}
                  {tp?.skillsServices?.map((skill: any, i: number) => (
                    <span key={`skill-${i}`} className="inline-flex items-center gap-1.5 bg-[#6E9625]/10 text-[#243A24] px-4 py-2 rounded-xl text-[13px] font-bold tracking-wide border border-[#6E9625]/20">
                      {typeof skill === 'object' ? skill.name : skill}
                    </span>
                  ))}
                  
                  {/* Render Sub Categories */}
                  {tp?.subCategories?.map((sub: any, i: number) => (
                    <span key={`sub-${i}`} className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-[13px] font-bold tracking-wide border border-gray-200">
                      {typeof sub === 'object' ? sub.name : sub}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
