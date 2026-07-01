import type { Metadata } from "next";
import CustomerNavbar from "@/components/Customer/CustomerNavbar";

export const metadata: Metadata = {
  title: "Customer Dashboard | TugaTrades",
  description: "Customer dashboard for managing jobs, profile, and settings.",
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomerNavbar />
      {/* Push content below the fixed navbar (height ~96px) */}
      <div className=" flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
