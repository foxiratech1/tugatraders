"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiGlobe,
  FiChevronDown,
  FiLogIn,
  FiMenu,
  FiX,
  FiUserPlus,
} from "react-icons/fi";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  // Hide navbar on auth screens
  if (pathname?.startsWith("/auth")) {
    return null;
  }

  const toggleMenu = () => setIsOpen(!isOpen);

  const closeMenu = () => {
    setIsOpen(false);
    setLoginOpen(false);
    setSignupOpen(false);
  };

  const navLinks = [
    { href: "/post-job", label: "POST A JOB" },
    { href: "/directory-listing/search", label: "FIND A TRADER" },
    { href: "/trader-signup", label: "JOIN AS A TRADESPERSON" },
    { href: "/review", label: "LEAVE A REVIEW" },
  ];

  return (
    <nav className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-4">
      <div className="flex h-[64px] w-full max-w-[1400px] items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-4 sm:px-6 md:px-8 py-2 backdrop-blur-md shadow-sm relative z-50">
        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-3 flex-shrink-0"
          onClick={closeMenu}
        >
          <div className="relative h-8 w-[140px] sm:h-9 sm:w-[177px] overflow-hidden rounded-xl">
            <Image
              src="/logo.png"
              alt="TugaTrades Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden items-center gap-6 xl:gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[11px] xl:text-[12px] font-bold tracking-widest text-[#1d3321] hover:opacity-70 transition-opacity"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* DESKTOP ACTIONS */}
        <div className="hidden items-center gap-4 xl:gap-6 lg:flex">
          {/* LOGIN DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => {
                setLoginOpen(!loginOpen);
                setSignupOpen(false);
              }}
              className="flex items-center gap-2 rounded-[12px] bg-[#1d3321] px-5 py-2 xl:px-6 xl:py-2.5 text-[14px] font-bold text-white shadow-lg shadow-[#1d3321]/20 hover:bg-[#28462d] transition-all duration-300"
            >
              <FiLogIn size={18} />
              Log in
              <FiChevronDown size={14} />
            </button>

            {loginOpen && (
              <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                <button
                  onClick={() => {
                    router.push("/auth/login");
                    setLoginOpen(false);
                  }}
                  className="block w-full px-4 py-3 text-left text-sm font-medium hover:bg-gray-100"
                >
                  Customer
                </button>

                <button
                  onClick={() => {
                    router.push("/auth/login");
                    setLoginOpen(false);
                  }}
                  className="block w-full px-4 py-3 text-left text-sm font-medium hover:bg-gray-100"
                >
                  Trader
                </button>
              </div>
            )}
          </div>

          {/* SIGNUP DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => {
                setSignupOpen(!signupOpen);
                setLoginOpen(false);
              }}
              className="flex items-center gap-2 rounded-[12px] border border-[#C60C03] bg-[#C60C03] px-5 py-2 xl:px-6 xl:py-2.5 text-[14px] font-bold text-white hover:bg-[#d93b33] hover:border-[#d93b33] transition-all duration-300"
            >
              <FiUserPlus size={18} />
              Sign up
              <FiChevronDown size={14} />
            </button>

            {signupOpen && (
              <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                <button
                  onClick={() => {
                    router.push("/auth/signup");
                    setSignupOpen(false);
                  }}
                  className="block w-full px-4 py-3 text-left text-sm font-medium hover:bg-gray-100"
                >
                  Customer
                </button>

                <button
                  onClick={() => {
                    router.push("/auth/trader-signup");
                    setSignupOpen(false);
                  }}
                  className="block w-full px-4 py-3 text-left text-sm font-medium hover:bg-gray-100"
                >
                  Trader
                </button>
              </div>
            )}
          </div>

          {/* LANGUAGE */}
          <button className="flex items-center gap-1.5 text-[14px] font-bold text-[#1d3321] hover:opacity-70 transition-opacity">
            <FiGlobe size={18} />
            <span>EN</span>
            <FiChevronDown size={14} className="mt-0.5" />
          </button>
        </div>

        {/* MOBILE CONTROLS */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={toggleMenu}
            className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#1d3321] hover:bg-gray-50 transition-all shadow-sm"
            aria-label="Toggle Menu"
          >
            {isOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className="absolute top-[80px] left-4 right-4 z-40 rounded-[24px] border border-white/20 bg-[#e7ebe5]/95 p-6 backdrop-blur-lg shadow-xl flex flex-col gap-6 lg:hidden">
          {/* NAV LINKS */}
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="border-b border-[#1d3321]/5 pb-3 text-[14px] font-extrabold tracking-wider text-[#1d3321] hover:text-[#6e9625]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* LOGIN */}
          <div className="border-t border-[#1d3321]/10 pt-4">
            <h3 className="mb-3 font-bold text-[#1d3321]">Login</h3>

            <div className="flex flex-col gap-2">
              <Link
                href="/auth/login"
                onClick={closeMenu}
                className="rounded-lg bg-white px-4 py-3 text-sm font-medium"
              >
                For Customer
              </Link>

              <Link
                href="/auth/login"
                onClick={closeMenu}
                className="rounded-lg bg-white px-4 py-3 text-sm font-medium"
              >
                For Trader
              </Link>
            </div>
          </div>

          {/* SIGNUP */}
          <div>
            <h3 className="mb-3 font-bold text-[#1d3321]">Sign Up</h3>

            <div className="flex flex-col gap-2">
              <Link
                href="/auth/signup"
                onClick={closeMenu}
                className="rounded-lg bg-white px-4 py-3 text-sm font-medium"
              >
                For Customer
              </Link>

              <Link
                href="/auth/trader-signup"
                onClick={closeMenu}
                className="rounded-lg bg-white px-4 py-3 text-sm font-medium"
              >
                For Trader
              </Link>
            </div>
          </div>

          {/* LANGUAGE */}
          <div className="border-t border-[#1d3321]/10 pt-4">
            <button className="flex items-center gap-1.5 text-[14px] font-bold text-[#1d3321]">
              <FiGlobe size={18} />
              <span>ENGLISH (EN)</span>
              <FiChevronDown size={14} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}