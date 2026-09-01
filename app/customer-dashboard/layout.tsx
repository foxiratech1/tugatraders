"use client";

import CustomerNavbar from "@/components/Customer/CustomerNavbar";
import AuthGuard from "@/components/Guards/AuthGuard";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-[#F8F9F5]">
        <CustomerNavbar />
        {/* Push content below the fixed navbar (height ~96px) */}
        <div className=" flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
