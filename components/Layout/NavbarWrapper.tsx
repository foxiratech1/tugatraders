"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/layout/Navbar";
import TraderNavbar from "@/components/Trader/TraderNavbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  // Hide the generic Navbar on any customer dashboard or trader routes
  if (
    pathname?.startsWith("/customer-dashboard") ||
    pathname?.startsWith("/trader")
  ) {
    return null;
  }

  // Use TraderNavbar for trader signup steps after step 1
  if (
    pathname === "/auth/trader-signup/step-2" ||
    pathname === "/auth/trader-signup/step-3"
  ) {
    return <TraderNavbar />;
  }

  return <Navbar />;
}
