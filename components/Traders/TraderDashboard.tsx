"use client";

import Link from "next/link";
import { CheckCircle2, Image as ImageIcon, ShieldCheck, Lightbulb, Star, ArrowRight } from "lucide-react";

// ─── Circular progress SVG ───────────────────────────────────────────────────
function CircularProgress({ percent }: { percent: number }) {
  const r = 52;
  const cx = 64;
  const cy = 64;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width="128" height="128" viewBox="0 0 128 128" className="flex-shrink-0">
      {/* Track */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#E5E5E5"
        strokeWidth="10"
      />
      {/* Progress */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#6E9625"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      {/* Label */}
      <text
        x={cx} y={cy - 4}
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-black"
        fill="#1C2C1C"
        fontSize="22"
        fontWeight="800"
      >
        {percent}
      </text>
      <text
        x={cx + 18} y={cy + 8}
        textAnchor="middle"
        fill="#1C2C1C"
        fontSize="12"
        fontWeight="600"
      >
        %
      </text>
    </svg>
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
    <div className="flex items-center gap-4 py-4 border-b border-[#F0EDE8] last:border-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${completed ? "bg-[#6E9625]/15" : "bg-[#F5F5F5]"}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] font-semibold text-[#1C2C1C]">{label}</span>
          {completed ? (
            <span className="text-[12px] font-bold text-[#6E9625]">100%</span>
          ) : (
            <span className="text-[12px] font-semibold text-[#F5792A]">{status}</span>
          )}
        </div>
        <div className="h-[5px] bg-[#F0EDE8] rounded-full overflow-hidden">
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
    <div className="flex gap-3 py-2.5">
      <div className="flex flex-col items-center pt-0.5">
        <div
          className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${completed
            ? "bg-[#6E9625] border-[#6E9625]"
            : "bg-white border-[#D0D0D0]"
            }`}
        />
      </div>
      <div>
        <p className="text-[12px] font-bold text-[#1C2C1C]">
          <span className="text-[#1C2C1C]/50 font-semibold mr-1">{range}</span>
          {title}
        </p>
        <p className="text-[11px] text-[#1C2C1C]/50 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────────
export default function TraderDashboard() {
  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Page heading */}
      <h1 className="text-[22px] font-bold text-[#1C2C1C] mb-6">Trader Dashboard</h1>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* ── LEFT COLUMN ──────────────────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* Complete Your Profile card */}
          <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(28,44,28,0.07)] border border-[#E5E5E5] p-6 sm:p-8 flex items-center gap-8">
            <CircularProgress percent={75} />

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
                <Link
                  href=""
                  className="text-[13px] font-semibold text-[#1C2C1C]/60 hover:text-[#1C2C1C] transition-colors"
                >
                  View Public Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Profile Strength Tracker card */}
          <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(28,44,28,0.07)] border border-[#E5E5E5] p-6 sm:p-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[16px] font-bold text-[#1C2C1C]">Profile Strength Tracker</h2>
              <span className="text-[12px] font-semibold text-[#1C2C1C]/50">8 of 10 steps completed</span>
            </div>

            <div className="mt-4">
              <ProgressRow
                icon={<CheckCircle2 size={16} className="text-[#6E9625]" />}
                label="Business Details"
                percent={100}
              />
              <ProgressRow
                icon={<CheckCircle2 size={16} className="text-[#6E9625]" />}
                label="Services & Skills"
                percent={100}
              />
              <ProgressRow
                icon={<ImageIcon size={16} className="text-[#1C2C1C]/40" />}
                label="Portfolio Photos"
                status="Action Required"
              />
              <ProgressRow
                icon={<ShieldCheck size={16} className="text-[#1C2C1C]/40" />}
                label="Identity Verification"
                status="Action Required"
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* Completion Guide card */}
          <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(28,44,28,0.07)] border border-[#E5E5E5] p-6">
            <h2 className="text-[15px] font-bold text-[#1C2C1C] mb-1">Completion Guide</h2>
            <div className="mt-3 divide-y divide-[#F5F5F5]">
              <GuideMilestone
                range="0-25%"
                title="Sign-up"
                description="Basic account details provided."
                completed={true}
              />
              <GuideMilestone
                range="25-50%"
                title="Requirements"
                description="Business info and services added."
                completed={true}
              />
              <GuideMilestone
                range="50-65%"
                title="Admin Approval"
                description="Initial review completed."
                completed={true}
              />
              <GuideMilestone
                range="65-80%"
                title="Portfolio"
                description="Upload work examples."
                completed={false}
              />
              <GuideMilestone
                range="90-100%"
                title="Verification"
                description="Identity and documents verified."
                completed={false}
              />
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
