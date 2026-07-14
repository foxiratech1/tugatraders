"use client";

import Image from "next/image";
import Link from "next/link";
import { getUserRole } from '@/utils/auth';
import { Role } from '@/utils/role';
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa6";
import { scrollToTop } from "@/utils/scroll";
import VettingModal from "@/components/modal/VettingModal";

export default function Footer() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [isVettingModalOpen, setIsVettingModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRole(getUserRole());
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
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block mb-8">
              <div className="relative h-10 w-[200px]">
                <Image
                  src="/logo.png"
                  alt="TugaTrades Logo"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <h2 className="text-[20px] lg:text-[28px] font-bold text-[#243A24] leading-tight mb-8 ">
              Portugal&apos;s Network of vetted<br /> Trade Professionals
            </h2>

            {/* SOCIALS */}
            <div className="flex gap-4">
              <Link href="#" className="w-12 h-12 flex items-center justify-center rounded-[14px] bg-[#d7dfd1] text-[#1d3321] hover:bg-[#c5cdc0] transition-colors">
                <FaFacebookF size={20} />
              </Link>
              <Link href="#" className="w-12 h-12 flex items-center justify-center rounded-[14px] bg-[#d7dfd1] text-[#1d3321] hover:bg-[#c5cdc0] transition-colors">
                <FaInstagram size={20} />
              </Link>
              <Link href="#" className="w-12 h-12 flex items-center justify-center rounded-[14px] bg-[#d7dfd1] text-[#1d3321] hover:bg-[#c5cdc0] transition-colors">
                <FaTiktok size={20} />
              </Link>
            </div>
          </div>

          {/* LINKS GRID */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-12 lg:gap-8">

            {/* CUSTOMERS */}
            <div>
              <h3 className="text-[18px] font-[800] text-[#243A24] mb-6">Customers</h3>
              <ul className="flex flex-col gap-4">
                {["Post a job", "Find a tradesperson", "How it works", "Vetting & badges", "FAQs"].map((link) => (
                  <li key={link}>
                    <Link
                      href={link === "FAQs" ? "/faq" : link === "Find a tradesperson" ? "/directory-listing" : link === "Post a job" ? "/post-job" : link === "How it works" ? "/#how-it-works" : "#"}
                      scroll={link === "How it works" ? true : false}
                      onClick={(e) => {
                        if (link === "How it works") {
                          const el = document.getElementById('how-it-works');
                          if (el) {
                            e.preventDefault();
                            const y = el.getBoundingClientRect().top + window.scrollY - 80;
                            window.scrollTo({ top: y, behavior: 'smooth' });
                          }
                        } else if (link === "Vetting & badges") {
                          e.preventDefault();
                          setIsVettingModalOpen(true);
                        } else {
                          scrollToTop();
                        }
                      }}
                      className="text-[15px] font-medium text-[#6F736C] hover:text-[#4a8c3f] transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* TRADESPERSON */}
            <div>
              <h3 className="text-[18px] font-[800] text-[#243A24] mb-6">Tradesperson</h3>
              <ul className="flex flex-col gap-4">
                {["Join as a tradesperson", "How it works", "How vetting works", "Trader Agreement", "FAQs"].map((link) => (
                  <li key={link}>
                    <Link
                      href={
                        link === "FAQs"
                          ? "/faq?tab=traders"
                          : link === "Join as a tradesperson"
                            ? "/trader-signup"
                            : link === "How vetting works"
                              ? "/trader-signup#vetting-section"
                              : link === "Trader Agreement"
                                ? "/terms?tab=traderAgreement"
                                : "#"
                      }
                      scroll={link === "How vetting works" ? true : false}
                      onClick={(e) => {
                        if (link === "How vetting works") {
                          const el = document.getElementById('vetting-section');
                          if (el) {
                            e.preventDefault();
                            const y = el.getBoundingClientRect().top + window.scrollY - 80;
                            window.scrollTo({ top: y, behavior: 'smooth' });
                          }
                        } else {
                          scrollToTop();
                        }
                      }}
                      className="text-[15px] font-medium text-[#6F736C] hover:text-[#4a8c3f] transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* TUGATRADES */}
            <div>
              <h3 className="text-[18px] font-[800] text-[#243A24] mb-6">TugaTrades</h3>
              <ul className="flex flex-col gap-4">
                {["About", "Contact", "Legal"].map((link) => (
                  <li key={link}>
                    <Link
                      href={link === "About" ? "/about" : link === "Contact" ? "/contact" : link === "Legal" ? "/terms" : "#"}
                      scroll={false}
                      onClick={() => scrollToTop()}
                      className="text-[15px] font-medium text-[#6F736C] hover:text-[#4a8c3f] transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
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
                    : link === "Cookie Settings"
                      ? "/terms?tab=cookieSettings"
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
