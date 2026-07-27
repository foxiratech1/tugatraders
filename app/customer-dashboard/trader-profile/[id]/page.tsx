"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authApi } from "@/app/api/authApi";
import {
  Star, MapPin, Phone, Briefcase, Wrench, ShieldCheck,
  Mail, ArrowLeft, CheckCircle, FileText, Heart, MessageSquare, Image as ImageIcon,
  ThumbsUp, Award,
  CheckCircle2,
  MessageCircle,
  HeartIcon,
  Check
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import VettingModal from "@/components/modal/VettingModal";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
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
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isVettingModalOpen, setIsVettingModalOpen] = useState(false);

  useEffect(() => {
    if (!traderId) return;

    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await authApi.getTraderProfileById(traderId);

        // Handle nested data structures gracefully
        const data = res?.data || res;
        setProfile(data);
        setIsSaved(data?.isSaved || false);
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
      <div className="min-h-[70vh] bg-[#F9FAFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#243A24]/20 border-t-[#243A24] rounded-full animate-spin" />
          <p className="text-[#243A24] font-semibold tracking-wide animate-pulse">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[70vh] bg-[#F9FAFB] flex flex-col items-center justify-center gap-6 px-4">
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

  const handleSaveTrader = async () => {
    try {
      setIsSaving(true);
      await authApi.toggleSaveTrader(traderId);
      setIsSaved((prev) => !prev);
      toast.success(isSaved ? "Trader removed from saved." : "Trader saved successfully.");
    } catch (error) {
      console.error("Failed to toggle save status", error);
      toast.error("Failed to update saved status.");
    } finally {
      setIsSaving(false);
    }
  };

  const user = profile?.user || profile || {};
  const metrics = profile?.metrics || {};

  const fullName = user?.fullName || tp?.fullName || "Professional";
  const companyName = tp?.companyName || tp?.businessName;
  const avatarUrl = getImageUrl(user?.profileImage || tp?.logo || tp?.profileImage);
  const location = tp?.location || tp?.workLocation || user?.city || user?.location || "Location not specified";
  const bio = tp?.about || tp?.aboutUs || tp?.bio || tp?.description || "No description provided.";

  // Rating logic
  const rating = metrics?.averageRating || tp?.ratingAvg || user?.ratingAvg || 0;
  const reviewCount = metrics?.totalReviews || tp?.reviewCount || user?.reviewCount || 0;

  const jobsCompleted = metrics?.completedJobs || tp?.jobsCompleted || 0;
  const responseRate = metrics?.responseRate ? `${Math.round(metrics.responseRate * 100)}%` : 'N/A';

  const isVerified = (tp?.verificationStatus === "APPROVED") || tp?.isVerified || user?.isVerified || false;

  const email = user?.email || "Email not specified";
  const phone = user?.phone || "Phone not specified";

  const portfolio = tp?.portfolio || [];
  const featuredImage = portfolio.length > 0 ? getImageUrl(portfolio[0].fileUrl) : "/placeholder.png";

  return (
    <div className="bg-[#F9FAFB] font-sans selection:bg-[#6E9625]/20 selection:text-[#1C2C1C] min-h-[calc(100vh-96px)] py-8 pb-16">
      <main className="max-w-[1440px] mx-auto px-6">

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[#243A24] text-[14px] font-semibold transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">

          {/* ── Left Sidebar (Overview) ── */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            <div className="p-8 flex flex-col items-center relative">
              {/* Avatar */}
              <div className="relative w-[130px] h-[130px] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
                <Image src={avatarUrl} alt={fullName} fill className="object-cover" unoptimized />
                {/* <div className="absolute bottom-0 w-full h-8 bg-[#1A5CBA] flex items-center justify-center bg-opacity-95">
                  <span className="text-white text-[11px] font-bold tracking-widest flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-white flex items-center justify-center">
                      <span className="w-1 h-1 rounded-full bg-[#1A5CBA]" />
                    </span>
                    PIMIO
                  </span>
                </div> */}
              </div>

              <h1 className="text-[22px] font-extrabold text-[#1C2C1C] tracking-tight mb-1 text-center">
                {fullName}
              </h1>

              {isVerified && (
                <div className="flex items-center gap-1.5 text-[#1C2C1C] font-semibold text-[13px] mb-4">
                  <CheckCircle2 size={16} className="text-[#1C2C1C]" />
                  Vetted Trader
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-1.5 mb-6">
                <div className="flex text-[#F59E0B]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < Math.max(1, rating) ? "fill-current" : "text-gray-300 fill-gray-300"} />
                  ))}
                </div>
                <span className="text-[#6B7280] text-[13px] font-medium ml-1">
                  <span className="text-[#1C2C1C] font-bold">{rating.toFixed(1)}</span> ({reviewCount} reviews)
                </span>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-3 mb-8">
                <button 
                  onClick={() => router.push("/customer-dashboard/inbox")}
                  className="w-full h-[46px] bg-[#1C2C1C] text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#2A412A] transition-colors cursor-pointer"
                >
                  <MessageCircle size={16} />
                  Send Message
                </button>
                <button 
                  onClick={handleSaveTrader}
                  disabled={isSaving}
                  className={`w-full h-[46px] rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-colors ${
                    isSaved 
                      ? "bg-[#E5F0DA] text-[#6E9625] hover:bg-[#D4E6C5]" 
                      : "bg-[#F4F7F1] text-[#1C2C1C] hover:bg-[#E5F0DA] cursor-pointer"
                  }`}
                >
                  <HeartIcon size={16} className={isSaved ? "fill-[#6E9625]" : ""} />
                  {isSaved ? "Saved" : "Save Trader"}
                </button>
              </div>

              {/* Contact Info */}
              <div className="w-full flex flex-col gap-5 border-t border-gray-100 pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#F4F7F1] flex items-center justify-center text-[#6E9625] flex-shrink-0">
                    <Mail size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Email</span>
                    <a href={`mailto:${email}`} className="text-[14px] font-bold text-[#6E9625] hover:underline break-all">
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#F4F7F1] flex items-center justify-center text-[#6E9625] flex-shrink-0">
                    <Phone size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Phone</span>
                    <a href={`tel:${phone}`} className="text-[14px] font-bold text-[#6E9625] hover:underline">
                      {phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Meta Info */}
              <div className="w-full flex flex-col gap-4 border-t border-gray-100 pt-6 mt-6">
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Company</span>
                  <span className="text-[14px] font-bold text-[#1C2C1C]">{companyName || "Independent"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Location</span>
                  <span className="text-[14px] font-bold text-[#1C2C1C]">{location}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Jobs Completed</span>
                  <span className="text-[14px] font-bold text-[#1C2C1C]">{jobsCompleted}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Response Rate</span>
                  <span className="text-[14px] font-bold text-[#1C2C1C]">{responseRate}</span>
                </div>
              </div>

            </div>
          </div>

          {/* ── Right Content ── */}
          <div className="flex flex-col gap-6">

            {/* Vetting Checks Bar */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 flex flex-wrap lg:flex-nowrap items-center justify-between gap-6">
              <div className="flex flex-wrap gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#6E9625] flex items-center justify-center text-white">
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-extrabold text-[#1C2C1C]">Individual Checks</span>
                    <span className="text-[12px] text-gray-500 font-medium">Verified</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#6E9625] flex items-center justify-center text-white">
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-extrabold text-[#1C2C1C]">Trade Checks</span>
                    <span className="text-[12px] text-gray-500 font-medium">Verified</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck size={28} className="text-[#6E9625]" strokeWidth={2} />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-extrabold text-[#1C2C1C]">Insured</span>
                    <span className="text-[12px] text-gray-500 font-medium">Up to date</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsVettingModalOpen(true)} className="text-[13px] text-gray-500 font-medium hover:underline whitespace-nowrap cursor-pointer">
                Learn more about traders <span className="font-bold text-[#6E9625]">Vetting & badges.</span>
              </button>
            </div>

            {/* Services & Expertise */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col">
                <h3 className="text-[18px] font-extrabold text-[#1C2C1C] mb-6 flex items-center gap-2">
                  <Wrench className="text-[#6E9625]" size={20} />
                  Services & Expertise
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {tp?.tradeCategories?.map((cat: any, i: number) => (
                    <span key={`cat-${i}`} className="inline-flex items-center justify-center bg-[#1C2C1C] text-white px-4 py-2 rounded-xl text-[13px] font-bold tracking-wide">
                      {typeof cat === 'object' ? cat.name : cat}
                    </span>
                  ))}
                  {tp?.skillsServices?.map((skill: any, i: number) => (
                    <span key={`skill-${i}`} className="inline-flex items-center justify-center bg-[#F4F7F1] text-[#243A24] px-4 py-2 rounded-xl text-[13px] font-bold tracking-wide border border-transparent">
                      {typeof skill === 'object' ? skill.name : skill}
                    </span>
                  ))}
                  {tp?.subCategories?.map((sub: any, i: number) => (
                    <span key={`sub-${i}`} className="inline-flex items-center justify-center bg-[#F3F4F6] text-[#4B5563] px-4 py-2 rounded-xl text-[13px] font-bold tracking-wide border border-transparent">
                      {typeof sub === 'object' ? sub.name : sub}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-[16px] overflow-hidden h-[300px] bg-gray-100 w-full relative border border-gray-100">
                <Image src={featuredImage} alt="Featured Work" fill className="object-cover" unoptimized />
              </div>
            </div>

            {/* Bottom Row Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

              {/* About Section */}
              <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 flex flex-col">
                <h3 className="text-[18px] font-extrabold text-[#1C2C1C] mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border-[1.5px] border-[#1C2C1C] flex items-center justify-center opacity-70">
                    <div className="w-2.5 h-2.5 rounded-full bg-transparent border-[1.5px] border-[#1C2C1C] mt-[-6px]" />
                  </div>
                  About {fullName.split(' ')[0]}
                </h3>
                <div className="text-[14px] text-gray-500 leading-relaxed font-medium mb-8 whitespace-pre-wrap">
                  {bio}
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 border-t border-gray-100 mt-auto">
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <Award size={28} className="text-[#6E9625]" strokeWidth={1.5} />
                    <span className="text-[12px] font-extrabold text-[#1C2C1C]">10+</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Years Experience</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <ThumbsUp size={28} className="text-[#6E9625]" strokeWidth={1.5} />
                    <span className="text-[12px] font-extrabold text-[#1C2C1C]">High</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Customer Satisfaction</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <ShieldCheck size={28} className="text-[#6E9625]" strokeWidth={1.5} />
                    <span className="text-[12px] font-extrabold text-[#1C2C1C]">Fully</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Insured</span>
                  </div>
                </div>
              </div>

              {/* Gallery Section */}
              <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[18px] font-extrabold text-[#1C2C1C] flex items-center gap-2">
                    <ImageIcon className="text-[#6E9625]" size={20} />
                    Gallery
                  </h3>
                  <a href="#" className="text-[13px] font-bold text-[#6E9625] hover:underline cursor-pointer">View all</a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {portfolio.slice(0, 4).map((img: any, i: number) => (
                    <div key={i} className="aspect-square rounded-[16px] overflow-hidden bg-gray-100 relative group cursor-pointer border border-gray-100">
                      <Image src={getImageUrl(img.fileUrl)} alt="Portfolio" fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
      
      <VettingModal 
        isOpen={isVettingModalOpen} 
        onClose={() => setIsVettingModalOpen(false)} 
      />
    </div>
  );
}
