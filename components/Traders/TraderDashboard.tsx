"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi, getRegistrationStatus } from "@/app/api/authApi";
import { useSocket } from "@/hooks/useSocket";
import {
  Briefcase, MessageSquare, Star, FileText, Zap,
  MapPin, Clock, MoreVertical, ShieldCheck, CheckCircle2,
  Headphones, ChevronRight, Eye, Send, Users, BarChart, Loader2, ArrowRight,
  Check, ChevronDown
} from "lucide-react";

export default function TraderDashboard() {
  const [dashboardDetails, setDashboardDetails] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [regData, setRegData] = useState<any>(null);
  const [showStrengthBreakdown, setShowStrengthBreakdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, myProfileRes, regRes] = await Promise.all([
          authApi.getTraderDashboard().catch(() => null),
          authApi.getMyProfile().catch(() => null),
          getRegistrationStatus().catch(() => null),
        ]);
        setDashboardDetails(dashRes?.data || dashRes || {});
        setProfileData(myProfileRes?.data || myProfileRes || null);
        setRegData(regRes?.data || regRes || null);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Real-time dashboard update via socket
  useSocket({
    onTraderDashboardUpdate: (data) => {
      if (data) {
        setDashboardDetails(data);
        authApi.getMyProfile().then(res => setProfileData(res?.data || res)).catch(() => { });
        getRegistrationStatus().then(res => setRegData(res?.data || res)).catch(() => { });
      }
    },
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="animate-spin text-[#6E9625]" size={40} />
      </div>
    );
  }

  // Exact data mapping based on API response
  const actionRequired = dashboardDetails?.actionRequired || {};
  const status = dashboardDetails?.status || {};
  const stats = dashboardDetails?.performance || dashboardDetails?.stats || {};
  const newJobs = dashboardDetails?.newJobs || [];
  const openJobs = dashboardDetails?.openJobs || [];

  const tp = profileData?.traderProfile || profileData || {};
  const reg = regData || {};

  // Check if getRegistrationStatus provides percentage directly
  const apiPercentage =
    typeof reg?.profileCompletionPercentage === "number"
      ? reg.profileCompletionPercentage
      : typeof reg?.profileStrengthPercentage === "number"
        ? reg.profileStrengthPercentage
        : typeof reg?.profileStrength === "number"
          ? reg.profileStrength
          : typeof reg?.completedPercentage === "number"
            ? reg.completedPercentage
            : typeof reg?.profileCompletion?.overallPercentage === "number"
              ? reg.profileCompletion.overallPercentage
              : null;

  // Stages & next step from getRegistrationStatus API if available
  const apiStages = reg?.profileCompletion?.stages || reg?.stages || [];
  const nextIncompleteApiStage = Array.isArray(apiStages) ? apiStages.find((s: any) => !s.isCompleted) : null;

  // 1. Sign-up complete: 0 – 25% (Registered trader account exists)
  const isSignUpDone = true;

  // 2. Complete dashboard requirements (vetting process): 25 – 50%
  const isVettingDone = Boolean(
    reg?.step2Completed === true ||
    (typeof reg?.currentStep === "number" && reg.currentStep >= 3) ||
    (reg?.verificationStatus && reg.verificationStatus !== "NONE") ||
    tp?.companyName ||
    tp?.businessName ||
    (Array.isArray(tp?.categoryDetails) && tp.categoryDetails.length > 0) ||
    status?.isVettingComplete
  );

  // 3. Approved by Admin: 50 – 65%
  const vStatus = (reg?.verificationStatus ?? status?.verificationStatus ?? tp?.verificationStatus ?? "").toUpperCase();
  const isApproved = vStatus === "APPROVED" || profileData?.isVerified === true || tp?.isVerified === true;

  // 4. Activate your profile (subscription & payment setup): 65 – 80%
  const tierName = (status?.subscription?.tierName || tp?.subscriptionTier || tp?.subscription?.plan?.name || "").toLowerCase();
  const subStatus = (status?.subscription?.status || tp?.subscription?.status || "").toLowerCase();
  const isSubActive = Boolean(
    (tierName && tierName !== "free tier" && tierName !== "free") ||
    subStatus === "active" ||
    tp?.subscription?.plan ||
    reg?.isRegistrationCompleted ||
    (typeof reg?.currentStep === "number" && reg.currentStep > 3)
  );

  // 5. Add About & upload job portfolio (photos / videos of your work): 80 – 90%
  const hasAbout = Boolean(
    tp?.about?.trim() ||
    tp?.bio?.trim() ||
    tp?.description?.trim() ||
    tp?.aboutUs?.trim()
  );
  const rawPortfolio = tp?.portfolioItems || tp?.portfolio;
  const hasPortfolio = Boolean(Array.isArray(rawPortfolio) && rawPortfolio.length > 0);

  // 6. Upload certificates and/or insurance documents: 90 – 100%
  const rawCerts = tp?.certificates;
  const hasCertificates = Boolean(Array.isArray(rawCerts) && rawCerts.length > 0);
  const rawIns = tp?.insuranceDocuments || tp?.insurance;
  const hasInsurance = Boolean(Array.isArray(rawIns) && rawIns.length > 0);
  const hasDocuments = hasCertificates || hasInsurance;

  // Calculate Profile Strength (0 - 100%)
  let calculatedStrength = 25; // 0 – 25%: Sign-up complete
  if (isVettingDone) calculatedStrength += 25; // 25 – 50%
  if (isApproved) calculatedStrength += 15; // 50 – 65%
  if (isSubActive) calculatedStrength += 15; // 65 – 80%
  if (hasAbout) calculatedStrength += 5; // 80 – 85%
  if (hasPortfolio) calculatedStrength += 5; // 85 – 90%
  if (hasDocuments) calculatedStrength += 10; // 90 – 100%

  // Use the percentage directly from getRegistrationStatus if provided, otherwise fallback to calculatedStrength
  const profileStrength = Math.min(
    100,
    Math.max(0, apiPercentage !== null ? apiPercentage : calculatedStrength)
  );
  const isStrengthComplete = profileStrength >= 100;

  // Determine Next Step guidance
  let nextStepText = nextIncompleteApiStage?.title || "Complete dashboard requirements (vetting process)";
  let nextStepUrl = "/trader/profile";
  let nextStepButtonText = "Complete profile";

  if (nextIncompleteApiStage?.title) {
    nextStepText = nextIncompleteApiStage.title;
    const lower = nextStepText.toLowerCase();
    if (lower.includes("subscription") || lower.includes("payment") || lower.includes("billing")) {
      nextStepUrl = "/trader/billing";
      nextStepButtonText = "Activate profile";
    } else {
      nextStepUrl = "/trader/profile";
      nextStepButtonText = "Complete step";
    }
  } else if (!isVettingDone) {
    nextStepText = "Complete dashboard requirements (vetting process)";
    nextStepUrl = "/trader/profile";
    nextStepButtonText = "Complete vetting";
  } else if (!isApproved) {
    nextStepText = "Awaiting admin approval";
    nextStepUrl = "/trader/profile";
    nextStepButtonText = "View profile";
  } else if (!isSubActive) {
    nextStepText = "Activate your profile (subscription & payment setup)";
    nextStepUrl = "/trader/billing";
    nextStepButtonText = "Activate profile";
  } else if (!hasAbout && !hasPortfolio) {
    nextStepText = "Add About & upload job portfolio";
    nextStepUrl = "/trader/profile";
    nextStepButtonText = "Add About & Portfolio";
  } else if (!hasAbout) {
    nextStepText = "Add About section";
    nextStepUrl = "/trader/profile";
    nextStepButtonText = "Add About";
  } else if (!hasPortfolio) {
    nextStepText = "Upload job portfolio (photos / videos)";
    nextStepUrl = "/trader/profile";
    nextStepButtonText = "Upload portfolio";
  } else if (!hasDocuments) {
    nextStepText = "Upload certificates and/or insurance documents";
    nextStepUrl = "/trader/profile";
    nextStepButtonText = "Upload documents";
  } else {
    nextStepText = "All profile requirements complete";
    nextStepUrl = "/trader/profile";
    nextStepButtonText = "View profile";
  }

  const strengthStages = [
    {
      title: "Sign-up complete",
      range: "0 – 25%",
      points: 25,
      isDone: true,
    },
    {
      title: "Complete dashboard requirements (vetting)",
      range: "25 – 50%",
      points: 25,
      isDone: isVettingDone || (Array.isArray(apiStages) && apiStages.some((s: any) => (s.key === "vetting" || s.title?.toLowerCase().includes("vetting") || s.title?.toLowerCase().includes("requirement")) && s.isCompleted)),
    },
    {
      title: "Approved by Admin",
      range: "50 – 65%",
      points: 15,
      isDone: isApproved || (Array.isArray(apiStages) && apiStages.some((s: any) => (s.key === "approval" || s.title?.toLowerCase().includes("approv")) && s.isCompleted)),
    },
    {
      title: "Activate your profile (subscription)",
      range: "65 – 80%",
      points: 15,
      isDone: isSubActive || (Array.isArray(apiStages) && apiStages.some((s: any) => (s.key === "subscription" || s.title?.toLowerCase().includes("subscript") || s.title?.toLowerCase().includes("activat")) && s.isCompleted)),
    },
    {
      title: "Add About & upload job portfolio",
      range: "80 – 90%",
      points: 10,
      isDone: (hasAbout && hasPortfolio) || (Array.isArray(apiStages) && apiStages.some((s: any) => (s.key === "portfolio" || s.title?.toLowerCase().includes("portfolio")) && s.isCompleted)),
    },
    {
      title: "Upload certificates and/or insurance",
      range: "90 – 100%",
      points: 10,
      isDone: hasDocuments || (Array.isArray(apiStages) && apiStages.some((s: any) => (s.key === "documents" || s.title?.toLowerCase().includes("certificate") || s.title?.toLowerCase().includes("insurance")) && s.isCompleted)),
    },
  ];

  const completedStagesCount = strengthStages.filter(s => s.isDone).length;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-[#F8F9F5] min-h-screen">

      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-8">

        {/* ── LEFT SIDEBAR ─────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          <h2 className="text-[18px] font-extrabold text-[#1C2C1C]">Your TugaTrades Status</h2>

          {/* Profile Strength */}
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-bold text-[#1C2C1C]">Profile Strength</h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F2F7EB] text-[#6E9625]">
                {profileStrength}%
              </span>
            </div>
            <div className="mb-4">
              <div className="flex items-end justify-between mb-2">
                <span className="text-[24px] font-black text-[#1C2C1C] leading-none">
                  {profileStrength}% <span className="text-[13px] font-semibold text-gray-400">Strength</span>
                </span>
              </div>
              <div className="h-[6px] bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6E9625] rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${profileStrength}%` }}
                />
              </div>
            </div>

            <p className="text-[12px] text-gray-500 mb-4">
              <span className="font-semibold text-gray-700">Next step:</span> {nextStepText}
            </p>

            <button
              onClick={() => router.push(nextStepUrl)}
              className="w-full py-2.5 rounded-xl border border-[#E2EED2] text-[#6E9625] text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#F2F7EB] transition-colors mb-3"
            >
              {nextStepButtonText} <ArrowRight size={14} />
            </button>

            {/* Collapsible Requirements Breakdown */}
            <div className="border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => setShowStrengthBreakdown(!showStrengthBreakdown)}
                className="w-full flex items-center justify-between text-[11px] font-bold text-gray-600 hover:text-[#1C2C1C] transition-colors"
              >
                <span>Requirements ({completedStagesCount}/6)</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 text-gray-400 ${showStrengthBreakdown ? "rotate-180" : ""}`}
                />
              </button>

              {showStrengthBreakdown && (
                <div className="mt-3 space-y-2.5">
                  {strengthStages.map((stage, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px]">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${stage.isDone ? "bg-[#6E9625] text-white" : "border border-gray-300 text-transparent"
                        }`}>
                        {stage.isDone && <Check size={10} strokeWidth={3} />}
                      </div>
                      <div className="flex-1 leading-tight">
                        <span className={`font-semibold ${stage.isDone ? "text-[#1C2C1C]" : "text-gray-500"}`}>
                          {stage.title}
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          {stage.range} • {stage.points}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subscription */}
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5">
            <h3 className="text-[13px] font-bold text-[#1C2C1C] mb-4">Subscription</h3>
            <div className="bg-[#FFF4E5] rounded-xl p-3 flex items-center gap-3 mb-4 border border-[#FFE0B2]">
              <ShieldCheck size={20} className="text-[#E65100]" />
              <span className="text-[14px] font-bold text-[#E65100]">{status.subscription?.tierName || "Free Tier"}</span>
            </div>
            <p className="text-[12px] text-gray-500 mb-4">Active until {status.subscription?.activeUntil ? new Date(status.subscription.activeUntil).toLocaleDateString() : 'N/A'}</p>
            <button
              onClick={() => router.push('/trader/billing')}
              className="text-[13px] font-bold text-[#6E9625] hover:underline flex items-center gap-1"
            >
              Manage subscription <ArrowRight size={14} />
            </button>
          </div>

          {/* Need help? */}
          <div className="bg-[#F2F7EB] rounded-[20px] border border-[#E2EED2] p-5">
            <div className="flex items-center gap-3 mb-3">
              <Headphones size={20} className="text-[#6E9625]" />
              <h3 className="text-[14px] font-bold text-[#1C2C1C]">Need help?</h3>
            </div>
            <p className="text-[12px] text-gray-600 mb-4">Our support team is here to help you.</p>
            <button
              onClick={() => router.push('/contact')}
              className="w-full py-2.5 rounded-xl bg-white border border-[#E2EED2] text-[#6E9625] text-[13px] font-bold hover:bg-gray-50 transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>

        {/* ── RIGHT MAIN CONTENT ───────────────────────────── */}
        <div className="flex flex-col gap-6 w-full min-w-0">

          {/* Header */}
          <div>
            <h1 className="text-[28px] font-extrabold text-[#1C2C1C] flex items-center gap-2">
              Hello, {dashboardDetails?.welcome?.fullName || "Trader"} <span role="img" aria-label="wave">👋</span>
            </h1>
            <p className="text-[14px] text-gray-500 mt-1">Here's what's happening with your business today.</p>
          </div>

          {/* Action Required Block */}
          <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E2EED2] overflow-hidden mt-2">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100/60 bg-[#FAFAFA]">
              <Zap size={18} className="text-[#6E9625]" fill="#6E9625" />
              <h3 className="text-[15px] font-bold text-[#1C2C1C]">Action Required</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 lg:divide-x divide-gray-100/60 p-2">

              {/* Card 1 */}
              <div
                onClick={() => router.push('/trader/jobs')}
                className="px-5 py-4 flex flex-col gap-3 hover:bg-gray-50/50 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-[44px] h-[44px] rounded-full bg-[#F2F7EB] flex items-center justify-center flex-shrink-0">
                    <Briefcase size={20} className="text-[#6E9625]" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="text-[24px] font-black text-[#1C2C1C] leading-none mb-1">
                      {actionRequired.newJobsCount ?? 0}
                    </h4>
                    <p className="text-[12px] text-gray-500 font-medium">In progress job</p>
                  </div>
                </div>
                <button className="text-[12px] font-bold text-[#6E9625] flex items-center gap-1 hover:underline mt-1">
                  View jobs <ArrowRight size={14} />
                </button>
              </div>

              {/* Card 2 */}
              <div
                onClick={() => router.push('/trader/quote')}
                className="px-5 py-4 flex flex-col gap-3 hover:bg-gray-50/50 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-[44px] h-[44px] rounded-full bg-[#FFF3E0] flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={20} className="text-[#E65100]" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="text-[24px] font-black text-[#1C2C1C] leading-none mb-1">
                      {actionRequired.quotesAwaitingResponseCount ?? 0}
                    </h4>
                    <p className="text-[12px] text-gray-500 font-medium">Quotes awaiting response</p>
                  </div>
                </div>
                <button className="text-[12px] font-bold text-[#6E9625] flex items-center gap-1 hover:underline mt-1">
                  View quotes <ArrowRight size={14} />
                </button>
              </div>

              {/* Card 3 */}
              <div
                onClick={() => router.push('/trader/reviews')}
                className="px-5 py-4 flex flex-col gap-3 hover:bg-gray-50/50 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-[44px] h-[44px] rounded-full bg-[#E3F2FD] flex items-center justify-center flex-shrink-0">
                    <Star size={20} className="text-[#1565C0]" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="text-[24px] font-black text-[#1C2C1C] leading-none mb-1">
                      {actionRequired.newReviewsCount ?? 0}
                    </h4>
                    <p className="text-[12px] text-gray-500 font-medium">Pending Reviews</p>
                  </div>
                </div>
                <button className="text-[12px] font-bold text-[#6E9625] flex items-center gap-1 hover:underline mt-1">
                  View review <ArrowRight size={14} />
                </button>
              </div>

              {/* Card 4 */}
              <div
                onClick={() => router.push(nextStepUrl)}
                className="px-5 py-4 flex flex-col gap-3 hover:bg-gray-50/50 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-[44px] h-[44px] rounded-full bg-[#F2F7EB] flex items-center justify-center flex-shrink-0">
                    <FileText size={20} className="text-[#6E9625]" strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-black text-[#1C2C1C] leading-tight mb-1">
                      {isStrengthComplete ? "Profile Complete" : `${profileStrength}% Profile Strength`}
                    </h4>
                    <p className="text-[12px] text-gray-500 font-medium">
                      {isStrengthComplete ? "All requirements completed" : nextStepText}
                    </p>
                  </div>
                </div>
                {!isStrengthComplete && (
                  <button className="text-[12px] font-bold text-[#6E9625] flex items-center gap-1 hover:underline mt-1">
                    {nextStepButtonText} <ArrowRight size={14} />
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Grid Layout below Action Required */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 mt-2">

            {/* Left Side: Jobs Lists */}
            <div className="flex flex-col gap-6 min-w-0">

              {/* New Jobs For You */}
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-[#6E9625]" />
                    <h3 className="text-[15px] font-bold text-[#1C2C1C]">New Jobs For You</h3>
                  </div>
                  <button className="text-[12px] font-bold text-[#6E9625] hover:underline flex items-center gap-1">
                    View all jobs <ArrowRight size={14} />
                  </button>
                </div>
                <p className="text-[12px] text-gray-500 mb-4 -mt-3 ml-6">Matched to your services and service area</p>

                <div className="divide-y divide-gray-100">
                  {newJobs.length > 0 ? newJobs.map((job: any) => (
                    <div key={job.id || Math.random()} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-[14px] font-bold text-[#1C2C1C] mb-2">{job.title || "Untitled Job"}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-[12px] text-gray-500">
                          <span className="flex items-center gap-1"><MapPin size={12} /> {job.location || "N/A"}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {job.postedAgo || (job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Just now")}</span>
                          <span className="flex items-center gap-1 text-[#E65100] font-medium"><MessageSquare size={12} /> {job.quotesCount || 0} quotes</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/trader/jobs?jobId=${job.id}`)}
                          className="px-4 py-2 rounded-xl border border-gray-200 text-[#1C2C1C] text-[12px] font-bold hover:bg-gray-50 transition-colors"
                        >
                          View Job
                        </button>
                        <button
                          onClick={() => router.push(`/trader/jobs?jobId=${job.id}&action=quote`)}
                          className="px-4 py-2 rounded-xl bg-[#5C7E1F] text-white text-[12px] font-bold hover:bg-[#4d691a] transition-colors"
                        >
                          Send Quote
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="py-8 text-center text-gray-500 text-[13px]">
                      No new jobs available at the moment.
                    </div>
                  )}
                </div>
                {newJobs.length > 0 && (
                  <button className="w-full mt-4 text-[12px] font-bold text-[#6E9625] hover:underline flex items-center justify-center gap-1">
                    Show more jobs <ArrowRight size={14} />
                  </button>
                )}
              </div>

              {/* Open Jobs */}
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-[#6E9625]" />
                    <h3 className="text-[15px] font-bold text-[#1C2C1C]">Open Jobs</h3>
                  </div>
                  <button className="text-[12px] font-bold text-[#6E9625] hover:underline flex items-center gap-1">
                    View all jobs <ArrowRight size={14} />
                  </button>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left min-w-[500px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-[12px] font-bold text-gray-400">
                        <th className="pb-3 font-medium">Job Title</th>
                        <th className="pb-3 font-medium">Location</th>
                        <th className="pb-3 font-medium text-center">Quotes</th>
                        <th className="pb-3 font-medium text-center">Status</th>
                        <th className="pb-3 font-medium w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {openJobs.length > 0 ? openJobs.map((job: any) => (
                        <tr key={job.id || Math.random()}>
                          <td className="py-4">
                            <p className="text-[13px] font-bold text-[#1C2C1C]">{job.title || "Untitled Job"}</p>
                            <p className="text-[11px] text-gray-400">Ref: {job.id?.substring(0, 8) || "N/A"}</p>
                          </td>
                          <td className="py-4 text-[12px] text-gray-600"><span className="flex items-center gap-1"><MapPin size={12} className="text-gray-400" /> {job.location || "N/A"}</span></td>
                          <td className="py-4 text-[12px] font-bold text-center">{job.quotesCount || 0}</td>
                          <td className="py-4 text-center">
                            <span className="inline-flex items-center justify-center px-2 py-1 rounded border border-[#6E9625] text-[#6E9625] text-[10px] font-bold bg-[#F2F7EB] uppercase">{job.status || "Live"}</span>
                          </td>
                          <td className="py-4 text-right">
                            <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={16} /></button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500 text-[13px]">
                            You have no open jobs.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Side: Performance Metrics */}
            <div className="flex flex-col gap-6">

              <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <BarChart size={16} className="text-[#6E9625]" />
                    <h3 className="text-[15px] font-bold text-[#1C2C1C]">Your Performance</h3>
                  </div>
                  <select className="text-[12px] border border-gray-200 rounded-lg px-2 py-1 outline-none text-[#1C2C1C] font-medium bg-white">
                    <option>Last 30 days</option>
                    <option>Last 7 days</option>
                    <option>All time</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Metric 1 */}
                  <div className="bg-[#FAFAFA] rounded-xl p-4 border border-gray-100 flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#EAF3DE] flex items-center justify-center">
                      <Eye size={16} className="text-[#6E9625]" />
                    </div>
                    <div>
                      <h4 className="text-[20px] font-black text-[#1C2C1C] leading-none mb-1">
                        {typeof stats.jobsViewed === 'object' ? stats.jobsViewed?.value : (stats.jobsViewed ?? 0)}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium mb-2">Jobs viewed</p>
                      <p className="text-[10px] font-bold text-[#6E9625] flex items-center gap-1">↑ {typeof stats.jobsViewed === 'object' ? stats.jobsViewed?.trendPercentage : 0}% <span className="text-gray-400 font-normal">vs last 30 days</span></p>
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-[#FAFAFA] rounded-xl p-4 border border-gray-100 flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#EAF3DE] flex items-center justify-center">
                      <Send size={16} className="text-[#6E9625]" />
                    </div>
                    <div>
                      <h4 className="text-[20px] font-black text-[#1C2C1C] leading-none mb-1">
                        {typeof stats.quotesSent === 'object' ? stats.quotesSent?.value : (stats.quotesSent ?? 0)}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium mb-2">Quotes sent</p>
                      <p className="text-[10px] font-bold text-[#6E9625] flex items-center gap-1">↑ {typeof stats.quotesSent === 'object' ? stats.quotesSent?.trendPercentage : 0}% <span className="text-gray-400 font-normal">vs last 30 days</span></p>
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="bg-[#FAFAFA] rounded-xl p-4 border border-gray-100 flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#EAF3DE] flex items-center justify-center">
                      <CheckCircle2 size={16} className="text-[#6E9625]" />
                    </div>
                    <div>
                      <h4 className="text-[20px] font-black text-[#1C2C1C] leading-none mb-1">
                        {typeof stats.quoteAcceptanceRate === 'object' ? stats.quoteAcceptanceRate?.value : (stats.quoteAcceptanceRate ?? 0)}%
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium mb-2">Quote acceptance rate</p>
                      <p className="text-[10px] font-bold text-[#6E9625] flex items-center gap-1">↑ {typeof stats.quoteAcceptanceRate === 'object' ? stats.quoteAcceptanceRate?.trendPercentage : 0}% <span className="text-gray-400 font-normal">vs last 30 days</span></p>
                    </div>
                  </div>

                  {/* Metric 4 */}
                  <div className="bg-[#FAFAFA] rounded-xl p-4 border border-gray-100 flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#EAF3DE] flex items-center justify-center">
                      <Users size={16} className="text-[#6E9625]" />
                    </div>
                    <div>
                      <h4 className="text-[20px] font-black text-[#1C2C1C] leading-none mb-1">
                        {typeof stats.profileViews === 'object' ? stats.profileViews?.value : (stats.profileViews ?? 0)}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium mb-2">Profile views</p>
                      <p className="text-[10px] font-bold text-[#6E9625] flex items-center gap-1">↑ {typeof stats.profileViews === 'object' ? stats.profileViews?.trendPercentage : 0}% <span className="text-gray-400 font-normal">vs last 30 days</span></p>
                    </div>
                  </div>

                  {/* Metric 5 */}
                  <div className="bg-[#FAFAFA] rounded-xl p-4 border border-gray-100 flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#EAF3DE] flex items-center justify-center">
                      <Star size={16} className="text-[#6E9625]" />
                    </div>
                    <div>
                      <h4 className="text-[20px] font-black text-[#1C2C1C] leading-none mb-1">
                        {typeof stats.averageRating === 'object' ? stats.averageRating?.value : (stats.averageRating ?? 0)}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium mb-2">Average rating</p>
                      <p className="text-[10px] font-bold text-[#6E9625] flex items-center gap-1">↑ {typeof stats.averageRating === 'object' ? (stats.averageRating?.trendPercentage ?? stats.averageRating?.trendChange ?? 0) : 0} <span className="text-gray-400 font-normal">vs last 30 days</span></p>
                    </div>
                  </div>

                  {/* Metric 6 */}
                  <div className="bg-[#FAFAFA] rounded-xl p-4 border border-gray-100 flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#EAF3DE] flex items-center justify-center">
                      <MessageSquare size={16} className="text-[#6E9625]" />
                    </div>
                    <div>
                      <h4 className="text-[20px] font-black text-[#1C2C1C] leading-none mb-1">
                        {typeof stats.responseRate === 'object' ? stats.responseRate?.value : (stats.responseRate ?? 0)}%
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium mb-2">Response rate</p>
                      <p className="text-[10px] font-bold text-[#6E9625] flex items-center gap-1">↑ {typeof stats.responseRate === 'object' ? stats.responseRate?.trendPercentage : 0}% <span className="text-gray-400 font-normal">vs last 30 days</span></p>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
