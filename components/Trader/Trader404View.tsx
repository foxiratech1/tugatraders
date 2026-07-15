"use client";

import Link from "next/link";
import { Home, Wrench, Hammer } from "lucide-react";

interface Trader404ViewProps {
  title?: string;
  subtitle?: string;
}

export default function Trader404View({
  title = "Page Not Found",
  subtitle = "We can't seem to find the page you are looking for. It might have been moved, renamed, or is temporarily unavailable.",
}: Trader404ViewProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-between p-6 md:p-10 relative overflow-hidden bg-[#F7F9F5] min-h-[calc(100vh-96px)]">
      {/* Subtle Grid Background Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `radial-gradient(#C8DCAB 1.2px, transparent 1.2px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Faint Decorative Background Outlines */}
      <div className="absolute top-12 left-10 text-[#557323]/15 -rotate-12 pointer-events-none hidden sm:block animate-float-slow">
        <Hammer size={72} strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-16 right-12 text-[#557323]/15 rotate-45 pointer-events-none hidden sm:block animate-float">
        <Wrench size={72} strokeWidth={1.5} />
      </div>

      <div className="my-auto w-full max-w-lg relative z-10 animate-fade-in-up">
        {/* Main Card Container */}
        <div className="bg-white rounded-[32px] p-8 sm:p-12 shadow-[0_12px_48px_rgba(0,0,0,0.05)] border border-[#E2EBD5] text-center relative overflow-hidden">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-6 rounded-full bg-[#EEF4E5] border border-[#D2E3B8] text-[#4A6620] text-[11px] font-bold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#5D8226] animate-pulse" />
            SYSTEM ERROR
          </div>

          {/* Retro 404 Sad Display Artwork */}
          <div className="flex justify-center mb-7 select-none">
            <svg
              width="260"
              height="100"
              viewBox="0 0 260 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="max-w-full drop-shadow-sm"
            >
              {/* Left Block 4 */}
              <path
                d="M 12 10 H 38 V 48 H 68 V 68 H 38 V 92 H 12 V 68 H 0 V 48 L 12 10 Z M 12 48 H 38 V 30 L 22 48 H 12 Z"
                fill="#24341B"
              />

              {/* Center Monitor Screen (0) */}
              <rect x="82" y="8" width="96" height="84" rx="20" fill="#3D541B" />
              <rect x="92" y="18" width="76" height="64" rx="14" fill="#5D8226" />

              {/* Eyes */}
              <rect x="108" y="34" width="12" height="14" rx="3" fill="#1C2C1C" />
              <rect x="140" y="34" width="12" height="14" rx="3" fill="#1C2C1C" />

              {/* Sad Mouth Arc */}
              <path
                d="M 114 62 Q 130 50 146 62"
                stroke="#1C2C1C"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Right Block 4 */}
              <path
                d="M 204 10 H 230 V 48 H 260 V 68 H 230 V 92 H 204 V 68 H 192 V 48 L 204 10 Z M 204 48 H 230 V 30 L 214 48 H 204 Z"
                fill="#24341B"
              />
            </svg>
          </div>

          {/* Page Not Found Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C2C1C] mb-3 tracking-tight font-heading">
            {title}
          </h1>

          {/* Description Subtitle */}
          <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            {subtitle}
          </p>

          {/* Button */}
          <div className="flex justify-center">
            <Link
              href="/trader"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[#1C2C1C] hover:bg-[#2B3E1D] text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Home size={17} />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Footer copyright note matching image */}
      <footer className="relative z-10 pt-4 pb-2 text-center text-xs text-gray-400 font-medium">
        © 2026 • Tuga Trades Admin
      </footer>
    </div>
  );
}
