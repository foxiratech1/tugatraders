"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authApi } from "@/app/api/authApi";
import {
  Star, MapPin, Phone, Briefcase, Wrench, ShieldCheck,
  Mail, ArrowLeft, CheckCircle, FileText, Check, Info, Image as ImageIcon, X, MessageSquare, Heart, ThumbsUp, Award, Shield, ChevronLeft, ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import VettingModal from "@/components/modal/VettingModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.tugatraders.server24.in";
function getImageUrl(path: any): string {
  if (!path) return "/avt.png";

  let stringPath = path;
  if (typeof path === 'object') {
    stringPath = path.url || path.path || path.imagePath || path.src || path.fileUrl;
  }

  if (typeof stringPath !== 'string') return "/placeholder.png";

  if (stringPath.startsWith("http") || stringPath.startsWith("data:")) return stringPath;
  const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  let imagePath = stringPath.startsWith('/') ? stringPath : `/${stringPath}`;
  imagePath = imagePath.replace(/\/\//g, '/');
  return `${baseUrl}${imagePath}`;
}

const LightboxModal = ({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev
}: {
  images: any[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) => {
  if (currentIndex === -1 || !images?.length) return null;

  const currentImg = images[currentIndex];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-md">
      <button onClick={onClose} className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-50">
        <X size={24} />
      </button>

      <button onClick={onPrev} className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-50" disabled={images.length <= 1}>
        <ChevronLeft size={36} />
      </button>

      <div className="relative max-w-[90vw] max-h-[85vh] w-full h-full flex items-center justify-center p-4">
        <img
          src={getImageUrl(currentImg)}
          alt="Gallery Image"
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
      </div>

      <button onClick={onNext} className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-50" disabled={images.length <= 1}>
        <ChevronRight size={36} />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white font-semibold bg-black/60 px-5 py-2 rounded-full text-sm backdrop-blur-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default function CustomerTraderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const traderId = params.id as string;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isVettingModalOpen, setIsVettingModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  const [showAllGallery, setShowAllGallery] = useState(false);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(-1);
  const nextLightboxImage = () => {
    if (portfolio?.length > 0) {
      setLightboxIndex((prev) => (prev === portfolio.length - 1 ? 0 : prev + 1));
    }
  };
  const prevLightboxImage = () => {
    if (portfolio?.length > 0) {
      setLightboxIndex((prev) => (prev === 0 ? portfolio.length - 1 : prev - 1));
    }
  };

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

  const handleSendMessage = () => {
    router.push(`/customer-dashboard/inbox?traderId=${traderId}`);
  };

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
          onClick={() => router.push("/customer-dashboard/jobs")}
          className="flex items-center gap-2 bg-[#243A24] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1C2C1C] transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Jobs
        </button>
      </div>
    );
  }

  // Extract variables carefully based on provided JSON structure
  const tp = profile?.profile || profile?.traderProfile || profile;
  const user = profile?.user || profile || {};
  const metrics = profile?.metrics || {};

  const fullName = user?.fullName || tp?.fullName || "Professional";
  const email = user?.email;
  const phone = user?.phone;
  const companyName = tp?.companyName || tp?.businessName;
  const avatarUrl = getImageUrl(user?.profileImage || tp?.logo || tp?.profileImage);
  const location = tp?.location || tp?.workLocation || user?.city || user?.location || "Location not specified";
  const bio = tp?.about || tp?.aboutUs || tp?.bio || tp?.description || "No description provided.";
  
  const rating = metrics?.averageRating || tp?.ratingAvg || user?.ratingAvg || 0;
  const reviewCount = metrics?.totalReviews || tp?.reviewCount || user?.reviewCount || 0;

  const isVerified = (tp?.verificationStatus === "APPROVED") || tp?.isVerified || user?.isVerified || false;
  const isInsured = tp?.insured || false;
  const portfolio = tp?.portfolio || [];
  const certificates = tp?.certificates || [];
  const insuranceDocuments = tp?.insuranceDocuments || [];

  return (
    <div className="min-h-screen bg-[#E2E8DC] font-sans selection:bg-[#6E9625]/20 selection:text-[#1C2C1C]">
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <button
          onClick={() => router.push("/customer-dashboard/jobs")}
          className="flex items-center gap-2 text-gray-500 hover:text-[#243A24] font-medium cursor-pointer transition-colors mb-6 lg:mb-8"
        >
          <ArrowLeft size={18} />
          Back to Jobs
        </button>

        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">

          {/* ── Left Sidebar ── */}
          <div className="w-full md:w-[280px] lg:w-[320px] flex-shrink-0 flex flex-col gap-6">

            {/* Top Info Card */}
            <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col items-center text-center overflow-hidden">

              {/* Dark Green Banner */}
              <div className="w-full h-24 sm:h-32 bg-[#1C2C1C] relative overflow-hidden shrink-0">
                <div className="absolute -bottom-12 -left-[10%] w-[120%] h-24 bg-white" style={{ borderRadius: '50% 50% 0 0' }}></div>
              </div>

              <div className="px-5 pb-6 sm:px-8 sm:pb-8 flex flex-col items-center -mt-12 sm:-mt-16 relative w-full z-10">
                {/* Avatar with Verified Shield */}
                <div className="relative mb-3">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-[#1C2C1C] flex items-center justify-center border-4 border-white shadow-sm">
                    <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                  </div>
                  {isVerified && (
                    <div className="absolute bottom-1 right-1 bg-[#6E9625] text-white p-1 rounded-full border-2 border-white shadow-sm">
                      <ShieldCheck size={14} />
                    </div>
                  )}
                </div>

                <h1 className="text-[20px] sm:text-[22px] font-extrabold text-[#1C2C1C] mb-1">{fullName}</h1>

                {/* Verified Badge */}
                {isVerified && (
                  <div className="flex items-center gap-1.5 text-[#6E9625] font-bold text-[13px] mb-4">
                    <CheckCircle size={15} className="fill-[#6E9625] text-white" />
                    Vetted Trader
                  </div>
                )}

                {/* Rating */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < Math.round(rating) ? "#F59E0B" : "none"} className={i < Math.round(rating) ? "text-[#F59E0B]" : "text-gray-200"} />
                  ))}
                  <span className="text-[13px] font-medium text-gray-500 ml-1">
                    {rating > 0 ? rating.toFixed(1) : 'New'} ({reviewCount} reviews)
                  </span>
                </div>

                {/* Action Buttons */}
                <button
                  onClick={handleSendMessage}
                  className="w-full bg-[#1C2C1C] text-white rounded-xl py-3.5 font-bold text-[14px] mb-3 flex items-center justify-center gap-2 hover:bg-black transition-colors"
                >
                  <MessageSquare size={18} /> Send Message
                </button>
                <button
                  onClick={handleSaveTrader}
                  disabled={isSaving}
                  className={`w-full rounded-xl py-3.5 font-bold text-[14px] flex items-center justify-center gap-2 transition-colors ${isSaved
                    ? "bg-[#F4F7F1] text-[#6E9625] hover:bg-[#e9f0e1] border border-[#6E9625]"
                    : "bg-[#F3F4F6] text-[#4B5563] hover:bg-gray-200"
                    }`}
                >
                  <Heart size={18} fill={isSaved ? "currentColor" : "none"} className={isSaved ? "text-[#6E9625]" : "text-[#4B5563]"} />
                  {isSaved ? "Saved" : "Save Trader"}
                </button>

                <hr className="w-full border-gray-100 my-6" />

                {/* Contact info */}
                <div className="w-full text-left space-y-5">
                  {email && (
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#F4F7F1] flex items-center justify-center text-[#6E9625] flex-shrink-0 mt-0.5">
                        <Mail size={16} />
                      </div>
                      <div>
                        <p className="text-[12px] text-gray-500 font-medium mb-0.5">Email</p>
                        <a href={`mailto:${email}`} className="text-[14px] font-medium text-[#6E9625] hover:underline break-all">{email}</a>
                      </div>
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#F4F7F1] flex items-center justify-center text-[#6E9625] flex-shrink-0 mt-0.5">
                        <Phone size={16} />
                      </div>
                      <div>
                        <p className="text-[12px] text-gray-500 font-medium mb-0.5">Phone</p>
                        <a href={`tel:${phone}`} className="text-[14px] font-medium text-[#6E9625] hover:underline">{phone}</a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats Card */}
                <div className="w-full mt-8 bg-[#F4F7F1] rounded-3xl p-6 sm:p-7 shadow-sm border border-[#E9F0E1] flex flex-col gap-5 text-left">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 font-medium text-[12px]">Company</span>
                    <span className="font-bold text-[#1C2C1C] text-[14px]">{companyName || '-'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 font-medium text-[12px]">Location</span>
                    <span className="font-bold text-[#1C2C1C] text-[14px]">{location || '-'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 font-medium text-[12px]">Jobs Completed</span>
                    <span className="font-bold text-[#1C2C1C] text-[14px]">{metrics?.completedJobs || tp?.jobsCompleted || 0}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 font-medium text-[12px]">Response Rate</span>
                    <span className="font-bold text-[#1C2C1C] text-[14px]">{metrics?.responseRate ? `${Math.round(metrics.responseRate * 100)}%` : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Content ── */}
          <div className="flex-1 flex flex-col gap-6">

            {/* Top Vetting Header */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 lg:px-8 lg:py-6 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-5 lg:gap-6">
              <div className="flex flex-wrap items-center gap-5 sm:gap-6 lg:gap-10">
                {/* Individual Checks */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isVerified ? 'bg-[#6E9625]' : 'bg-gray-200'}`}>
                    {isVerified ? <Check size={20} className="text-white" strokeWidth={3} /> : <X size={20} className="text-gray-400" strokeWidth={3} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#1C2C1C] text-[14px]">Individual Checks</span>
                    <span className="text-gray-500 text-[12px] font-medium">{isVerified ? 'Verified' : 'Pending'}</span>
                  </div>
                </div>

                {/* Trade Checks */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isVerified ? 'bg-[#6E9625]' : 'bg-gray-200'}`}>
                    {isVerified ? <Check size={20} className="text-white" strokeWidth={3} /> : <X size={20} className="text-gray-400" strokeWidth={3} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#1C2C1C] text-[14px]">Trade Checks</span>
                    <span className="text-gray-500 text-[12px] font-medium">{isVerified ? 'Verified' : 'Pending'}</span>
                  </div>
                </div>

                {/* Insured */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isInsured ? 'bg-white border-2 border-[#6E9625]' : 'bg-gray-200'}`}>
                    {isInsured ? <Shield size={20} className="text-[#6E9625]" strokeWidth={2.5} /> : <X size={20} className="text-gray-400" strokeWidth={3} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#1C2C1C] text-[14px]">Insured</span>
                    <span className="text-gray-500 text-[12px] font-medium">{isInsured ? 'Up to date' : 'Pending'}</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500 font-medium">
                Learn more about traders <button onClick={(e) => { e.preventDefault(); setIsVettingModalOpen(true); }} className="text-[#6E9625] font-bold hover:underline">Vetting & badges.</button>
              </div>
            </div>

            {/* Main Content Grid 1: Services & Expertise Hero Image */}
            <div className={`grid grid-cols-1 ${portfolio && portfolio.length > 0 ? 'xl:grid-cols-[1.2fr_1fr]' : 'xl:grid-cols-1'} gap-6`}>

              {/* Services & Expertise */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col h-full">
                <h3 className="text-[17px] font-bold text-[#1C2C1C] mb-6 flex items-center gap-3">
                  <Wrench className="text-[#6E9625]" size={20} />
                  Services & Expertise
                </h3>

                <div className="flex flex-wrap gap-2.5">
                  {/* Render Categories */}
                  {tp?.tradeCategories?.map((cat: any, i: number) => (
                    <span key={`cat-${i}`} className="inline-flex items-center bg-[#1C2C1C] text-white px-5 py-2.5 rounded-[12px] text-[13px] font-bold shadow-sm">
                      {typeof cat === 'object' ? cat.name : cat}
                    </span>
                  ))}

                  {/* Render Skills */}
                  {tp?.skillsServices?.map((skill: any, i: number) => (
                    <span key={`skill-${i}`} className="inline-flex items-center bg-[#F4F7F1] text-[#1C2C1C] px-5 py-2.5 rounded-[12px] text-[13px] font-bold border border-[#E9F0E1]">
                      {typeof skill === 'object' ? skill.name : skill}
                    </span>
                  ))}
                  
                </div>
              </div>

              {/* Hero Image */}
              {portfolio && portfolio.length > 0 && (
                <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100 h-48 sm:h-56 xl:h-auto xl:max-h-[220px]">
                  <img
                    src={getImageUrl(portfolio[0]?.url || portfolio[0]?.fileUrl || portfolio[0])}
                    alt="Trader Work"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Main Content Grid 2: About & Gallery */}
            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">

              {/* About */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-[17px] font-bold text-[#1C2C1C] mb-5 flex items-center gap-3">
                    About {fullName.split(' ')[0]}
                  </h3>
                  <div className="text-gray-600 font-medium text-[14px] leading-relaxed mb-8 whitespace-pre-wrap">
                    {bio}
                  </div>
                </div>

                {/* About Badges */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-t border-gray-100 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#1C2C1C] text-[13px]">10+</span>
                      <span className="text-[11px] font-medium text-gray-500">Years Experience</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#1C2C1C] text-[13px]">High</span>
                      <span className="text-[11px] font-medium text-gray-500">Customer Satisfaction</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#1C2C1C] text-[13px]">Fully</span>
                      <span className="text-[11px] font-medium text-gray-500">Insured</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[17px] font-bold text-[#1C2C1C] flex items-center gap-3">
                    <ImageIcon className="text-[#6E9625]" size={20} />
                    Gallery
                  </h3>
                  {portfolio && portfolio.length > 3 && (
                    <button
                      onClick={() => setShowAllGallery(!showAllGallery)}
                      className="text-[#6E9625] font-bold text-[13px] hover:underline cursor-pointer"
                    >
                      {showAllGallery ? "Show less" : "View all"}
                    </button>
                  )}
                </div>

                {portfolio && portfolio.length > 0 ? (
                  <div className="flex flex-wrap gap-4 h-full content-start">
                    {portfolio.slice(0, showAllGallery ? portfolio.length : 3).map((img: any, i: number) => (
                      <div key={i} className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 relative group flex-shrink-0">
                        <img src={getImageUrl(img?.url || img?.fileUrl || img)} alt="Gallery Image" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => openLightbox(i)}>
                          <button className="bg-white text-[#1C2C1C] px-3 py-1.5 rounded-lg text-sm font-bold">View</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl">
                    <p className="text-gray-400 font-medium text-sm">No images uploaded</p>
                  </div>
                )}
              </div>

            </div>

            {/* Insurance & Certificates */}
            {(certificates.length > 0 || insuranceDocuments.length > 0) && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col">
                <h3 className="text-[17px] font-bold text-[#1C2C1C] flex items-center gap-3 mb-6">
                  <ShieldCheck className="text-[#6E9625]" size={20} />
                  Insurance & Certificates
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {insuranceDocuments.map((doc: any, i: number) => (
                    <div key={`ins-${i}`} className="flex flex-col gap-2">
                      <div className="rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 aspect-[3/4] relative group">
                        <img src={getImageUrl(doc)} alt="Insurance Document" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a href={getImageUrl(doc)} target="_blank" rel="noreferrer" className="bg-white text-[#1C2C1C] px-3 py-1.5 rounded-lg text-sm font-bold">View</a>
                        </div>
                      </div>
                      <span className="text-[13px] font-bold text-center text-[#1C2C1C]">Insurance</span>
                    </div>
                  ))}
                  {certificates.map((cert: any, i: number) => (
                    <div key={`cert-${i}`} className="flex flex-col gap-2">
                      <div className="rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 aspect-[3/4] relative group">
                        <img src={getImageUrl(cert)} alt="Certificate" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a href={getImageUrl(cert)} target="_blank" rel="noreferrer" className="bg-white text-[#1C2C1C] px-3 py-1.5 rounded-lg text-sm font-bold">View</a>
                        </div>
                      </div>
                      <span className="text-[13px] font-bold text-center text-[#1C2C1C]">Certificate</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </main>

      <VettingModal
        isOpen={isVettingModalOpen}
        onClose={() => setIsVettingModalOpen(false)}
      />

      <LightboxModal
        images={portfolio}
        currentIndex={lightboxIndex}
        onClose={closeLightbox}
        onNext={nextLightboxImage}
        onPrev={prevLightboxImage}
      />

    </div >
  );
}
