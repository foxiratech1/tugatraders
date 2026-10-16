// import Hero from "@/components/HomePage/Hero";
// import TrustSection from "@/components/HomePage/TrustSection";
// import ConnectSelectSection from "@/components/HomePage/ConnectSelectSection";
// import CategorySection from "@/components/HomePage/CategorySection";
// import MapSearchSection from "@/components/HomePage/MapSearchSection";
// import HowItWorks from "@/components/HomePage/HowItWorks";
// import ReviewSection from "@/components/HomePage/ReviewSection";
// import PlatformRoleSection from "@/components/HomePage/PlatformRoleSection";
// import FinalCTASection from "@/components/HomePage/FinalCTASection";
// import ConditionalSection from "@/components/ConditionalSection";
// import CTASection from '@/components/About/CTASection';

// export default function Home() {
//   return (
//     <main className="min-h-screen bg-white">
//       <Hero />

//       <ConditionalSection hideForRole="trader">
//         <CategorySection />
//       </ConditionalSection>

//       <ConditionalSection hideForRole="trader">
//         <HowItWorks />
//       </ConditionalSection>

//       <PlatformRoleSection />

//       <ConditionalSection hideForRole="trader">
//         <TrustSection />
//       </ConditionalSection>


//       <ConditionalSection hideForRole="trader">
//         <ConnectSelectSection />
//       </ConditionalSection>







//       {/* <ConditionalSection hideForRole="trader">
//         <MapSearchSection />
//       </ConditionalSection> */}

//       <ConditionalSection hideForRole="trader">
//         <ReviewSection />
//       </ConditionalSection>

//       <ConditionalSection hideForRole="trader">
//         <CTASection />
//       </ConditionalSection>

//       {/* <ConditionalSection hideForRole="trader">
//         <FinalCTASection />
//       </ConditionalSection> */}
//     </main>
//   );
// }


import Hero from "@/components/HomePage/Hero";
import TrustSection from "@/components/HomePage/TrustSection";
import ConnectSelectSection from "@/components/HomePage/ConnectSelectSection";
import CategorySection from "@/components/HomePage/CategorySection";
import MapSearchSection from "@/components/HomePage/MapSearchSection";
import HowItWorks from "@/components/HomePage/HowItWorks";
import ReviewSection from "@/components/HomePage/ReviewSection";
import PlatformRoleSection from "@/components/HomePage/PlatformRoleSection";
import FinalCTASection from "@/components/HomePage/FinalCTASection";
import ConditionalSection from "@/components/ConditionalSection";
import CTASection from '@/components/About/CTASection';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero section - full width */}
      <Hero />

      {/* Common width container for other sections (1440px) */}
      <div className="max-w-[1440px] mx-auto w-full">
        <ConditionalSection hideForRole="trader">
          <CategorySection />
        </ConditionalSection>

        <ConditionalSection hideForRole="trader">
          <HowItWorks />
        </ConditionalSection>

        <PlatformRoleSection />

        <ConditionalSection hideForRole="trader">
          <TrustSection />
        </ConditionalSection>

        <ConditionalSection hideForRole="trader">
          <ConnectSelectSection />
        </ConditionalSection>

        {/* <ConditionalSection hideForRole="trader">
          <MapSearchSection />
        </ConditionalSection> */}

        <ConditionalSection hideForRole="trader">
          <ReviewSection />
        </ConditionalSection>

        <ConditionalSection hideForRole="trader">
          <CTASection />
        </ConditionalSection>

        {/* <ConditionalSection hideForRole="trader">
          <FinalCTASection />
        </ConditionalSection> */}
      </div>
    </main>
  );
}
