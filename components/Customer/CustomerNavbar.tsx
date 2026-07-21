"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Inbox, Briefcase, Bookmark, User, Star, Settings, Bell, FileText, Mail } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { authApi } from "@/app/api/authApi";
import { ChevronDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearTokens } from "@/utils/auth";

export default function CustomerNavbar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout API error', err);
    }
    localStorage.removeItem('user');
    clearTokens();
    window.location.replace('/');
  };

  // Navigation items mapping
  const navLinks = [
    { name: "Inbox", href: "/customer-dashboard/inbox", icon: Inbox },
    { name: "Jobs", href: "/customer-dashboard/job-history", icon: Briefcase },
    // { name: "Quotes", href: "/customer-dashboard/quotes", icon: FileText },
    { name: "Saved", href: "/customer-dashboard/saved", icon: Bookmark },
    // { name: "Profile", href: "/customer-dashboard/profile", icon: User },
    { name: "Reviews", href: "/customer-dashboard/reviews", icon: Star },
    { name: "Account", href: "/customer-dashboard/account", icon: Settings },
  ];
  const fetchNotifications = async () => {
    try {
      const res = await authApi.getMyNotifications();
      const notifList = res?.data || res || [];
      if (Array.isArray(notifList)) {
        setNotifications(notifList);
        const unread = notifList.filter((n: any) => !n.isRead && !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await authApi.markNotificationsReadAll();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await authApi.getMyProfile();
        console.log("Profile Response:", res?.data || res);
        console.log("Profile Image:", (res?.data || res)?.profileImage);
        console.log("Avatar:", (res?.data || res)?.avatar);
        console.log("Profile Response:", res);
        setProfile(res?.data || res);
        console.log(res?.data || res);
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };

    loadProfile();
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 60000);

    const handleOutsideClick = (e: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const imageUrl = profile?.profileImage
    ? new URL(
      profile.profileImage,
      process.env.NEXT_PUBLIC_API_URL
    ).toString()
    : "/customerNavLogo.png";

  console.log("Image URL:", imageUrl);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#F0EDE8] py-4 px-6 md:px-10 flex items-center justify-between">

      {/* Left: Logo */}
      <Link href="/customer-dashboard/jobs" className="flex items-center flex-shrink-0">
        <Image
          src="/customerNavLogo.png"
          alt="TugaTrades Customer Logo"
          width={180}
          height={40}
          className="h-10 w-auto object-contain"
        />
      </Link>

      {/* Middle: Navigation Pill */}
      <div className="hidden lg:flex items-center bg-[#F9F9F9] rounded-full p-1 border border-[#F0EDE8]">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold transition-colors ${isActive
                ? "bg-[#1C2C1C] text-white shadow-sm"
                : "text-[#1C2C1C]/60 hover:text-[#1C2C1C] hover:bg-gray-100/50"
                }`}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-white" : "text-[#1C2C1C]/50"} />
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Right: Actions & User Profile */}
      <div className="flex items-center gap-6">

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative w-10 h-10 rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center text-[#1C2C1C]/60 hover:bg-gray-50 transition-colors"
          >
            <Bell size={18} strokeWidth={2} />
            {/* Notification Dot */}
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#E53935] border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-xl py-3 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100">
                <span className="font-bold text-[14px] text-[#1C2C1C]">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[12px] font-semibold text-[#6E9625] hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-[13px]">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setShowNotifDropdown(false);
                        router.push(`/customer-dashboard/notifications?id=${n.id}`);
                      }}
                      className={`cursor-pointer px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${!n.isRead && !n.read ? "bg-[#6E9625]/5" : ""
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-[13px] text-[#1C2C1C] break-words">
                          {n.title || "Notification"}
                        </span>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {new Date(n.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <p className="text-[12px] text-gray-600 mt-1 leading-relaxed break-words">
                        {n.message || n.content || n.body}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="w-[1px] h-8 bg-[#E5E5E5] hidden sm:block" />

        {/* User Profile Info */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
              <img
                key={imageUrl}
                src={imageUrl}
                crossOrigin="anonymous"
                loading="eager"
                referrerPolicy="no-referrer"
                alt={profile?.fullName || "User"}
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <div className="hidden sm:flex flex-col">
              <span className="text-[13px] font-black text-[#1C2C1C] leading-tight">
                {profile?.fullName?.toUpperCase() || "CUSTOMER"}
              </span>

              <span className="text-[12px] font-medium text-[#1C2C1C]/50 mt-0.5">
                {profile?.role || "Customer"}
              </span>
            </div>

            <ChevronDown size={16} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
              <Link
                href="/customer-dashboard/profile"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
