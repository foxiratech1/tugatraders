"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Image as ImageIcon, ShieldCheck, Lightbulb, Star, ArrowRight, Loader2 } from "lucide-react";
import { getRegistrationStatus, authApi } from "@/app/api/authApi";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// ─── Circular progress SVG ───────────────────────────────────────────────────
function CircularProgress({ percent }: { percent: number }) {
  const r = 52;
  const cx = 64;
  const cy = 64;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-[128px] h-[128px]">
      <svg width="128" height="128" viewBox="0 0 128 128" className="absolute inset-0 flex-shrink-0">
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#E5E5E5"
          strokeWidth="12"
        />
        {/* Progress */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#6E9625"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="relative z-10 flex items-baseline justify-center text-[#1C2C1C]">
        <span className="text-[26px] font-black">{percent}</span>
        <span className="text-[14px] font-bold ml-[1px]">%</span>
      </div>
    </div>
  );
}

// ─── Progress bar row ────────────────────────────────────────────────────────
function ProgressRow({
  icon,
  label,
  percent,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  percent?: number;
  status?: string;
}) {
  const completed = percent === 100;
  return (
    <div className="flex items-start gap-4 py-4 border-b border-[#F5F5F5] last:border-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${completed ? "bg-[#6E9625]/15 text-[#6E9625]" : "bg-[#F5F5F5] text-[#1C2C1C]/40"}`}>
        {icon}
      </div>
      <div className="flex-1 flex flex-col gap-2.5 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-[#1C2C1C]">{label}</span>
          {completed ? (
            <span className="text-[12px] font-bold text-[#6E9625]">100%</span>
          ) : (
            <span className="text-[12px] font-semibold text-[#F5792A]">{status || "Action Required"}</span>
          )}
        </div>
        <div className="h-[5px] bg-[#E5E5E5] rounded-full overflow-hidden w-full">
          {completed && (
            <div className="h-full bg-[#6E9625] rounded-full w-full" />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Guide milestone ─────────────────────────────────────────────────────────
function GuideMilestone({
  range,
  title,
  description,
  completed,
}: {
  range: string;
  title: string;
  description: string;
  completed: boolean;
}) {
  return (
    <div className="flex gap-3 py-3 items-center">
      <div className="flex flex-col items-center pt-0.5">
        <div
          className={`w-3 h-3 rounded-full flex-shrink-0 ${completed
            ? "bg-[#6E9625]"
            : "bg-[#D0D0D0]"
            }`}
        />
      </div>
      <div>
        <p className="text-[13px] font-bold text-[#1C2C1C]">
          <span className="text-[#1C2C1C]/50 font-semibold mr-1.5">{range}</span>
          {title}
        </p>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────────
export default function TraderDashboard() {
  const [data, setData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, profileRes] = await Promise.all([
          getRegistrationStatus().catch(() => null),
          import("@/app/api/authApi").then(mod => mod.authApi.getMyProfile()).catch(() => null)
        ]);
        setData(statusRes?.data || statusRes);
        setProfile(profileRes?.data || profileRes);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="animate-spin text-[#6E9625]" size={40} />
      </div>
    );
  }

  const overallPercentage = data?.profileCompletion?.overallPercentage || 0;
  const stages = data?.profileCompletion?.stages || [];
  const completedSteps = stages.filter((s: any) => s.isCompleted).length;
  const totalSteps = stages.length;

  const rawProfile = profile?.data?.data || profile?.data || profile;
  
  // The backend API `getPublicTraderProfileById` actually expects the User ID
  // (which is `rawProfile?.id`), rather than the Trader Profile's internal ID.
  const profileId = rawProfile?.id || rawProfile?._id || data?.id || rawProfile?.traderProfile?.userId || "";

  return (
    <div className="max-w-[1100px] mx-auto ">
      {/* Page heading */}
      <h1 className="text-[22px] font-bold text-[#1C2C1C] mb-6">Trader Dashboard</h1>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* ── LEFT COLUMN ──────────────────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* Complete Your Profile card */}
          <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(28,44,28,0.07)] border border-[#E5E5E5] p-6 sm:p-8 flex items-center gap-8">
            <CircularProgress percent={overallPercentage} />

            <div className="flex-1 min-w-0">
              <h2 className="text-[24px] sm:text-[28px] font-black text-[#1C2C1C] leading-tight mb-2">
                Complete Your Profile
              </h2>
              <p className="text-[14px] text-[#1C2C1C]/60 leading-relaxed mb-6 max-w-[460px]">
                A complete profile helps you build trust, get more jobs, and
                increase customer confidence across the marketplace.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/trader/profile"
                  className="inline-flex items-center gap-2 bg-[#1C2C1C] text-white text-[13px] font-bold px-5 py-3 rounded-full hover:bg-[#2C4A2C] transition-colors"
                >
                  Continue Setup
                  <ArrowRight size={15} />
                </Link>
                
                {profileId ? (
                  <button
                    onClick={async () => {
                      if (!profileId || profileId.trim() === "") {
                        alert("Error: profileId is empty before calling API!");
                        return;
                      }
                      try {
                        setChecking(true);
                        // Explicitly check the string value
                        console.log("Calling getPublicTraderProfileById with:", profileId);
                        await authApi.getPublicTraderProfileById(profileId.trim());
                        router.push(`/profile/${profileId.trim()}`);
                      } catch (err: any) {
                        console.error("API error:", err);
                        alert(`Failed to fetch public profile for ID: '${profileId}'. Error: ${err?.message || 'Unknown'}`);
                      } finally {
                        setChecking(false);
                      }
                    }}
                    disabled={checking}
                    className="text-[13px] font-semibold text-[#1C2C1C]/60 hover:text-[#1C2C1C] transition-colors disabled:opacity-50"
                  >
                    {checking ? "Checking..." : "View Public Profile"}
                  </button>
                ) : (
                  <span className="text-[13px] font-semibold text-[#1C2C1C]/40">
                    View Public Profile (ID missing)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Strength Tracker card */}
          <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(28,44,28,0.07)] border border-[#E5E5E5] p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-bold text-[#1C2C1C]">Profile Strength Tracker</h2>
              <span className="text-[13px] font-medium text-[#1C2C1C]/50">{completedSteps} of {totalSteps} steps completed</span>
            </div>

            <div className="mt-4">
              {stages.map((stage: any) => (
                <ProgressRow
                  key={stage.id}
                  icon={stage.isCompleted ? <CheckCircle2 size={16} className="text-[#6E9625]" /> : <ShieldCheck size={16} className="text-[#1C2C1C]/40" />}
                  label={stage.title}
                  percent={stage.isCompleted ? 100 : 0}
                  status={stage.isCompleted ? "Completed" : "Action Required"}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* Completion Guide card */}
          <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(28,44,28,0.07)] border border-[#E5E5E5] p-6">
            <h2 className="text-[15px] font-bold text-[#1C2C1C] mb-1">Completion Guide</h2>
            <div className="mt-3 divide-y divide-[#F5F5F5]">
              {stages.map((stage: any) => (
                <GuideMilestone
                  key={stage.id}
                  range={stage.range}
                  title={stage.title}
                  description=""
                  completed={stage.isCompleted}
                />
              ))}
            </div>
          </div>

          {/* Why Complete Your Profile card */}
          <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(28,44,28,0.07)] border border-[#E5E5E5] p-6">
            <div className="w-10 h-10 bg-[#F5F5F5] rounded-xl flex items-center justify-center mb-4">
              <Lightbulb size={20} className="text-[#1C2C1C]" />
            </div>
            <h2 className="text-[15px] font-bold text-[#1C2C1C] mb-3">
              Why Complete Your Profile?
            </h2>
            <ul className="flex flex-col gap-2.5">
              <li className="flex items-start gap-2 text-[13px] text-[#1C2C1C]/70">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#1C2C1C]/30 flex-shrink-0" />
                Get up to 3x more job invitations from clients.
              </li>
              <li className="flex items-start gap-2 text-[13px] text-[#1C2C1C]/70">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#1C2C1C]/30 flex-shrink-0" />
                Build instant trust with verified badges.
              </li>
              <li className="flex items-start gap-2 text-[13px] text-[#1C2C1C]/70">
                <Star size={13} className="text-[#6E9625] flex-shrink-0 mt-0.5" />
                Stand out in marketplace search results.
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
