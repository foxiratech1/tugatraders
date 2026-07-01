import React from 'react';
import Image from 'next/image';
import { UserPlus } from 'lucide-react';

const SecureJobsBanner = () => {
  return (
    <section className="relative w-full h-[240px] md:h-[260px] overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hands.png"
          alt="Secure Jobs"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0A1A10]/65" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full max-w-[1240px] mx-auto px-6 lg:px-14 flex flex-col md:flex-row items-center justify-between gap-4 py-6 md:py-0">

        <div className="flex flex-col gap-2 text-center md:text-left max-w-[520px]">
          <h2 className="text-[26px] md:text-[36px] font-bold text-white leading-[1.08]" style={{ fontFamily: "var(--font-bricolage)" }}>
            Secure The <span className="text-[#6E9625]">Right Jobs,</span> <br className="hidden md:block" />
            Effortlessly.
          </h2>
          <p className="text-[13px] md:text-[15px] text-white/70 font-medium leading-relaxed">
            TugaTrades connects you with clients actively looking for <br className="hidden lg:block" />
            your skills and ready to hire.
          </p>
        </div>

        <button className="bg-[#C60C03] text-white px-6 py-3 rounded-[12px] font-bold text-[14px] flex items-center gap-2.5 transition-all hover:scale-[1.02] shadow-xl group">
          <UserPlus size={18} className="transition-transform group-hover:scale-110" />
          Join as a Tradesperson
        </button>

      </div>
    </section>
  );
};

export default SecureJobsBanner;
