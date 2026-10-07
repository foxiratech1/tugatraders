"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from '@/hooks/useAuth';
import { getUserRole } from '@/utils/auth';
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa6";
import { scrollToTop } from "@/utils/scroll";
import VettingModal from "@/components/modal/VettingModal";

export default function Footer() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isVettingModalOpen, setIsVettingModalOpen] = useState(false);
  const { role: authRole } = useAuth();
  // getUserRole() reads synchronously from localStorage, so the role is available
  // immediately on the first client render (no waiting for useEffect).
  const role = authRole || (mounted ? getUserRole() : null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by matching server/client initial render
  if (!mounted) {
    return null;
  }

  // Hide footer on all auth screens
  if (pathname?.startsWith("/auth")) {
    return null;
  }

  // Hide footer on customer dashboard pages
  if (pathname?.startsWith("/customer-dashboard")) {
    return null;
  }

  // Hide footer on trader dashboard pages
  if (pathname === "/trader" || pathname?.startsWith("/trader/")) {
    return null;
  }

  return (
    <footer className="w-full bg-white pt-20 pb-12 px-6 lg:px-12 border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto">

        {/* TOP SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">

          {/* BRAND COL */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-8">
              <div className="relative h-10 w-[200px]">
                <Image
                  src="/TugaLogo.png"
                  alt="TugaTrades Logo"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <h2 className="text-[18px] lg:text-[20px] font-bold text-[#1d3321] leading-tight mb-4">
              Connecting Customers With Independent<br /> Tradespeople Across Portugal
            </h2>
            <p className="text-[16px] text-[#1d3321] mb-8">contact@tugatraders.com</p>

            {/* SOCIALS */}
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 flex items-center justify-center rounded-[10px] bg-[#e6ebe3] text-[#1d3321] hover:bg-[#d7dfd1] transition-colors">
                <FaFacebookF size={18} />
              </Link>
              <Link href="#" className="w-10 h-10 flex items-center justify-center rounded-[10px] bg-[#e6ebe3] text-[#1d3321] hover:bg-[#d7dfd1] transition-colors">
                <FaInstagram size={18} />
              </Link>
              <Link href="#" className="w-10 h-10 flex items-center justify-center rounded-[10px] bg-[#e6ebe3] text-[#1d3321] hover:bg-[#d7dfd1] transition-colors">
                <FaTiktok size={18} />
              </Link>
            </div>
          </div>

          {/* LINKS GRID */}
          <div className={`lg:col-span-8 grid grid-cols-2 md:grid-cols-3 ${role ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-8`}>

            {/* CUSTOMERS */}
            {role !== "trader" && (
              <div>
                <h3 className="text-[16px] font-bold text-[#1d3321] mb-6">Customers</h3>
                <ul className="flex flex-col gap-4">
                  <li><Link href="/directory-listing/search" onClick={() => scrollToTop()} className="text-[14px] font-medium text-[#1d3321] hover:text-[#4a8c3f] transition-colors">Find a Tradesperson</Link></li>
                  <li><Link href="/post-job" onClick={() => scrollToTop()} className="text-[14px] font-medium text-[#1d3321] hover:text-[#4a8c3f] transition-colors">Post a Job</Link></li>
                  <li><Link href="/review" onClick={() => scrollToTop()} className="text-[14px] font-medium text-[#1d3321] hover:text-[#4a8c3f] transition-colors">Leave a Review</Link></li>
                  <li><Link href="/terms?tab=trust" onClick={() => scrollToTop()} className="text-[14px] font-medium text-[#1d3321] hover:text-[#4a8c3f] transition-colors">Trust & Safety</Link></li>
                  <li><Link href="/faq" onClick={() => scrollToTop()} className="text-[14px] font-medium text-[#1d3321] hover:text-[#4a8c3f] transition-colors">FAQs</Link></li>
                </ul>
              </div>
            )}

            {/* TRADESPEOPLE */}
            {role !== "customer" && (
              <div>
                <h3 className="text-[16px] font-bold text-[#1d3321] mb-6">Tradespeople</h3>
                <ul className="flex flex-col gap-4">
                  {role?.toLowerCase() !== "trader" && (
                    <li><Link href="/trader-signup" onClick={() => scrollToTop()} className="text-[14px] font-medium text-[#1d3321] hover:text-[#4a8c3f] transition-colors">Join TugaTrades</Link></li>
                  )}
                  <li>
                    <Link href="/#how-it-works" scroll={true} onClick={(e) => {
                      const el = document.getElementById('how-it-works');
                      if (el) {
                        e.preventDefault();
                        const y = el.getBoundingClientRect().top + window.scrollY - 80;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                      }
                    }} className="text-[14px] font-medium text-[#1d3321] hover:text-[#4a8c3f] transition-colors">How It Works</Link>
                  </li>
                  <li>
                    <button onClick={() => setIsVettingModalOpen(true)} className="text-[14px] font-medium text-[#1d3321] hover:text-[#4a8c3f] transition-colors text-left">Vetting Process</button>
                  </li>
                  <li><Link href="/terms?tab=traderAgreement" onClick={() => scrollToTop()} className="text-[14px] font-medium text-[#1d3321] hover:text-[#4a8c3f] transition-colors">Trader Agreement</Link></li>
                  <li><Link href="/faq?tab=traders" onClick={() => scrollToTop()} className="text-[14px] font-medium text-[#1d3321] hover:text-[#4a8c3f] transition-colors">FAQs</Link></li>
                </ul>
              </div>
            )}

            {/* COMPANY */}
            <div>
              <h3 className="text-[16px] font-bold text-[#1d3321] mb-6">Company</h3>
              <ul className="flex flex-col gap-4">
                <li><Link href="/about" onClick={() => scrollToTop()} className="text-[14px] font-medium text-[#1d3321] hover:text-[#4a8c3f] transition-colors">About</Link></li>
                <li><Link href="/contact" onClick={() => scrollToTop()} className="text-[14px] font-medium text-[#1d3321] hover:text-[#4a8c3f] transition-colors">Contact</Link></li>
                <li><Link href="/terms?tab=trust" onClick={() => scrollToTop()} className="text-[14px] font-medium text-[#1d3321] hover:text-[#4a8c3f] transition-colors">Trust & Safety Policy</Link></li>
                <li><Link href="/terms?tab=disputes" onClick={() => scrollToTop()} className="text-[14px] font-medium text-[#1d3321] hover:text-[#4a8c3f] transition-colors">Dispute Resolution</Link></li>
              </ul>
            </div>

            {/* LEGAL */}
            <div>
              <h3 className="text-[16px] font-bold text-[#1d3321] mb-6">Legal</h3>
              <ul className="flex flex-col gap-4">
                <li><Link href="/terms" onClick={() => scrollToTop()} className="text-[14px] font-medium text-[#1d3321] hover:text-[#4a8c3f] transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/terms?tab=cookies" onClick={() => scrollToTop()} className="text-[14px] font-medium text-[#1d3321] hover:text-[#4a8c3f] transition-colors">Privacy & Cookies Policy</Link></li>
                <li><Link href="/terms?tab=review" onClick={() => scrollToTop()} className="text-[14px] font-medium text-[#1d3321] hover:text-[#4a8c3f] transition-colors">Review Policy</Link></li>
              </ul>
            </div>

          </div>
        </div>

        {/* DIVIDER */}
        <div className="h-[1px] w-full bg-[#C9CBC7] mb-8" />

        {/* BOTTOM LINKS */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4 mb-8">
          {[
            "Terms & Conditions",
            "Privacy & Cookies",
            "Cookie Settings",
            "Trust & Safety",
            "Disputes",
            "Content Moderation",
            "Trader Agreement"
          ].map((link, i, arr) => (
            <div key={link} className="flex items-center gap-6">
              <Link
                href={
                  link === "Terms & Conditions"
                    ? "/terms"
                    : link === "Privacy & Cookies"
                      ? "/terms?tab=cookies"
                      : link === "Cookie Settings"
                        ? "/terms?tab=cookieSettings"
                        : link === "Trust & Safety"
                          ? "/terms?tab=trust"
                          : link === "Disputes"
                            ? "/terms?tab=disputes"
                            : link === "Content Moderation"
                              ? "/terms?tab=moderation"
                              : link === "Trader Agreement"
                                ? "/terms?tab=traderAgreement"
                                : "#"
                }
                scroll={false}
                onClick={() => scrollToTop()}
                className="text-[13px] font-medium text-[#243A24] hover:text-[#1d3321] transition-colors"
              >
                {link}
              </Link>
              {i < arr.length - 1 && <div className="h-3 w-[1px] bg-gray-300" />}
            </div>
          ))}
        </div>

        {/* DISCLAIMER */}
        <p className="text-[13px] text-[#6F736C] font-normal leading-relaxed  mb-12">
          TugaTrades connects clients with independent tradespeople. We do not employ or manage traders. All work, agreements, and payments are made directly between <br /> users. We are not responsible for services provided or agreements made.
        </p>

        {/* COPYRIGHT */}
        <div className="text-center border-t border-gray-50 pt-12">
          <p className="text-[13px] font-bold text-[#243A24] leading-loose">
            TugaTrades, registered in Portugal under number [XXXX],<br />
            [Address] Copyright 2026, TugaTrades. All Rights Reserved
          </p>
        </div>

      </div>
      <VettingModal isOpen={isVettingModalOpen} onClose={() => setIsVettingModalOpen(false)} />
    </footer>
  );
}
