import Hero from "@/components/HomePage/Hero";
import TrustSection from "@/components/HomePage/TrustSection";
import CategorySection from "@/components/HomePage/CategorySection";
import MapSearchSection from "@/components/HomePage/MapSearchSection";
import HowItWorks from "@/components/HomePage/HowItWorks";
import SafetySection from "@/components/HomePage/SafetySection";
import ReviewSection from "@/components/HomePage/ReviewSection";
import PlatformRoleSection from "@/components/HomePage/PlatformRoleSection";
import FinalCTASection from "@/components/HomePage/FinalCTASection";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <TrustSection />
      <CategorySection />
      <HowItWorks />
      <SafetySection />
      <PlatformRoleSection />
      <MapSearchSection />
      <ReviewSection />
      <FinalCTASection />
    </main>
  );
}
