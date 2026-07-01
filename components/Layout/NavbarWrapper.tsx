"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/layout/Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  // Hide the generic Navbar on any customer dashboard routes
  if (pathname?.startsWith("/customer-dashboard")) {
    return null;
  }
  return <Navbar />;
}
