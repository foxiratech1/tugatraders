"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authApi } from "@/app/api/authApi";
import { getAccessToken } from "@/utils/auth";
import {
  Star, MapPin, Phone, Briefcase, Wrench, ShieldCheck,
  Mail, ArrowLeft, CheckCircle, FileText, Check, Info, Image as ImageIcon, X, MessageSquare, Heart, ThumbsUp, Award, Shield, LogIn
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

  if (stringPath.startsWith("http")) return stringPath;
  const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  let imagePath = stringPath.startsWith('/') ? stringPath : `/${stringPath}`;
  imagePath = imagePath.replace(/\/\//g, '/');
  return `${baseUrl}${imagePath}`;
}

const LoginModal = ({
  isOpen,
  onClose,
  onSuccess,
  action
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  action: "message" | "save";
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      const accessToken = data?.accessToken || data?.access_token || data?.token;
      const refreshToken = data?.refreshToken || data?.refresh_token;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        onSuccess();
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const title = action === "message"
    ? "Login to contact trader"
    : "Login to save trader";
  const desc = action === "message"
    ? "Please log in to view contact info and chat with this trader."
    : "Please log in to save this trader to your bookmarks.";
  const btnText = loading ? 'Logging in…' : 'Log In & Continue';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-[420px] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-[#1C2C1C]/40 hover:bg-gray-100 hover:text-[#1C2C1C] transition-colors cursor-pointer text-lg"
        >
          ✕
        </button>

        <div className="w-12 h-12 rounded-full bg-[#F3F8EC] flex items-center justify-center mb-4">
          <LogIn size={22} className="text-[#6E9625]" />
        </div>

        <h3 className="text-[22px] font-bold text-[#1C2C1C] mb-1" style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
          {title}
        </h3>
        <p className="text-[13px] text-[#1C2C1C]/55 font-medium mb-6">
          {desc}
        </p>

        {error && (
          <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-extrabold text-[#1C2C1C] uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5] outline-none text-[14px] font-medium focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625] transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-extrabold text-[#1C2C1C] uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-10 rounded-xl border border-[#E5E5E5] outline-none text-[14px] font-medium focus:border-[#6E9625] focus:ring-1 focus:ring-[#6E9625] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1C2C1C]/40 hover:text-[#1C2C1C] transition-colors cursor-pointer"
              >
                {showPw ? (
                  <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 py-3 bg-[#1C2C1C] text-white rounded-xl font-bold text-[14px] hover:bg-[#121E12] transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
          >
            {btnText}
          </button>
        </form>

        <p className="text-center text-[12px] text-[#1C2C1C]/50 mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-[#6E9625] font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default function PublicTraderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const traderId = params.id as string;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isVettingModalOpen, setIsVettingModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"message" | "save" | null>(null);

  useEffect(() => {
    if (!traderId) return;

    async function loadProfile(lat: number, lng: number) {
      try {
        setLoading(true);
        const res = await authApi.getPublicTraderProfileById(traderId, lat, lng);

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

  const executeToggleSave = async () => {
    try {
      setIsSaving(true);
      setIsSaved(!isSaved); // Optimistic UI update
      await authApi.toggleSaveTrader(traderId);
    } catch (error) {
      setIsSaved(!isSaved); // Revert on error
      toast.error("Failed to update saved status.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSave = () => {
    const token = getAccessToken();
    if (!token) {
      setPendingAction("save");
      setShowLoginModal(true);
      return;
    }
    executeToggleSave();
  };

  const handleSendMessage = () => {
    const token = getAccessToken();
    if (!token) {
      setPendingAction("message");
      setShowLoginModal(true);
      return;
    }
    router.push(`/customer-dashboard/inbox?traderId=${traderId}`);
  };

  const onLoginSuccess = () => {
    setShowLoginModal(false);
    if (pendingAction === "save") {
      executeToggleSave();
    } else if (pendingAction === "message") {
      router.push(`/customer-dashboard/inbox?traderId=${traderId}`);
    }
    setPendingAction(null);
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
    <div className="min-h-screen bg-[#F8F9F5] font-sans selection:bg-[#6E9625]/20 selection:text-[#1C2C1C]">
      {/* ── Navbar Spacer ── */}
      <div className="h-16 lg:h-24 bg-white" />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <button
          onClick={() => router.push("/directory-listing/search")}
          className="flex items-center gap-2 text-gray-500 hover:text-[#243A24] font-medium transition-colors mb-6 lg:mb-8"
        >
          <ArrowLeft size={18} />
          Back to Search Results
        </button>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* ── Left Sidebar ── */}
          <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">

            {/* Top Info Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 bg-gray-50 flex items-center justify-center border-4 border-white shadow-sm relative">
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              </div>

              <h1 className="text-[22px] font-extrabold text-[#1C2C1C] mb-2">{fullName}</h1>

              {/* Verified Badge */}
              {isVerified && (
                <div className="flex items-center gap-1.5 text-[#1C2C1C] font-semibold text-[13px] mb-4">
                  <CheckCircle size={16} className="text-[#1C2C1C]" />
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
                onClick={handleToggleSave}
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
                      <a href={`mailto:${email}`} className="text-[14px] font-bold text-[#6E9625] hover:underline break-all">{email}</a>
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
                      <a href={`tel:${phone}`} className="text-[14px] font-bold text-[#6E9625] hover:underline">{phone}</a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col gap-5 text-left">
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
                <span className="font-bold text-[#1C2C1C] text-[14px]">{metrics?.completedJobs || 0}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 font-medium text-[12px]">Response Rate</span>
                <span className="font-bold text-[#1C2C1C] text-[14px]">{metrics?.responseRate ? `${Math.round(metrics.responseRate * 100)}%` : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* ── Right Content ── */}
          <div className="flex-1 flex flex-col gap-6">

            {/* Top Vetting Header */}
            <div className="bg-white rounded-3xl p-6 sm:px-8 sm:py-6 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-wrap items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-8 lg:gap-12">
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

            {/* Main Content Grid 1: Services & Hero Image */}
            <div className={`grid grid-cols-1 ${portfolio && portfolio.length > 0 ? 'lg:grid-cols-[1.2fr_1fr]' : 'lg:grid-cols-1'} gap-6`}>

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

                  {/* Render Sub Categories */}
                  {tp?.subCategories?.map((sub: any, i: number) => (
                    <span key={`sub-${i}`} className="inline-flex items-center bg-[#F9FAFB] text-[#4B5563] px-5 py-2.5 rounded-[12px] text-[13px] font-bold border border-gray-100">
                      {typeof sub === 'object' ? sub.name : sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hero Image */}
              {portfolio && portfolio.length > 0 && (
                <div className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100 h-64 lg:h-auto min-h-[300px]">
                  <img
                    src={getImageUrl(portfolio[0]?.url || portfolio[0])}
                    alt="Trader Work"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Main Content Grid 2: About & Gallery */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">

              {/* About */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-[17px] font-bold text-[#1C2C1C] mb-5 flex items-center gap-3">
                    <FileText className="text-[#6E9625]" size={20} />
                    About {fullName.split(' ')[0]}
                  </h3>
                  <div className="text-gray-600 font-medium text-[14px] leading-relaxed mb-8 whitespace-pre-wrap">
                    {bio}
                  </div>
                </div>

                {/* About Badges */}
                <div className="flex flex-wrap items-center gap-6 border-t border-gray-100 pt-6">
                  <div className="flex items-center gap-3">
                    <Award size={32} className="text-[#6E9625] stroke-[1.5]" />
                    <div className="flex flex-col">
                      <span className="font-bold text-[#1C2C1C] text-[13px]">10+</span>
                      <span className="text-[11px] font-medium text-gray-500">Years Experience</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ThumbsUp size={32} className="text-[#6E9625] stroke-[1.5]" />
                    <div className="flex flex-col">
                      <span className="font-bold text-[#1C2C1C] text-[13px]">High</span>
                      <span className="text-[11px] font-medium text-gray-500">Customer Satisfaction</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield size={32} className="text-[#6E9625] stroke-[1.5]" />
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
                  {portfolio && portfolio.length > 0 && (
                    <button className="text-[#6E9625] font-bold text-[13px] hover:underline">View all</button>
                  )}
                </div>

                {portfolio && portfolio.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 h-full">
                    {portfolio.slice(0, 4).map((img: any, i: number) => (
                      <div key={i} className="rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 aspect-square">
                        <img src={getImageUrl(img.url || img)} alt="Gallery Image" className="w-full h-full object-cover" />
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

          </div>
        </div>
      </main>

      <VettingModal
        isOpen={isVettingModalOpen}
        onClose={() => setIsVettingModalOpen(false)}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => { setShowLoginModal(false); setPendingAction(null); }}
        onSuccess={onLoginSuccess}
        action={pendingAction || "message"}
      />
    </div>
  );
}
