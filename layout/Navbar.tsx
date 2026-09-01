"use client";

import { useState, useRef, useEffect } from "react";
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
  FiGrid,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { clearTokens } from "@/utils/auth";
import { authApi } from "@/app/api/authApi";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, role, user } = useAuth();
  const isCustomer = role === "customer";
  const isTrader = role === "trader";

  const [isOpen, setIsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch profile when authenticated user visits public pages
  useEffect(() => {
    if (!isAuthenticated) return;
    const loadProfile = async () => {
      try {
        const res = await authApi.getMyProfile();
        setProfile(res?.data || res);
      } catch (error) {
        console.error("Failed to load profile for navbar", error);
      }
    };
    loadProfile();
  }, [isAuthenticated]);

  // Hide navbar on auth screens
  if (pathname?.startsWith("/auth")) {
    return null;
  }

  const toggleMenu = () => setIsOpen(!isOpen);

  const closeMenu = () => {
    setIsOpen(false);
    setLoginOpen(false);
    setSignupOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = async () => {
    closeMenu();
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout API error", err);
    }
    localStorage.removeItem("user");
    clearTokens();
    window.location.replace("/");
  };

  const navLinks = [
    ...(isTrader ? [] : [{ href: "/post-job", label: "POST A JOB" }]),
    ...(isTrader ? [] : [{ href: "/directory-listing/search", label: "FIND A TRADER" }]),
    ...(isCustomer || isTrader ? [] : [{ href: "/trader-signup", label: "JOIN AS A TRADESPERSON" }]),
    ...(isTrader ? [] : [{ href: "/review", label: "LEAVE A REVIEW" }]),
  ];

  // Build profile image URL — prefer API-fetched profile, then localStorage user
  const profileData = profile || user;
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.fullName || (isTrader ? "Trader" : "Customer"))}&background=1d3321&color=fff&bold=true`;
  const imageUrl = profileData?.profileImage
    ? new URL(profileData.profileImage, process.env.NEXT_PUBLIC_API_URL).toString()
    : fallbackAvatar;

  return (
    <nav className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-4">
      <div className="flex h-[64px] w-full max-w-[1400px] items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-4 sm:px-6 md:px-8 py-2 backdrop-blur-md shadow-sm relative z-50">
        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-3 flex-shrink-0"
          onClick={closeMenu}
        >
          <div className="relative h-12 w-[200px] sm:h-[50px] sm:w-[220px] overflow-hidden">
            <Image
              src="/TugaLogo.png"
              alt="TugaTrades Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden items-center gap-6 xl:gap-8 xl:flex">
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
        <div className="hidden items-center gap-4 xl:gap-6 xl:flex">
          {isAuthenticated ? (
            <>


              {/* PROFILE DROPDOWN */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => {
                    setProfileOpen(!profileOpen);
                    setLoginOpen(false);
                    setSignupOpen(false);
                  }}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 border-2 border-[#E5E7EB]">
                    <img
                      src={imageUrl}
                      alt={profileData?.fullName || "User"}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className="text-[13px] font-bold text-[#1d3321] hidden xl:inline">
                    {profileData?.fullName?.split(" ")[0] || "Account"}
                  </span>
                  <FiChevronDown
                    size={14}
                    className={`text-[#1d3321] transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                    <Link
                      href={isTrader ? "/trader" : "/customer-dashboard/jobs"}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium hover:bg-gray-100 text-[#1d3321]"
                    >
                      <FiGrid size={16} />
                      My Dashboard
                    </Link>
                    <Link
                      href={isTrader ? "/trader/profile" : "/customer-dashboard/profile"}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium hover:bg-gray-100 text-[#1d3321]"
                    >
                      <FiUser size={16} />
                      My Profile
                    </Link>
                    <div className="h-[1px] bg-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <FiLogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* LOGIN BUTTON */}
              <div className="relative">
                <button
                  onClick={() => router.push("/auth/login")}
                  className="flex items-center gap-2 rounded-[12px] bg-[#1d3321] px-5 py-2 xl:px-6 xl:py-2.5 text-[14px] font-bold text-white shadow-lg shadow-[#1d3321]/20 hover:bg-[#28462d] transition-all duration-300"
                >
                  <FiLogIn size={18} />
                  Log in
                </button>
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
                      Traders
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* LANGUAGE */}
          <button className="flex items-center gap-1.5 text-[14px] font-bold text-[#1d3321] hover:opacity-70 transition-opacity">
            <FiGlobe size={18} />
            <span>EN</span>
            <FiChevronDown size={14} className="mt-0.5" />
          </button>
        </div>

        {/* MOBILE CONTROLS */}
        <div className="flex items-center gap-3 xl:hidden">
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
        <div className="absolute top-[80px] left-4 right-4 z-40 rounded-[24px] border border-white/20 bg-[#e7ebe5]/95 p-6 backdrop-blur-lg shadow-xl flex flex-col gap-6 xl:hidden">
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

          {isAuthenticated ? (
            <>
              {/* AUTHENTICATED USER — MOBILE */}
              <div className="border-t border-[#1d3321]/10 pt-4">
                {/* Profile summary */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-[#1d3321]/10">
                    <img
                      src={imageUrl}
                      alt={profileData?.fullName || "User"}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#1d3321]">
                      {profileData?.fullName || (isTrader ? "Trader" : "Customer")}
                    </p>
                    <p className="text-[12px] text-[#1d3321]/50 capitalize">{role || "User"}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href={isTrader ? "/trader" : "/customer-dashboard/jobs"}
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-lg bg-[#1d3321] px-4 py-3 text-sm font-bold text-white"
                  >
                    <FiGrid size={16} />
                    My Dashboard
                  </Link>

                  <Link
                    href={isTrader ? "/trader/profile" : "/customer-dashboard/profile"}
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-medium text-[#1d3321]"
                  >
                    <FiUser size={16} />
                    My Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-medium text-red-600"
                  >
                    <FiLogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* LOGIN */}
              <div className="border-t border-[#1d3321]/10 pt-4">
                <Link
                  href="/auth/login"
                  onClick={closeMenu}
                  className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-bold text-[#1d3321] hover:bg-gray-50 transition-colors"
                >
                  <FiLogIn size={18} />
                  Log in
                </Link>
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
            </>
          )}

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