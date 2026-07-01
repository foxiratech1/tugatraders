import React from "react";
import { Hammer } from "lucide-react";

export default function AccountComingSoon() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center mt-[60px]">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full">
        <div className="w-20 h-20 bg-[#F0F9F1] rounded-full flex items-center justify-center mx-auto mb-6">
          <Hammer size={32} className="text-[#6E9625]" />
        </div>
        <h1 className="text-[24px] font-bold text-[#1C2C1C] mb-2">Under Construction</h1>
        <p className="text-gray-500 text-[14px] leading-relaxed">
          The Account settings page is currently being built. Please check back later!
        </p>
      </div>
    </div>
  );
}
