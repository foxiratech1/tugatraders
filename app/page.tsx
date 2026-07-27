import Hero from "@/components/HomePage/Hero";
import TrustSection from "@/components/HomePage/TrustSection";
import CategorySection from "@/components/HomePage/CategorySection";
import MapSearchSection from "@/components/HomePage/MapSearchSection";
import HowItWorks from "@/components/HomePage/HowItWorks";
import SafetySection from "@/components/HomePage/SafetySection";
import ReviewSection from "@/components/HomePage/ReviewSection";
import PlatformRoleSection from "@/components/HomePage/PlatformRoleSection";
import FinalCTASection from "@/components/HomePage/FinalCTASection";
import ConditionalSection from "@/components/ConditionalSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <TrustSection />
      
      <ConditionalSection hideForRole="trader">
        <CategorySection />
      </ConditionalSection>
      
      <ConditionalSection hideForRole="trader">
        <HowItWorks />
      </ConditionalSection>
      
      <SafetySection />
      <PlatformRoleSection />
      
      <ConditionalSection hideForRole="trader">
        <MapSearchSection />
      </ConditionalSection>
      
      <ConditionalSection hideForRole="trader">
        <ReviewSection />
      </ConditionalSection>
      
      <ConditionalSection hideForRole="trader">
        <FinalCTASection />
      </ConditionalSection>
    </main>
  );
}

