import type { Metadata } from "next";
import TraderNavbar from "@/components/Trader/TraderNavbar";
import TraderAuthGuard from "@/components/Trader/TraderAuthGuard";

export const metadata: Metadata = {
  title: "Trader Dashboard | TugaTrades",
  description: "Manage your jobs, leads, reviews and profile on TugaTrades.",
};

export default function TraderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TraderAuthGuard>
      <div className="min-h-screen flex flex-col bg-[#F0EDE8]">
        <TraderNavbar />
        {/* Push content below the fixed two-tier navbar (36px top bar + 60px main bar) */}
        <div className="pt-[96px] flex-1 flex flex-col bg-[#F8F9F5]">{children}</div>
      </div>
    </TraderAuthGuard>
  );
}           
